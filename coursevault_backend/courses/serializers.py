from rest_framework import serializers
from .models import Folder, PDF
from .utils import generate_presigned_url
class PDFSerializer(serializers.ModelSerializer):

    download_url = serializers.SerializerMethodField()

    class Meta:
        model = PDF
        fields = "__all__"


    def get_download_url(self, obj):
        if obj.file:
            return generate_presigned_url(obj.file.name, expires_in=3600)
        return None

class FolderSerializer(serializers.ModelSerializer):
    pdfs = PDFSerializer(many=True, read_only=True)

    class Meta:
        model = Folder
        fields = "__all__"

    