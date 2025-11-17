from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings

def send_html_email(subject, template_name, context, recipient):
    html_content = render_to_string(template_name, context)
    text_content = strip_tags(html_content)

    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[recipient],
    )
    email.attach_alternative(html_content, "text/html")
    email.send()


def send_verification_email(user, code_obj):
    return send_html_email(
        subject="Your CourseVault Verification Code",
        template_name="emails/verification_email.html",
        context={"user": user, "code": code_obj.code},
        recipient=user.email,
    )


def send_welcome_email(user):
    return send_html_email(
        subject="Welcome to CourseVault ",
        template_name="emails/welcome_email.html",
        context={"user": user},
        recipient=user.email,
    )


def send_password_reset_email(user, token):
    return send_html_email(
        subject="Reset Your CourseVault Password",
        template_name="emails/password_reset_email.html",
        context={"user": user, "token": token},
        recipient=user.email,
    )
