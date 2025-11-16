from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import CustomUser, EmailVerificationCode
from django.utils import timezone

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
        # Generate a verification code
        EmailVerificationCode.create_for_user(user)
        return user


class VerifyEmailSerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate(self, attrs):
        email = attrs["email"]
        code = attrs["code"]

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("User not found")

        try:
            record = EmailVerificationCode.objects.filter(
                user=user, code=code, used=False
            ).latest("created_at")
        except EmailVerificationCode.DoesNotExist:
            raise serializers.ValidationError("Invalid verification code")

        if record.is_expired():
            raise serializers.ValidationError("Verification code expired")

        return {"user": user, "record": record}

    def save(self):
        user = self.validated_data["user"]
        record = self.validated_data["record"]

        user.email_verified = True
        user.save()

        record.used = True
        record.save()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        # Try to authenticate with email instead of username
        user = authenticate(email=email, password=password)

        if not user.email_verified:
            raise serializers.ValidationError("Email not verified")

        data = super().validate(attrs)
        data["user"] = {
            "id": user.id,
            "email": user.email,
            "name": user.name
        }

        return data
