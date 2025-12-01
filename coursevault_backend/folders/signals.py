from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import IntegrityError
import logging

from django.contrib.auth.models import User
from .models import UserProfile

logger = logging.getLogger(__name__)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if not created:
        return

    try:
        UserProfile.objects.get_or_create(user=instance)
    except IntegrityError as exc:
        logger.exception("IntegrityError while creating UserProfile for %s: %s", instance.id, exc)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if hasattr(instance, "profile"):
        instance.profile.save()
