from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
import uuid
from django.utils import timezone
from datetime import timedelta
from secrets import randbelow

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self):
        return self.email

class EmailVerificationCode(models.Model):
    user = models.ForeignKey("accounts.CustomUser", on_delete=models.CASCADE, related_name="verifications")
    code = models.CharField(max_length=6, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    used = models.BooleanField(default=False)
    idempotency = models.UUIDField(default=uuid.uuid4, editable=False)

    class Meta:
        indexes = [
            models.Index(fields=["code"]),
            models.Index(fields=["user", "created_at"]),
        ]

    def is_expired(self):
        return timezone.now() > self.expires_at

    @classmethod
    def create_for_user(cls, user, ttl_minutes=10):
        code = f"{randbelow(1000000):06d}"
        return cls.objects.create(
            user=user,
            code=code,
            expires_at=timezone.now() + timedelta(minutes=ttl_minutes)
        )
