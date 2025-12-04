from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from folders.models import Folder, PDF
from django.db.models import Count, Sum
from datetime import datetime, timedelta
from django.utils import timezone

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_stats(request):
    """Get admin dashboard statistics"""
    total_users = User.objects.count()
    total_folders = Folder.objects.filter(deleted_at__isnull=True).count()
    total_files = PDF.objects.filter(deleted_at__isnull=True).count()
    
    # Calculate total storage
    total_storage = PDF.objects.filter(deleted_at__isnull=True).aggregate(
        total=Sum('file_size')
    )['total'] or 0
    
    # Active users today
    today = timezone.now().date()
    active_users_today = User.objects.filter(
        last_login__date=today
    ).count()
    
    # New users this week
    week_ago = timezone.now() - timedelta(days=7)
    new_users_this_week = User.objects.filter(
        date_joined__gte=week_ago
    ).count()
    
    return Response({
        'total_users': total_users,
        'total_folders': total_folders,
        'total_files': total_files,
        'total_storage': total_storage,
        'active_users_today': active_users_today,
        'new_users_this_week': new_users_this_week,
    })


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_users(request):
    """Get all users for admin"""
    users = User.objects.all().order_by('-date_joined')
    
    data = [{
        'id': user.id,
        'email': user.email,
        'name': user.name,
        'is_premium': getattr(user, 'is_premium', False),
        'email_verified': user.email_verified,
        'date_joined': user.date_joined,
        'last_login': user.last_login,
    } for user in users]
    
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_folders(request):
    """Get all folders for admin"""
    from folders.serializers import FolderListSerializer
    
    folders = Folder.objects.filter(
        deleted_at__isnull=True
    ).select_related('owner').order_by('-created_at')
    
    data = [{
        'id': f.id,
        'title': f.title,
        'owner_name': f.owner.username,
        'files_count': f.pdfs.filter(deleted_at__isnull=True).count(),
        'is_public': f.is_public,
        'created_at': f.created_at,
    } for f in folders]
    
    return Response(data)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def admin_delete_user(request, user_id):
    """Delete a user"""
    user = User.objects.get(id=user_id)
    user.delete()
    return Response({'message': 'User deleted successfully'})


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_update_user(request, user_id):
    """Update user (e.g., toggle premium)"""
    user = User.objects.get(id=user_id)
    
    if 'is_premium' in request.data:
        user.is_premium = request.data['is_premium']
        user.save()
    
    return Response({'message': 'User updated successfully'})