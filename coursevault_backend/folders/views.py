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
from rest_framework.decorators import api_view
from django.db.models import Q
from datetime import timedelta

logger = logging.getLogger("courses")



# Cloudflare R2 setup

r2_opts = settings.STORAGES["default"]["OPTIONS"]
s3_client = boto3.client(
    "s3",
    endpoint_url=r2_opts["endpoint_url"],
    aws_access_key_id=r2_opts["access_key"],
    aws_secret_access_key=r2_opts["secret_key"],
    config=boto3.session.Config(signature_version='s3v4'),  
    region_name='auto'  
)
R2_BUCKET = r2_opts["bucket_name"]


def delete_file_from_r2(file_path):
    """Delete file from Cloudflare R2."""
    # Use the full path as stored in database
    key = file_path
    try:
        s3_client.delete_object(Bucket=R2_BUCKET, Key=key)
        logger.info(f"Deleted {file_path} from R2")
    except Exception as e:
        logger.error(f"Failed to delete {file_path} from R2: {e}")


def generate_presigned_url(file_name, expires_in=3600):
    """Generate a temporary signed URL for a PDF."""
    # Don't remove pdfs/ - use the full path as stored in database
    key = file_name  # Use the file path exactly as stored
    
    try:
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': R2_BUCKET, 'Key': key},
            ExpiresIn=expires_in
        )
        return url
    except Exception as e:
        logger.error(f"Failed to generate presigned URL for {file_name}: {e}")
        return None



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
        # Only show user's own ROOT folders (no parent) for LIST action
        return Folder.objects.filter(owner=self.request.user, parent__isnull=True).order_by('-updated_at')
    
    def get_object(self):
        """Override to allow access to ANY folder user owns, not just root"""
        pk = self.kwargs.get('pk')
        folder = get_object_or_404(Folder, id=pk, owner=self.request.user)
        return folder
    
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


# -------------------------------
# PDF ViewSet
# -------------------------------
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
    
    def retrieve(self, request, *args, **kwargs):
        """Get PDF details with presigned download URL"""
        pdf = self.get_object()
        serializer = self.get_serializer(pdf)
        data = serializer.data
        
        # Add presigned download URL
        if pdf.file:
            data['download_url'] = generate_presigned_url(pdf.file.name, expires_in=3600)
        
        return Response(data)
    
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


# -------------------------------
# Public Folder View
# -------------------------------
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
    
@api_view(['GET'])
def search_files(request):
    """
    Search files by title, tags, or date
    Query params: q (query), tags (comma-separated), date_from, date_to
    """
    user = request.user
    query = request.GET.get('q', '')
    tags = request.GET.get('tags', '')
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    # Start with user's non-deleted files
    files = PDF.objects.filter(
        folder__owner=user,
        deleted_at__isnull=True
    )
    
    # Text search in title and description
    if query:
        files = files.filter(
            Q(title__icontains=query) | Q(description__icontains=query)
        )
    
    # Filter by tags
    if tags:
        tag_list = [t.strip() for t in tags.split(',')]
        for tag in tag_list:
            files = files.filter(tags__contains=[tag])
    
    # Date range filter
    if date_from:
        files = files.filter(uploaded_at__gte=date_from)
    if date_to:
        files = files.filter(uploaded_at__lte=date_to)
    
    # Serialize and return
    serializer = PDFSerializer(files[:50], many=True)  # Limit to 50 results
    return Response({
        'count': files.count(),
        'results': serializer.data
    })


@api_view(['GET'])
def recent_files(request):
    """
    Get recently viewed or uploaded files
    Query param: type (viewed|uploaded) - default: viewed
    """
    user = request.user
    file_type = request.GET.get('type', 'viewed')
    
    files = PDF.objects.filter(
        folder__owner=user,
        deleted_at__isnull=True
    )
    
    if file_type == 'viewed':
        files = files.filter(last_viewed__isnull=False).order_by('-last_viewed')
    else:
        files = files.order_by('-uploaded_at')
    
    serializer = PDFSerializer(files[:20], many=True)  # Last 20 files
    return Response(serializer.data)


@api_view(['GET'])
def trash_list(request):
    """
    Get all deleted folders and files (last 30 days)
    """
    user = request.user
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    # Get deleted folders
    deleted_folders = Folder.objects.filter(
        owner=user,
        deleted_at__isnull=False,
        deleted_at__gte=thirty_days_ago
    )
    
    # Get deleted files
    deleted_files = PDF.objects.filter(
        folder__owner=user,
        deleted_at__isnull=False,
        deleted_at__gte=thirty_days_ago
    )
    
    return Response({
        'folders': FolderListSerializer(deleted_folders, many=True).data,
        'files': PDFSerializer(deleted_files, many=True).data
    })


@api_view(['POST'])
def restore_item(request, item_type, item_id):
    """
    Restore a deleted folder or file
    item_type: 'folder' or 'file'
    """
    user = request.user
    
    if item_type == 'folder':
        item = get_object_or_404(Folder, id=item_id, owner=user, deleted_at__isnull=False)
    else:
        item = get_object_or_404(PDF, id=item_id, folder__owner=user, deleted_at__isnull=False)
    
    item.restore()
    
    return Response({
        'message': f'{item_type.capitalize()} restored successfully',
        'id': item.id
    })


@api_view(['DELETE'])
def permanent_delete(request, item_type, item_id):
    """
    Permanently delete a folder or file from trash
    """
    user = request.user
    
    if item_type == 'folder':
        item = get_object_or_404(Folder, id=item_id, owner=user, deleted_at__isnull=False)
        # Delete files in R2
        for pdf in item.pdfs.all():
            if pdf.file:
                delete_file_from_r2(pdf.file.name)
            pdf.delete()
    else:
        item = get_object_or_404(PDF, id=item_id, folder__owner=user, deleted_at__isnull=False)
        if item.file:
            delete_file_from_r2(item.file.name)
    
    item.delete()  # Hard delete
    
    return Response({
        'message': f'{item_type.capitalize()} permanently deleted'
    }, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def add_tags(request, file_id):
    """
    Add tags to a file
    Body: { "tags": ["lecture", "important"] }
    """
    user = request.user
    pdf = get_object_or_404(PDF, id=file_id, folder__owner=user)
    
    new_tags = request.data.get('tags', [])
    
    for tag in new_tags:
        pdf.add_tag(tag)
    
    return Response({
        'message': 'Tags added',
        'tags': pdf.tags
    })


@api_view(['DELETE'])
def remove_tag(request, file_id, tag):
    """
    Remove a specific tag from a file
    """
    user = request.user
    pdf = get_object_or_404(PDF, id=file_id, folder__owner=user)
    
    pdf.remove_tag(tag)
    
    return Response({
        'message': 'Tag removed',
        'tags': pdf.tags
    })