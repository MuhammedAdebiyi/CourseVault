from celery import shared_task
from django.contrib.auth import get_user_model
from .models import EmailVerificationCode
from .email import send_verification_email, send_welcome_email

User = get_user_model()

@shared_task
def send_verification_email_task(user_id, code_id):
    user = User.objects.get(id=user_id)
    code = EmailVerificationCode.objects.get(id=code_id)
    send_verification_email(user, code)

@shared_task
def send_welcome_email_task(user_id):
    user = User.objects.get(id=user_id)
    send_welcome_email(user)
