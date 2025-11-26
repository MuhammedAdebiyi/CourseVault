# folders/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FolderViewSet, PDFViewSet

# Create router and register PDFs only
router = DefaultRouter()
router.register(r'pdfs', PDFViewSet, basename='pdf')  # This creates /api/folders/pdfs/

# Manual URL patterns for folders (to avoid conflict with empty string registration)
folder_list = FolderViewSet.as_view({
    'get': 'list',
    'post': 'create'
})

folder_detail = FolderViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

urlpatterns = [
    path('', folder_list, name='folder-list'),           # GET/POST /api/folders/
    path('<int:pk>/', folder_detail, name='folder-detail'),  # GET/PUT/PATCH/DELETE /api/folders/{id}/
    path('', include(router.urls)),  # Include PDF routes
]