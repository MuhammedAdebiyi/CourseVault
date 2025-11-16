from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import (
    RegisterSerializer,
    VerifyEmailSerializer,
    CustomTokenObtainPairSerializer
)
from .models import EmailVerificationCode, CustomUser
from .email import send_verification_email


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]  # public endpoint

    def perform_create(self, serializer):
        user = serializer.save()
        # send verification email with the latest code
        code_obj = EmailVerificationCode.objects.filter(user=user).order_by("-created_at").first()
        if code_obj:
            send_verification_email(user, code_obj)


class VerifyEmailView(generics.GenericAPIView):
    serializer_class = VerifyEmailSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Return tokens so frontend can login automatically
        refresh = RefreshToken.for_user(user)
        return Response({
            "message": "Email verified",
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_200_OK)


class ResendCodeView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"detail": "email required"}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"detail": "No user with that email"}, status=404)

        # Rate limiting: avoid more than 3 codes in last hour
        one_hour_ago = timezone.now() - timedelta(hours=1)
        recent_count = EmailVerificationCode.objects.filter(user=user, created_at__gte=one_hour_ago).count()
        if recent_count >= 3:
            return Response({"detail": "Too many requests, try later"}, status=429)

        code_obj = EmailVerificationCode.create_for_user(user)
        send_verification_email(user, code_obj)
        return Response({"detail": "Verification code resent"}, status=200)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
