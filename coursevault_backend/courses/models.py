from django.db import models
from accounts.models import CustomUser

class Folder(models.Model):
    title = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    owner = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    is_public = models.BooleanField(default=True)

    def __str__(self):
        return self.title


class PDF(models.Model):
    folder = models.ForeignKey(Folder, related_name="pdfs", on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to="pdfs/")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
