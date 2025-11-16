from django.contrib import admin
from .models import CustomUser, EmailVerificationCode

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'name', 'email_verified', 'is_staff', 'is_active')

@admin.register(EmailVerificationCode)
class EmailVerificationCodeAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'created_at', 'expires_at', 'used', 'attempts')
    readonly_fields = ('created_at', 'expires_at', 'idempotency')
