from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone
import uuid


class Folder(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    is_public = models.BooleanField(default=False)
    parent = models.ForeignKey(
        "self",
        related_name="children",
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Soft delete for trash
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    # Sharing
    share_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    shared_with = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='shared_folders',
        blank=True
    )

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['owner', '-updated_at']),
            models.Index(fields=['deleted_at']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(f"{self.title}-{uuid.uuid4().hex[:8]}")
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
    
    def soft_delete(self):
        """Mark folder as deleted"""
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """Restore deleted folder"""
        self.deleted_at = None
        self.save()
    
    @property
    def is_deleted(self):
        return self.deleted_at is not None


class PDF(models.Model):
    folder = models.ForeignKey(Folder, related_name="pdfs", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="pdfs/", max_length=1000)
    
    # Tags for organization
    tags = models.JSONField(default=list, blank=True)  # ["lecture", "important", "exam"]
    
    # Metadata
    description = models.TextField(blank=True)
    file_size = models.BigIntegerField(default=0)  # in bytes
    
    # Activity tracking
    uploaded_at = models.DateTimeField(auto_now_add=True)
    last_viewed = models.DateTimeField(null=True, blank=True)
    view_count = models.IntegerField(default=0)
    
    # Soft delete for trash
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    # Sharing
    share_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    is_public = models.BooleanField(default=False)

    class Meta:
        ordering = ['-uploaded_at']
        indexes = [
            models.Index(fields=['folder', '-uploaded_at']),
            models.Index(fields=['deleted_at']),
            models.Index(fields=['-last_viewed']),
        ]

    def __str__(self):
        return self.title
    
    def soft_delete(self):
        """Mark file as deleted"""
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """Restore deleted file"""
        self.deleted_at = None
        self.save()
    
    @property
    def is_deleted(self):
        return self.deleted_at is not None
    
    def record_view(self):
        """Increment view count and update last viewed"""
        self.view_count += 1
        self.last_viewed = timezone.now()
        self.save(update_fields=['view_count', 'last_viewed'])
    
    def add_tag(self, tag):
        """Add a tag if not already present"""
        if tag not in self.tags:
            self.tags.append(tag)
            self.save(update_fields=['tags'])
    
    def remove_tag(self, tag):
        """Remove a tag"""
        if tag in self.tags:
            self.tags.remove(tag)
            self.save(update_fields=['tags'])