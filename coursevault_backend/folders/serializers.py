from rest_framework import serializers
from .models import Folder, PDF
from django.conf import settings
import boto3
import logging
from botocore.client import Config

logger = logging.getLogger("courses")

# Cloudflare R2 setup
r2_opts = settings.STORAGES["default"]["OPTIONS"]

s3_client = boto3.client(
    "s3",
    endpoint_url=r2_opts["endpoint_url"],
    aws_access_key_id=r2_opts["access_key"],
    aws_secret_access_key=r2_opts["secret_key"],
    config=Config(signature_version="s3v4")  # Ensure SigV4
)

R2_BUCKET = r2_opts["bucket_name"]

def generate_presigned_url(file_name, expires_in=3600):
    """Generate a temporary signed URL for a PDF with original filename."""
    key = file_name  # Keep full path including 'pdfs/'
    original_filename = file_name.split("/")[-1]  # extract actual filename
    try:
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={
                'Bucket': R2_BUCKET,
                'Key': key,
                'ResponseContentDisposition': f'attachment; filename="{original_filename}"'
            },
            ExpiresIn=expires_in
        )
        return url
    except Exception as e:
        logger.error(f"Failed to generate presigned URL for {file_name}: {e}")
        return None


# PDF Serializer
from rest_framework import serializers
from .models import Folder, PDF


class PDFSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDF
        fields = ['id', 'title', 'file', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']


class FolderSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()
    name = serializers.CharField(source='title', required=False)  # Map title to name for frontend
    
    class Meta:
        model = Folder
        fields = ['id', 'title', 'name', 'slug', 'is_public', 'parent', 'children', 'files']
        read_only_fields = ['id', 'slug']
    
    def create(self, validated_data):
        # Handle both 'name' and 'title' fields
        if 'name' in self.initial_data and 'title' not in validated_data:
            validated_data['title'] = self.initial_data['name']
        return super().create(validated_data)
    
    def get_children(self, obj):
        # Get immediate children (subfolders)
        children = obj.children.all()
        return FolderSerializer(children, many=True, context=self.context).data
    
    def get_files(self, obj):
        # Get files in this folder
        files = obj.pdfs.all().order_by('-uploaded_at')
        return PDFSerializer(files, many=True).data


class FolderListSerializer(serializers.ModelSerializer):
    """Simpler serializer for listing folders without children/files"""
    name = serializers.CharField(source='title')
    files_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Folder
        fields = ['id', 'title', 'name', 'slug', 'is_public', 'parent', 'files_count']
        read_only_fields = ['id', 'slug']
    
    def get_files_count(self, obj):
        return obj.pdfs.count()