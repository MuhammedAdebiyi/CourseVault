from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Course, PDF
from .serializers import CourseSerializer, PDFSerializer

class CourseViewSet(viewsets.ModelViewSet):
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Show only the courses owned by the currently logged-in user
        return Course.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        # Automatically assign course owner to the logged-in user
        serializer.save(owner=self.request.user)


class PDFViewSet(viewsets.ModelViewSet):
    serializer_class = PDFSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only allow user to access PDFs from their own courses
        return PDF.objects.filter(course__owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save()
