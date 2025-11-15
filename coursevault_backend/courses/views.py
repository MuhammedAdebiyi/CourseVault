from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Folder, PDF
from .serializers import FolderSerializer, PDFSerializer

class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Show only folders owned by the logged-in user
        return Folder.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class PDFViewSet(viewsets.ModelViewSet):
    serializer_class = PDFSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only PDFs belonging to user's folders
        return PDF.objects.filter(folder__owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save()
