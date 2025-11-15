from rest_framework import serializers
from .models import Folder, PDF

class PDFSerializer(serializers.ModelSerializer):
    class Meta:
        model = PDF
        fields = "__all__"


class FolderSerializer(serializers.ModelSerializer):
    pdfs = PDFSerializer(many=True, read_only=True)

    class Meta:
        model = Folder
        fields = "__all__"
