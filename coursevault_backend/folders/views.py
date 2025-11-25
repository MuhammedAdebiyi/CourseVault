from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.conf import settings
from .models import Folder, PDF
from .serializers import FolderSerializer, PDFSerializer
from accounts.serializers import UserSerializer
import boto3
import logging
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from folders.models import Folder

logger = logging.getLogger("courses")

# Cloudflare R2 setup
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

# PDF Deletion
class PDFDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pdf_id):
        pdf = get_object_or_404(PDF, id=pdf_id, folder__owner=request.user)
        delete_file_from_r2(pdf.file.name)
        pdf.delete()
        logger.info(f"PDF deleted: {pdf.title} by {request.user.email}")
        return Response({"detail": "PDF deleted successfully"}, status=200)

# Folder Deletion
@method_decorator(csrf_exempt, name="dispatch")
class FolderDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, folder_id):
        folder = get_object_or_404(Folder, id=folder_id, owner=request.user)
        for pdf in folder.pdfs.all():
            delete_file_from_r2(pdf.file.name)
        folder.delete()
        logger.info(f"Folder deleted: {folder.title} by {request.user.email}")
        return Response({"detail": "Folder and PDFs deleted successfully"}, status=200)

# User Profile
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

# Folder & PDF ViewSets
@method_decorator(csrf_exempt, name="dispatch")
class FolderViewSet(viewsets.ModelViewSet):
    serializer_class = FolderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Folder.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class PDFViewSet(viewsets.ModelViewSet):
    serializer_class = PDFSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Only PDFs in folders owned by the user
        return PDF.objects.filter(folder__owner=self.request.user)

    def perform_create(self, serializer):
        # Validate PDF extension
        file = serializer.validated_data.get("file")
        if file and not file.name.lower().endswith(".pdf"):
            raise serializers.ValidationError("Only PDF files are allowed")
        serializer.save()
        logger.info(f"PDF uploaded: {serializer.instance.title} by {self.request.user.email}")

# Public Folder View
class PublicFolderView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = FolderSerializer

    def get(self, request, slug):
        folder = get_object_or_404(Folder, slug=slug, is_public=True)
        # Add presigned URLs for all PDFs
        for pdf in folder.pdfs.all():
            pdf.download_url = generate_presigned_url(pdf.file.name)
        return Response(FolderSerializer(folder, context={'request': request}).data)
