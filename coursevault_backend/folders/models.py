from django.db import models
from django.conf import settings
from django.utils.text import slugify
from django.utils import timezone
import uuid


class Folder(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='owned_folders')
    
    # Sharing
    is_public = models.BooleanField(default=False)
    share_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    added_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='library_folders',
        blank=True,
        through='FolderLibraryEntry'
    )
    
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
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-updated_at']
        indexes = [
            models.Index(fields=['owner', '-updated_at']),
            models.Index(fields=['deleted_at']),
            models.Index(fields=['is_public']),
            models.Index(fields=['slug']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            self.slug = f"{base_slug}-{uuid.uuid4().hex[:8]}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
    
    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        self.deleted_at = None
        self.save()
    
    @ property
    def pdf_count(self):
        return self.pdfs.filter(deleted_at___isnull=True).count()

    @property
    def is_deleted(self):
        return self.deleted_at is not None
    
    @property
    def share_url(self):
        return f"/share/{self.slug}"
    
    @property
    def library_count(self):
        return self.added_by.count()


class FolderLibraryEntry(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    folder = models.ForeignKey(Folder, on_delete=models.CASCADE)
    added_at = models.DateTimeField(auto_now_add=True)
    custom_name = models.CharField(max_length=255, blank=True)
    
    class Meta:
        unique_together = ('user', 'folder')
        ordering = ['-added_at']
        indexes = [
            models.Index(fields=['user', '-added_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} → {self.folder.title}"


class PDF(models.Model):
    folder = models.ForeignKey(Folder, related_name="pdfs", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="pdfs/", max_length=1000)
    
  
    extracted_text = models.TextField(blank=True, editable=False)
    text_extraction_status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed'),
        ],
        default='pending'
    )
    
    # Tags
    tags = models.JSONField(default=list, blank=True)
    
    # Metadata
    description = models.TextField(blank=True)
    file_size = models.BigIntegerField(default=0)
    page_count = models.IntegerField(default=0)
    
    # Activity tracking
    uploaded_at = models.DateTimeField(auto_now_add=True)
    last_viewed = models.DateTimeField(null=True, blank=True)
    view_count = models.IntegerField(default=0)
    
    # Soft delete
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
            models.Index(fields=['is_public']),
            models.Index(fields=['text_extraction_status']),
        ]

    def __str__(self):
        return self.title
    
    def soft_delete(self):
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        self.deleted_at = None
        self.save()
    
    @property
    def is_deleted(self):
        return self.deleted_at is not None
    
    def record_view(self):
        self.view_count += 1
        self.last_viewed = timezone.now()
        self.save(update_fields=['view_count', 'last_viewed'])
    
    def add_tag(self, tag):
        if tag not in self.tags:
            self.tags.append(tag)
            self.save(update_fields=['tags'])
    
    def remove_tag(self, tag):
        if tag in self.tags:
            self.tags.remove(tag)
            self.save(update_fields=['tags'])


class AIGeneratedQuestion(models.Model):
    pdf = models.ForeignKey(PDF, related_name='ai_questions', on_delete=models.CASCADE)
    question = models.TextField()
    options = models.JSONField()
    correct_answer = models.CharField(max_length=1)
    explanation = models.TextField(blank=True)
    difficulty = models.CharField(
        max_length=10,
        choices=[
            ('easy', 'Easy'),
            ('medium', 'Medium'),
            ('hard', 'Hard'),
        ],
        default='medium'
    )
    

    type = models.CharField(
        max_length=20,
        choices=[
            ('theory', 'Theory'),
            ('objective', 'Objective'),
        ],
        default='objective'
    )
    
    source_page = models.IntegerField(null=True, blank=True)
    source_text = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['pdf', '-created_at']),
        ]

    def __str__(self):
        return f"Q: {self.question[:50]}..."


class QuizAttempt(models.Model):
    """
    ✅ TRACK USER QUIZ ATTEMPTS
    """
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    pdf = models.ForeignKey(PDF, on_delete=models.CASCADE)
    
    # Results
    total_questions = models.IntegerField()
    correct_answers = models.IntegerField()
    score_percentage = models.FloatField()
    
    # Answers
    answers = models.JSONField()  # {"question_id": "A", ...}
    
    completed_at = models.DateTimeField(auto_now_add=True)
    time_taken_seconds = models.IntegerField(null=True, blank=True)
    
    class Meta:
        ordering = ['-completed_at']
        indexes = [
            models.Index(fields=['user', '-completed_at']),
            models.Index(fields=['pdf', '-completed_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.pdf.title} ({self.score_percentage}%)"


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    
    # Profile info
    display_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    
    # Profile URL
    username_slug = models.SlugField(unique=True, blank=True)
    
    # Settings
    is_profile_public = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)    
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['username_slug']),
        ]
    
    def save(self, *args, **kwargs):
        # Use user.name instead of user.username
        if not self.username_slug:
            self.username_slug = slugify(self.user.name)
        if not self.display_name:
            self.display_name = self.user.name
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.display_name}'s Profile"
    
    @property
    def profile_url(self):
        return f"/profile/{self.username_slug}"
    
    @property
    def public_folders_count(self):
        return self.user.owned_folders.filter(is_public=True, deleted_at__isnull=True).count()
