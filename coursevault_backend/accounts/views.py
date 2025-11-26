from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.utils import timezone
from datetime import timedelta
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.cache import cache
import logging
from .models import CustomUser
from .serializers import PublicUserSerializer
from rest_framework.permissions import IsAuthenticated
import boto3
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.core.cache import cache
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .serializers import CustomTokenObtainPairSerializer
import logging
from .models import CustomUser, EmailVerificationCode
from folders.models import PDF, Folder
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .serializers import (
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    RegisterSerializer,
    VerifyEmailSerializer,
    CustomTokenObtainPairSerializer
)
from .tasks import send_verification_email_task
from .email import send_verification_email

logger = logging.getLogger("accounts")


MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_TIME = 15 * 60  
MAX_OTP_REQUESTS_PER_HOUR = 3


class CustomerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Fetch folders (only root folders - no parent)
        folders = Folder.objects.filter(owner=user, parent__isnull=True)
        folder_data = [
            {
                "id": f.id,
                "title": f.title,
                "slug": f.slug,
                "files_count": f.pdfs.count(),  # FIXED: Changed from pdf_set to pdfs
                "last_updated": f.updated_at.isoformat() if hasattr(f, 'updated_at') else None,
            }
            for f in folders
        ]

        # Fetch stats
        total_pdfs = PDF.objects.filter(folder__owner=user).count()
        total_folders = Folder.objects.filter(owner=user).count()

        # Subscription info
        subscription_status = "Expired"
        if getattr(user, "subscription_expires_at", None):
            if user.subscription_expires_at > timezone.now():
                subscription_status = "Active"

        return Response({
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "email_verified": user.email_verified,
                "is_premium": getattr(user, "is_premium", False)
            },
            "folders": folder_data,
            "stats": {
                "pdf_count": total_pdfs,
                "folder_count": total_folders,
            },
            "subscription": subscription_status
        })


class RegisterView(generics.CreateAPIView):
    """
    Register a new user and send verification email.
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        code_obj = EmailVerificationCode.objects.filter(user=user).order_by("-created_at").first()
        if code_obj:
            send_verification_email_task.delay(user.id, code_obj.id)
        logger.info(f"User registered: {user.email} at {timezone.now()}")


@method_decorator(csrf_exempt, name="dispatch")
class VerifyEmailView(generics.GenericAPIView):
    """
    Verify user's email with code and return JWT tokens.
    """
    serializer_class = VerifyEmailSerializer
    permission_classes = [AllowAny]  
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get("email")
        code = serializer.validated_data.get("code")

        # 1. Check if user exists
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # 2. Check verification code
        try:
            verification = EmailVerificationCode.objects.get(
                user=user, code=code
            )
        except EmailVerificationCode.DoesNotExist:
            return Response({"error": "Invalid verification code"}, status=400)

        # 3. Check expiration
        if timezone.now() > verification.created_at + timedelta(minutes=10):
            verification.delete()
            return Response({"error": "Code has expired"}, status=400)

        # 4. Mark email verified
        user.email_verified = True
        user.save()
        verification.delete()

        # 5. Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        logger.info(f"Email verified: {user.email}")

        return Response({
            "message": "Email verified successfully!",
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=200)

@method_decorator(csrf_exempt, name="dispatch")
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom login view with rate limiting and better error messages
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email", "")
        cache_key = f"login_attempts_{email}"
        attempts = cache.get(cache_key, 0)

        # Check if user is locked out
        if attempts >= MAX_LOGIN_ATTEMPTS:
            logger.warning(f"Account locked: {email} at {timezone.now()}")
            return Response(
                {
                    "detail": f"Too many login attempts. Try again in {LOCKOUT_TIME // 60} minutes.",
                    "error": "account_locked"
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )

        # Try to authenticate
        try:
            response = super().post(request, *args, **kwargs)
            
            # Successful login - clear attempts
            cache.delete(cache_key)
            logger.info(f"User logged in: {email} at {timezone.now()}")
            
            return response
            
        except Exception as e:
            # Failed login - increment attempts
            cache.set(cache_key, attempts + 1, LOCKOUT_TIME)
            remaining_attempts = MAX_LOGIN_ATTEMPTS - (attempts + 1)
            
            logger.warning(f"Failed login attempt for {email} at {timezone.now()}")
            
            # Return consistent error format
            error_message = "Invalid email or password"
            if remaining_attempts > 0 and remaining_attempts <= 2:
                error_message = f"Invalid email or password. {remaining_attempts} attempts remaining."
            
            return Response(
                {
                    "detail": error_message,
                    "error": "invalid_credentials",
                    "attempts_remaining": max(0, remaining_attempts)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

@method_decorator(csrf_exempt, name="dispatch")
class ResendCodeView(APIView):  
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email required"}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"detail": "No user with that email"}, status=404)

        # anti-spam limit: max requests/hour
        one_hour_ago = timezone.now() - timedelta(hours=1)
        recent_count = EmailVerificationCode.objects.filter(
            user=user, created_at__gte=one_hour_ago
        ).count()

        if recent_count >= MAX_OTP_REQUESTS_PER_HOUR:
            return Response({"detail": "Too many requests, try later"}, status=429)

        # delete old verification codes
        EmailVerificationCode.objects.filter(user=user).delete()

        # create new code
        code_obj = EmailVerificationCode.create_for_user(user)
        code_obj.attempts = 0
        code_obj.save(update_fields=["attempts"])

        # send email async
        send_verification_email_task.delay(user.id, code_obj.id)

        logger.info(f"Verification code resent to {user.email} at {timezone.now()}")

        return Response({
            "detail": "Verification code resent",
            "wait": 30  # frontend cooldown timer
        }, status=200)

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            # Don't reveal if email exists or not for security
            return Response({"detail": "If this email exists, a reset code has been sent."}, status=200)

        # Delete old codes for this user
        EmailVerificationCode.objects.filter(user=user).delete()
        
        # Create new code (remove purpose parameter)
        code_obj = EmailVerificationCode.create_for_user(user)
        
        # Send email with the code
        send_verification_email_task.delay(user.id, code_obj.id)

        logger.info(f"Password reset requested for {user.email} at {timezone.now()}")
        return Response({"detail": "Password reset code sent to your email."}, status=200)
class PasswordResetConfirmView(APIView):
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        logger.info(f"Password reset successfully for {serializer.validated_data['email']} at {timezone.now()}")
        return Response({"message": "Password reset successfully"}, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "email_verified": user.email_verified
        })

    def patch(self, request):
        user = request.user
        data = request.data
        if "name" in data:
            user.name = data["name"]
        if "email" in data and data["email"] != user.email:
            user.email = data["email"]
            user.email_verified = False  
        user.save()
        return Response({
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "email_verified": user.email_verified
        })
    
class PublicUserView(generics.RetrieveAPIView):
    permission_classes = []  # Public access
    serializer_class = PublicUserSerializer

    def get(self, request, user_id):
        user = get_object_or_404(CustomUser, id=user_id)
        return Response(self.serializer_class(user, context={"request": request}).data)