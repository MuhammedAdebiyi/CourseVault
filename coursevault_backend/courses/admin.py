from django.contrib import admin
from .models import Folder, PDF

@admin.register(Folder)
class FolderAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'owner', 'is_public')
    prepopulated_fields = {'slug': ('title',)}


@admin.register(PDF)
class PDFAdmin(admin.ModelAdmin):
    list_display = ('title', 'folder', 'uploaded_at', 'file')
