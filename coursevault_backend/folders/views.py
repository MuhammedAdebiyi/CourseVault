from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import Folder, PDF
from .serializers import FolderSerializer, FolderListSerializer, PDFSerializer
from accounts.serializers import UserSerializer
import boto3
import logging

logger = logging.getLogger("courses")

# -------------------------------
# Cloudflare R2 setup
# -------------------------------
r2_opts = settings.STORAGES["default"]["OPTIONS"]
s3_client = boto3.client(
    "s3",
    endpoint_url=r2_opts["endpoint_url"],
    aws_access_key_id=r2_opts["access_key"],
    aws_secret_access_key=r2_opts["secret_key"]
)
R2_BUCKET = r2_opts["bucket_name"]


def delete_file_from_r2(file_path):
    """Delete file from Cloudflare R2."""
    key = file_path.replace("pdfs/", "")
    try:
        s3_client.delete_object(Bucket=R2_BUCKET, Key=key)
        logger.info(f"Deleted {file_path} from R2")
    except Exception as e:
        logger.error(f"Failed to delete {file_path} from R2: {e}")


def generate_presigned_url(file_name, expires_in=3600):
    """Generate a temporary signed URL for a PDF."""
    key = file_name.replace("pdfs/", "")
    return s3_client.generate_presigned_url(
        'get_object',
        Params={'Bucket': R2_BUCKET, 'Key': key},
        ExpiresIn=expires_in
    )


# -------------------------------
# Folder CRUD
# -------------------------------
class FolderViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for folders
    """
    permission_classes = [IsAuthenticated]
    lookup_field = "slug"  # Important: frontend must use slug
     
    def get_serializer_class(self):
        if self.action == 'list':
            return FolderListSerializer
        return FolderSerializer

    def get_queryset(self):
        return Folder.objects.filter(owner=self.request.user).order_by('-id')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """Delete folder + PDFs + subfolders"""
        folder = self.get_object()

        # Delete all PDFs in folder
        for pdf in folder.pdfs.all():
            if pdf.file:
                pdf.file.delete(save=False)
            delete_file_from_r2(pdf.file.name)

        # Recursive delete for subfolders
        def delete_subfolders(parent):
            for child in parent.children.all():
                delete_subfolders(child)
                child.delete()

        delete_subfolders(folder)
        folder.delete()

        return Response({"message": "Folder deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['patch'])
    def rename(self, request, slug=None):
        """Rename folder"""
        folder = self.get_object()
        new_title = request.data.get("title")
        if not new_title:
            return Response({"error": "Title required"}, status=status.HTTP_400_BAD_REQUEST)
        folder.title = new_title
        folder.save()
        return Response(FolderSerializer(folder, context={'request': request}).data)


# -------------------------------
# PDF CRUD
# -------------------------------
class PDFViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PDFSerializer

    def get_queryset(self):
        return PDF.objects.filter(folder__owner=self.request.user).order_by('-uploaded_at')

    def perform_create(self, serializer):
        folder_slug = self.request.data.get('folder')
        folder = get_object_or_404(Folder, slug=folder_slug, owner=self.request.user)
        serializer.save(folder=folder)

    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        pdf = self.get_object()
        target_folder_slug = request.data.get('folder')
        if not target_folder_slug:
            return Response({"error": "Target folder slug required"}, status=status.HTTP_400_BAD_REQUEST)

        target_folder = get_object_or_404(Folder, slug=target_folder_slug, owner=request.user)
        pdf.folder = target_folder
        pdf.save()
        return Response({
            "message": "File moved successfully",
            "file": PDFSerializer(pdf).data
        })

    def destroy(self, request, *args, **kwargs):
        pdf = self.get_object()
        if pdf.file:
            pdf.file.delete(save=False)
            delete_file_from_r2(pdf.file.name)
        pdf.delete()
        return Response({"message": "File deleted successfully"}, status=status.HTTP_204_NO_CONTENT)


# -------------------------------
# User Profile
# -------------------------------
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


# -------------------------------
# Public Folder
# -------------------------------
class PublicFolderView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = FolderSerializer
    lookup_field = "slug"

    def get(self, request, slug):
        folder = get_object_or_404(Folder, slug=slug, is_public=True)
        for pdf in folder.pdfs.all():
            pdf.download_url = generate_presigned_url(pdf.file.name)
        return Response(FolderSerializer(folder, context={'request': request}).data)
