from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.conf import settings
from .models import CustomUser, EmailVerificationCode
from .serializers import (
    RegisterSerializer,
    VerifyEmailSerializer,
    CustomTokenObtainPairSerializer
)
from .tasks import send_verification_email_task
from .email import send_verification_email


class RegisterView(generics.CreateAPIView):
    """
    Register a new user and send verification email.
    """
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        # Generate the latest verification code 
        code_obj = EmailVerificationCode.objects.filter(user=user).order_by("-created_at").first()
        if code_obj:
            # Send async email via Celery
            send_verification_email_task.delay(user.id, code_obj.id)
            # Optional sync fallback
            # send_verification_email(user, code_obj)


class VerifyEmailView(generics.GenericAPIView):
    """
    Verify user's email using the code.
    Returns JWT tokens upon success.
    """
    serializer_class = VerifyEmailSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        code = serializer.validated_data["code"]

        # Get user
        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # Get verification code
        try:
            verification = EmailVerificationCode.objects.get(user=user, code=code)
        except EmailVerificationCode.DoesNotExist:
            return Response({"error": "Invalid verification code"}, status=400)

        # Check expiration
        if timezone.now() > verification.created_at + timedelta(minutes=10):
            verification.delete()
            return Response({"error": "Code has expired"}, status=400)

        # Mark verified
        user.email_verified = True
        user.save()

        # Remove used code
        verification.delete()

        # Issue JWT
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Email verified successfully!",
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=200)

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT login using email. Requires verified email.
    """
    serializer_class = CustomTokenObtainPairSerializer


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

        # Rate limiting: max 3 codes per hour
        one_hour_ago = timezone.now() - timedelta(hours=1)
        recent_count = EmailVerificationCode.objects.filter(user=user, created_at__gte=one_hour_ago).count()
        if recent_count >= 3:
            return Response({"detail": "Too many requests, try later"}, status=429)

        # Create new code and reset attempts
        code_obj = EmailVerificationCode.create_for_user(user)
        code_obj.attempts = 0
        code_obj.save(update_fields=["attempts"])

        # Send email (async)
        send_verification_email_task.delay(user.id, code_obj.id)

        return Response({"detail": "Verification code resent"}, status=200)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found"}, status=404)

        # Create a verification code for password reset
        code_obj = EmailVerificationCode.create_for_user(user, purpose="password_reset")

        # Send email
        send_verification_email_task.delay(user.id, code_obj.id, purpose="password_reset")

        return Response({"detail": "Password reset code sent"}, status=200)


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password reset successfully"}, status=200)
