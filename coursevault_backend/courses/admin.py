from django.contrib import admin
from .models import Course, PDF

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'slug', 'owner', 'is_public')
    prepopulated_fields = {'slug': ('title',)}

@admin.register(PDF)
class PDFAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'uploaded_at', 'file')
