from rest_framework import serializers
from .models import Folder, PDF, UserProfile, FolderLibraryEntry
from django.contrib.auth import get_user_model

User = get_user_model()


class PDFSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()
    folder_id = serializers.IntegerField(write_only=True)  
    
    class Meta:
        model = PDF
        fields = [
            'id', 'title', 'file', 'description', 'tags',
            'file_size', 'uploaded_at', 'last_viewed', 'view_count',
            'folder', 'folder_id', 'download_url', 'is_public', 'share_token'  
        ]
        read_only_fields = ['uploaded_at', 'last_viewed', 'view_count', 'share_token', 'folder']
    
    def get_download_url(self, obj):
        return getattr(obj, 'download_url', None)


class FolderListSerializer(serializers.ModelSerializer):
    
    file_count = serializers.SerializerMethodField()
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    is_in_library = serializers.SerializerMethodField()
    
    class Meta:
        model = Folder
        fields = [
            'id', 'title', 'slug', 'created_at', 'updated_at',
            'is_public', 'file_count', 'owner_name', 'share_url',
            'library_count', 'is_in_library'
        ]
    
    def get_file_count(self, obj):
        return obj.pdfs.filter(deleted_at__isnull=True).count()
    
    def get_is_in_library(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.added_by.filter(id=request.user.id).exists()
        return False


class FolderSerializer(serializers.ModelSerializer):
    """Full serializer with nested children and files"""
    children = serializers.SerializerMethodField()
    pdfs = PDFSerializer(many=True, read_only=True)
    owner_name = serializers.CharField(source='owner.username', read_only=True)
    is_in_library = serializers.SerializerMethodField()
    
    class Meta:
        model = Folder
        fields = [
            'id', 'title', 'slug', 'owner', 'owner_name',
            'is_public', 'parent', 'children', 'pdfs',
            'created_at', 'updated_at', 'share_url',
            'share_token', 'library_count', 'is_in_library'
        ]
        # ✅ CRITICAL FIX: Make owner read-only so POST doesn't require it
        read_only_fields = ['slug', 'share_token', 'created_at', 'updated_at', 'owner', 'owner_name']
    
    def get_children(self, obj):
        children = obj.children.filter(deleted_at__isnull=True)
        return FolderListSerializer(children, many=True, context=self.context).data
    
    def get_is_in_library(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.added_by.filter(id=request.user.id).exists()
        return False

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    public_folders = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'username', 'display_name', 'bio', 'avatar',
            'username_slug', 'profile_url', 'is_profile_public',
            'public_folders_count', 'public_folders', 'created_at'
        ]
        read_only_fields = ['username', 'username_slug', 'profile_url', 'created_at']
    
    def get_public_folders(self, obj):
        """Get user's public folders"""
        folders = obj.user.owned_folders.filter(
            is_public=True,
            deleted_at__isnull=True,
            parent__isnull=True  
        ).order_by('-updated_at')
        return FolderListSerializer(folders, many=True, context=self.context).data


class FolderLibraryEntrySerializer(serializers.ModelSerializer):
    folder = FolderListSerializer(read_only=True)
    folder_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = FolderLibraryEntry
        fields = ['id', 'folder', 'folder_id', 'custom_name', 'added_at']
        read_only_fields = ['added_at']
    
    def create(self, validated_data):
        folder_id = validated_data.pop('folder_id')
        folder = Folder.objects.get(id=folder_id, is_public=True, deleted_at__isnull=True)
        validated_data['folder'] = folder
        return super().create(validated_data)