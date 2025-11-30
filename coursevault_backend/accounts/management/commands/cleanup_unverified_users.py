"""
Create this file at: accounts/management/commands/cleanup_unverified_users.py

Run manually: python manage.py cleanup_unverified_users
Or setup as cron job to run daily
"""

from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from accounts.models import CustomUser, EmailVerificationCode


class Command(BaseCommand):
    help = 'Delete unverified users older than 7 days and expired verification codes'

    def handle(self, *args, **options):
        # Delete unverified users older than 7 days
        cutoff_date = timezone.now() - timedelta(days=7)
        
        unverified_users = CustomUser.objects.filter(
            email_verified=False,
            created_at__lt=cutoff_date
        )
        
        user_count = unverified_users.count()
        unverified_users.delete()
        
        self.stdout.write(
            self.style.SUCCESS(f'Deleted {user_count} unverified users')
        )
        
        # Delete expired verification codes older than 24 hours
        expired_cutoff = timezone.now() - timedelta(hours=24)
        
        expired_codes = EmailVerificationCode.objects.filter(
            expires_at__lt=expired_cutoff
        )
        
        code_count = expired_codes.count()
        expired_codes.delete()
        
        self.stdout.write(
            self.style.SUCCESS(f'Deleted {code_count} expired verification codes')
        )