from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, EmailVerificationCode
from django.utils import timezone
from django.core.cache import cache
from datetime import timedelta
import logging

logger = logging.getLogger("accounts")

# Limits
MAX_ATTEMPTS = 5
MAX_LOGIN_ATTEMPTS = 5
LOCKOUT_TIME = 15 * 60  # 15 mins lockout


# ===============================================================
# REGISTER
# ===============================================================
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ["email", "name", "password", "confirm_password"]

    def validate_email(self, value):
        email = value.lower().strip()
        existing_user = CustomUser.objects.filter(email=email).first()

        if existing_user:
            if existing_user.email_verified:
                raise serializers.ValidationError(
                    "This email is already registered. Please login."
                )
            else:
                # User exists but is NOT verified
                return serializers.ValidationError({
                    "error_type": "unverified_email",
                    "message": "This email is already registered but not verified. Please verify your email.",
                    "email": email
                })

        return email

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match"
            })
        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")
        email = validated_data["email"].lower().strip()

        user = CustomUser.objects.create_user(
            email=email,
            name=validated_data["name"],
            password=validated_data["password"]
        )

        # --- FIRST MONTH FREE ---
        user.subscription_active = True
        user.subscription_due_date = timezone.now().date() + timedelta(days=30)
        user.save()

        # Create verification code
        EmailVerificationCode.create_for_user(user)

        logger.info(f"User registered: {user.email}")
        return user


# ===============================================================
# VERIFY EMAIL
# ===============================================================
class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)

    def validate(self, attrs):
        email = attrs["email"].lower().strip()
        code = attrs["code"]

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Invalid verification code.")

        if user.email_verified:
            raise serializers.ValidationError("Email is already verified. Please login.")

        verification = EmailVerificationCode.objects.filter(
            user=user, code=code, used=False
        ).order_by("-created_at").first()

        if not verification:
            raise serializers.ValidationError("Invalid verification code.")

        if verification.is_expired():
            raise serializers.ValidationError("Verification code has expired.")

        if verification.attempts >= 3:
            verification.used = True
            verification.save()
            raise serializers.ValidationError(
                "Too many failed attempts. Please request a new verification code."
            )

        verification.attempts += 1
        verification.save()

        attrs["user"] = user
        attrs["verification"] = verification
        return attrs

    def save(self):
        user = self.validated_data["user"]
        verification = self.validated_data["verification"]

        user.email_verified = True
        user.save()

        verification.used = True
        verification.save()

        cache.delete(f"resend_code_{user.email}")

        logger.info(f"Email verified for {user.email}")
        return user


# ===============================================================
# RESEND CODE (RATE LIMITED)
# ===============================================================
class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        email = value.lower().strip()

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("No account found with this email.")

        if user.email_verified:
            raise serializers.ValidationError("This email is already verified. Please login.")

        # Rate limit: max 3 per hour
        cache_key = f"resend_code_{email}"
        resend_count = cache.get(cache_key, 0)

        if resend_count >= 3:
            raise serializers.ValidationError(
                "Too many verification requests. Try again in 1 hour."
            )

        return email

    def save(self):
        email = self.validated_data["email"]
        user = CustomUser.objects.get(email=email)

        EmailVerificationCode.objects.filter(user=user, used=False).update(used=True)
        code = EmailVerificationCode.create_for_user(user)

        cache_key = f"resend_code_{email}"
        resend_count = cache.get(cache_key, 0)
        cache.set(cache_key, resend_count + 1, timeout=3600)

        logger.info(f"Resent verification code to {email} → {code.code}")
        return {"message": "Verification code resent."}


# ===============================================================
# JWT LOGIN (CHECK VERIFIED + RATE LIMIT)
# ===============================================================
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        email = attrs.get("email").lower().strip()
        password = attrs.get("password")

        # Brute-force rate limit
        cache_key = f"login_attempts_{email}"
        attempts = cache.get(cache_key, 0)

        if attempts >= MAX_LOGIN_ATTEMPTS:
            raise serializers.ValidationError(
                f"Too many login attempts. Try again in {LOCKOUT_TIME // 60} minutes."
            )

        try:
            user = CustomUser.objects.get(email=email)
            if not user.email_verified:
                raise serializers.ValidationError({
                    "error_type": "email_not_verified",
                    "message": "Please verify your email before logging in.",
                    "email": email
                })
        except CustomUser.DoesNotExist:
            pass  # let normal invalid creds handle it

        user = authenticate(email=email, password=password)

        if not user:
            cache.set(cache_key, attempts + 1, LOCKOUT_TIME)
            raise serializers.ValidationError("Invalid credentials.")

        cache.delete(cache_key)

        data = super().validate(attrs)
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "name": user.name
        }

        return data


# ===============================================================
# MANUAL LOGIN SERIALIZER (IF YOU USE IT IN VIEWS)
# ===============================================================
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data["email"].lower().strip()
        password = data["password"]

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Invalid email or password.")

        if not user.email_verified:
            raise serializers.ValidationError({
                "error_type": "email_not_verified",
                "message": "Please verify your email before logging in.",
                "email": email
            })

        user = authenticate(email=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        data["user"] = user
        return data


# ===============================================================
# USER SERIALIZERS
# ===============================================================
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

# -----------------------
# Password reset serializers
# -----------------------
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_email(self, value):
        if not CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("User with this email does not exist.")
        return value

    def save(self, **kwargs):
        email = self.validated_data["email"]
        code = self.validated_data["code"]
        new_password = self.validated_data["new_password"]

        from .models import EmailVerificationCode, CustomUser
        try:
            user = CustomUser.objects.get(email=email)
            code_obj = EmailVerificationCode.objects.get(user=user, code=code)
        except (CustomUser.DoesNotExist, EmailVerificationCode.DoesNotExist):
            raise serializers.ValidationError("Invalid code or email.")

        user.set_password(new_password)
        user.save()
        # Delete used code
        code_obj.delete()
        return user