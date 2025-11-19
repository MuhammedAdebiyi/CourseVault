from rest_framework import serializers
from .models import Folder, PDF
from django.conf import settings
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

def generate_presigned_url(file_name, expires_in=3600):
    """Generate a temporary signed URL for a PDF."""
    key = file_name.replace("pdfs/", "")
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


# PDF Serializer
class PDFSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = PDF
        fields = ["id", "title", "file", "uploaded_at", "download_url", "folder"]  # ✅ added folder

    def get_download_url(self, obj):
        request = self.context.get("request")
        # If folder is public, generate signed URL
        if obj.folder.is_public or (request and request.user == obj.folder.owner):
            return generate_presigned_url(obj.file.name)
        return None

    def validate_file(self, value):
        if not value.name.endswith(".pdf"):
            raise serializers.ValidationError("Only PDF files are allowed")
        return value


# Folder Serializer
class FolderSerializer(serializers.ModelSerializer):
    pdfs = PDFSerializer(many=True, read_only=True)
    owner_username = serializers.CharField(source="owner.email", read_only=True)

    class Meta:
        model = Folder
        fields = ["id", "title", "slug", "owner_username", "is_public", "pdfs"]
