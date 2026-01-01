from celery import shared_task
from django.contrib.auth import get_user_model
from .models import EmailVerificationCode
from .email import send_verification_email, send_welcome_email
from django.db import transaction

User = get_user_model()

@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=10, retry_kwargs={'max_retries':3})
def send_verification_email_task(self, user_id, code_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        print(f"User {user_id} does not exist. Skipping verification email.")
        return

    try:
        code = EmailVerificationCode.objects.get(id=code_id)
    except EmailVerificationCode.DoesNotExist:
        print(f"Verification code {code_id} does not exist. Skipping email.")
        return

    send_verification_email(user, code)


@shared_task(bind=True, autoretry_for=(Exception,), retry_backoff=10, retry_kwargs={'max_retries':3})
def send_welcome_email_task(self, user_id):
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        print(f"User {user_id} does not exist. Skipping welcome email.")
        return

    send_welcome_email(user)
