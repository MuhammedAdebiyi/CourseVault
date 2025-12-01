import logging
from datetime import timedelta

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from django.core.cache import cache

from .models import CustomUser, EmailVerificationCode
from .serializers import (
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    LoginSerializer,
    ResendVerificationSerializer,
    RegisterSerializer,
    VerifyEmailSerializer,
    CustomTokenObtainPairSerializer,
    PublicUserSerializer,
)
from .tasks import send_verification_email_task
from .email import send_verification_email  # optional direct send

from folders.models import PDF, Folder

logger = logging.getLogger("accounts")

# Rate/lockout constants
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_TIME = 15 * 60  # seconds
MAX_OTP_REQUESTS_PER_HOUR = 3


# -----------------------
# Customer dashboard
# -----------------------
class CustomerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        folders = Folder.objects.filter(
            owner=user, 
            parent__isnull=True,
            deleted_at__isnull=True  
        )
        folder_data = [
            {
                "id": f.id,
                "title": f.title,
                "slug": f.slug,
                "files_count": f.pdfs.filter(deleted_at__isnull=True).count(),  # Also filter deleted PDFs
                "last_updated": f.updated_at.isoformat() if hasattr(f, "updated_at") else None,
            }
            for f in folders
        ]

        # Also filter deleted items in stats
        total_pdfs = PDF.objects.filter(
            folder__owner=user,
            deleted_at__isnull=True 
        ).count()
        
        total_folders = Folder.objects.filter(
            owner=user,
            deleted_at__isnull=True  
        ).count()

        subscription_status = "Expired"
        if getattr(user, "subscription_expires_at", None):
            if user.subscription_expires_at > timezone.now():
                subscription_status = "Active"

        return Response(
            {
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "email_verified": user.email_verified,
                    "is_premium": getattr(user, "is_premium", False),
                },
                "folders": folder_data,
                "stats": {"pdf_count": total_pdfs, "folder_count": total_folders},
                "subscription": subscription_status,
            }
        )



# -----------------------
# Registration (uses enhanced RegisterSerializer)
# -----------------------
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").lower().strip()
        
        # CHECK UNVERIFIED USER FIRST - BEFORE SERIALIZER
        existing_user = CustomUser.objects.filter(email=email).first()
        
        if existing_user and not existing_user.email_verified:
            # User exists but not verified - return special response
            return Response({
                "error_type": "unverified_email",
                "message": "This email is already registered but not verified. Please verify your email.",
                "email": email,
                "requires_verification": True
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Normal registration flow
        serializer = RegisterSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        user = serializer.save()

        # Send verification email async if you have a task
        code_obj = EmailVerificationCode.objects.filter(user=user).order_by("-created_at").first()
        if code_obj:
            try:
                send_verification_email_task.delay(user.id, code_obj.id)
            except Exception:
                # fallback to direct send (optional)
                try:
                    send_verification_email(user.email, code_obj.code)
                except Exception as exc:
                    logger.exception("Failed sending verification email: %s", exc)

        logger.info(f"User registered: {user.email} at {timezone.now()}")

        return Response({
            "message": "Registration successful! Please check your email for verification code.",
            "email": user.email,
            "requires_verification": True
        }, status=status.HTTP_201_CREATED)

# -----------------------
# Verify email
# -----------------------
class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = VerifyEmailSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()
        # Optionally create tokens upon verify:
        refresh = RefreshToken.for_user(user)

        logger.info(f"Email verified: {user.email} at {timezone.now()}")

        return Response(
            {
                "message": "Email verified successfully.",
                "email": user.email,
                "verified": True,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )


# -----------------------
# Token obtain (JWT) with login attempt lockout
# Keep this if you still want the TokenObtainPairView flow
# -----------------------
@method_decorator(csrf_exempt, name="dispatch")
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email", "")
        cache_key = f"login_attempts_{email}"
        attempts = cache.get(cache_key, 0)

        if attempts >= MAX_LOGIN_ATTEMPTS:
            logger.warning(f"Account locked: {email} at {timezone.now()}")
            return Response(
                {
                    "detail": f"Too many login attempts. Try again in {LOCKOUT_TIME // 60} minutes.",
                    "error": "account_locked",
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        try:
            response = super().post(request, *args, **kwargs)
            # Successful: reset count
            cache.delete(cache_key)
            logger.info(f"User logged in: {email} at {timezone.now()}")
            return response

        except Exception as e:
            # increment attempts on failure
            cache.set(cache_key, attempts + 1, LOCKOUT_TIME)
            remaining_attempts = MAX_LOGIN_ATTEMPTS - (attempts + 1)
            logger.warning(f"Failed login attempt for {email} at {timezone.now()}")
            error_message = "Invalid email or password"
            if remaining_attempts > 0 and remaining_attempts <= 2:
                error_message = f"Invalid email or password. {remaining_attempts} attempts remaining."

            return Response(
                {"detail": error_message, "error": "invalid_credentials", "attempts_remaining": max(0, remaining_attempts)},
                status=status.HTTP_400_BAD_REQUEST,
            )


# -----------------------
# Resend verification code (uses enhanced serializer, rate-limited)
# -----------------------
class ResendVerificationCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        verification = serializer.save()
        # send email
        try:
            send_verification_email_task.delay(verification.user.id, verification.id)
        except Exception:
            try:
                send_verification_email(verification.user.email, verification.code)
            except Exception as exc:
                logger.exception("Failed to send resend verification email: %s", exc)

        return Response(
            {"message": "Verification code resent successfully.", "email": request.data.get("email"), "expires_in_minutes": 10},
            status=status.HTTP_200_OK,
        )


# -----------------------
# Password reset: request + confirm
# -----------------------
class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            # Respond generically to avoid exposing user existence
            return Response({"detail": "If this email exists, a reset code has been sent."}, status=status.HTTP_200_OK)

        # Remove old codes and create a new one
        EmailVerificationCode.objects.filter(user=user).delete()
        code_obj = EmailVerificationCode.create_for_user(user)

        try:
            send_verification_email_task.delay(user.id, code_obj.id)
        except Exception:
            try:
                send_verification_email(user.email, code_obj.code)
            except Exception as exc:
                logger.exception("Failed to send password reset email: %s", exc)

        logger.info(f"Password reset requested for {user.email} at {timezone.now()}")
        return Response({"detail": "Password reset code sent to your email."}, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        logger.info(f"Password reset successfully for {serializer.validated_data.get('email')} at {timezone.now()}")
        return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)


# -----------------------
# User profile
# -----------------------
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(
            {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "email_verified": user.email_verified,
                "is_premium": user.is_premium,
                "trial_days_remaining": user.trial_days_remaining,
                "subscription_active": user.subscription_active,
                "subscription_due_date": user.subscription_due_date,
            }
        )

    def patch(self, request):
        user = request.user
        data = request.data
        if "name" in data:
            user.name = data["name"]
        if "email" in data and data["email"] != user.email:
            user.email = data["email"]
            user.email_verified = False
        user.save()
        return Response(
            {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "email_verified": user.email_verified,
                "is_premium": user.is_premium,
                "trial_days_remaining": user.trial_days_remaining,
            }
        )


# -----------------------
# Public user view
# -----------------------
class PublicUserView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = PublicUserSerializer

    def get(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)
        return Response(self.serializer_class(user, context={"request": request}).data)
