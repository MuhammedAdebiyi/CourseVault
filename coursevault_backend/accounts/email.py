from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

def send_verification_email(user, code_obj):
    subject = "Your CourseVault verification code"
    # Plain text body (simple). You can create HTML templates if desired.
    message = f"Hi {user.name or user.email.split('@')[0]},\n\n" \
              f"Your CourseVault verification code is: {code_obj.code}\n\n" \
              f"This code will expire shortly. If you didn't request this, ignore this email.\n\n" \
              "— CourseVault Team"
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
