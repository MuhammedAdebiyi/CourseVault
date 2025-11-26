from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import Folder, PDF
from .serializers import FolderSerializer, FolderListSerializer, PDFSerializer
import boto3
import logging

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



# Folder ViewSet

@method_decorator(csrf_exempt, name='dispatch')
class FolderViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for folders
    """
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return FolderListSerializer
        return FolderSerializer
    
    def get_queryset(self):
        
        return Folder.objects.filter(owner=self.request.user, parent__isnull=True).order_by('-updated_at')
    
    def retrieve(self, request, *args, **kwargs):
        """Get single folder with all children and files"""
        # Allow retrieving ANY folder the user owns, not just root
        folder = get_object_or_404(Folder, id=kwargs['pk'], owner=request.user)
        serializer = FolderSerializer(folder, context={'request': request})
        return Response(serializer.data)
    
    def perform_create(self, serializer):
        """Create folder with current user as owner"""
        serializer.save(owner=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        """Delete folder and all its contents recursively"""
        folder = self.get_object()
        
        # Recursive function to delete all subfolders
        def delete_subfolders(parent):
            for child in parent.children.all():
                # Delete all PDFs in child folder
                for pdf in child.pdfs.all():
                    if pdf.file:
                        delete_file_from_r2(pdf.file.name)
                    pdf.delete()
                # Recursively delete subfolders
                delete_subfolders(child)
                child.delete()
        
        # Delete all PDFs in this folder
        for pdf in folder.pdfs.all():
            if pdf.file:
                delete_file_from_r2(pdf.file.name)
            pdf.delete()
        
        # Delete all subfolders
        delete_subfolders(folder)
        
        # Delete the folder itself
        folder.delete()
        
        return Response(
            {"message": "Folder deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )

    @action(detail=True, methods=['patch'])
    def rename(self, request, pk=None):
        """Rename folder"""
        folder = self.get_object()
        new_title = request.data.get("title")
        if not new_title:
            return Response({"error": "Title required"}, status=status.HTTP_400_BAD_REQUEST)
        folder.title = new_title
        folder.save()
        return Response(FolderSerializer(folder, context={'request': request}).data)



# PDF ViewSet

@method_decorator(csrf_exempt, name='dispatch')
class PDFViewSet(viewsets.ModelViewSet):
    """
    CRUD operations for PDF files
    """
    serializer_class = PDFSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Only show files from user's folders"""
        return PDF.objects.filter(folder__owner=self.request.user).order_by('-uploaded_at')
    
    def perform_create(self, serializer):
        """Create PDF and associate with folder owned by user"""
        folder_id = self.request.data.get('folder')
        
        # Verify the folder belongs to the user
        folder = get_object_or_404(Folder, id=folder_id, owner=self.request.user)
        
        # Save PDF with folder (don't pass owner - PDF model doesn't have it)
        serializer.save(folder=folder)
    
    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        """Move file to another folder"""
        pdf = self.get_object()
        target_folder_id = request.data.get('folder')
        
        if not target_folder_id:
            return Response(
                {"error": "Target folder ID required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify target folder belongs to user
        target_folder = get_object_or_404(
            Folder,
            id=target_folder_id,
            owner=request.user
        )
        
        pdf.folder = target_folder
        pdf.save()
        
        return Response({
            "message": "File moved successfully",
            "file": PDFSerializer(pdf).data
        })
    
    def destroy(self, request, *args, **kwargs):
        """Delete PDF file from database and R2 storage"""
        pdf = self.get_object()
        
        # Delete the actual file from R2
        if pdf.file:
            delete_file_from_r2(pdf.file.name)
        
        # Delete from database
        pdf.delete()
        
        return Response(
            {"message": "File deleted successfully"},
            status=status.HTTP_204_NO_CONTENT
        )



# Public Folder View

class PublicFolderView(generics.RetrieveAPIView):
    """View public folders"""
    permission_classes = [AllowAny]
    serializer_class = FolderSerializer
    lookup_field = "slug"

    def get(self, request, slug):
        folder = get_object_or_404(Folder, slug=slug, is_public=True)
        
        # Generate presigned URLs for all PDFs
        for pdf in folder.pdfs.all():
            pdf.download_url = generate_presigned_url(pdf.file.name)
        
        return Response(FolderSerializer(folder, context={'request': request}).data)