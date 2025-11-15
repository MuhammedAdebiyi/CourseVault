from rest_framework import serializers
from .models import Course, PDF

class PDFSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDF
        fields = "__all__"

class CourseSerializer(serializers.ModelSerializer):
    pdfs = PDFSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = "__all__"
