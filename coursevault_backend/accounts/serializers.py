from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, EmailVerificationCode
from django.utils import timezone
from django.core.cache import cache
import logging

MAX_ATTEMPTS = 5
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_TIME = 15 * 60  

logger = logging.getLogger("accounts")


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ["email", "name", "password"]

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            name=validated_data["name"]
        )

    # --- FIRST MONTH FREE ---
        from django.utils import timezone
        from datetime import timedelta

        user.subscription_active = True  
        user.subscription_due_date = timezone.now().date() + timedelta(days=30)
        user.save()


        # Generate a verification code
        EmailVerificationCode.create_for_user(user)
        logger.info(f"User registered: {user.email} at {timezone.now()}")
        return user


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate(self, attrs):
        email = attrs.get("email")
        code = attrs.get("code")

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found")

        try:
            verification = EmailVerificationCode.objects.filter(
                user=user, used=False
            ).latest("created_at")
        except EmailVerificationCode.DoesNotExist:
            raise serializers.ValidationError("No active verification code found")

        if verification.is_expired():
            raise serializers.ValidationError("Verification code expired")

        if verification.attempts >= MAX_ATTEMPTS:
            verification.used = True
            verification.save(update_fields=["used"])
            raise serializers.ValidationError("Maximum attempts exceeded")

        if verification.code != code:
            verification.attempts += 1
            verification.save(update_fields=["attempts"])
            raise serializers.ValidationError("Invalid verification code")

        # Code is valid
        verification.used = True
        verification.save(update_fields=["used"])
        user.email_verified = True
        user.save(update_fields=["email_verified"])

        attrs["user"] = user
        attrs["record"] = verification

        logger.info(f"Email verified for user: {user.email} at {timezone.now()}")
        return attrs

    def save(self):
        return self.validated_data["user"]


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        cache_key = f"login_attempts_{email}"
        attempts = cache.get(cache_key, 0)

        if attempts >= MAX_LOGIN_ATTEMPTS:
            raise serializers.ValidationError(
                f"Too many login attempts. Try again in {LOCKOUT_TIME // 60} minutes."
            )

        user = authenticate(email=email, password=password)

        if not user:
            cache.set(cache_key, attempts + 1, LOCKOUT_TIME)
            logger.warning(f"Failed login attempt for {email} at {timezone.now()}")
            raise serializers.ValidationError("Invalid credentials")

        if not user.email_verified:
            raise serializers.ValidationError("Email not verified")

        # Reset failed attempts on successful login
        cache.delete(cache_key)
        logger.info(f"User logged in: {email} at {timezone.now()}")

        data = super().validate(attrs)
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "name": user.name
        }
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        code = attrs.get("code")
        new_password = attrs.get("new_password")

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found")

        try:
            code_obj = EmailVerificationCode.objects.get(user=user, code=code, used=False)
        except EmailVerificationCode.DoesNotExist:
            raise serializers.ValidationError("Invalid code")

        if code_obj.is_expired():
            raise serializers.ValidationError("Code expired")

        attrs["user"] = user
        attrs["code_obj"] = code_obj
        return attrs

    def save(self):
        user = self.validated_data["user"]
        code_obj = self.validated_data["code_obj"]
        new_password = self.validated_data["new_password"]

        user.set_password(new_password)
        user.save()

        code_obj.used = True
        code_obj.save()

        logger.info(f"Password reset for user: {user.email} at {timezone.now()}")
        return user


class ResendVerificationCodeSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.get("email")

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found")

        if user.email_verified:
            raise serializers.ValidationError("Email already verified")

        attrs["user"] = user
        return attrs

    def save(self):
        user = self.validated_data["user"]
        EmailVerificationCode.create_for_user(user)
        logger.info(f"Resent verification code to user: {user.email} at {timezone.now()}")
        return {"message": "Verification code resent"}

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "email", "name", "email_verified"]
        read_only_fields = ["id", "email", "email_verified"]

        
class PublicUserSerializer(serializers.ModelSerializer):
    public_folders = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ["id", "name", "public_folders"]

    def get_public_folders(self, user):
        from folders.models import Folder
        from folders.serializers import FolderSerializer

        public_folders = Folder.objects.filter(owner=user, is_public=True)
        return FolderSerializer(public_folders, many=True, context=self.context).data
