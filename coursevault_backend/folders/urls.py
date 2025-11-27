from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FolderViewSet, 
    PDFViewSet,
    search_files,
    recent_files,
    trash_list,
    restore_item,
    permanent_delete,
    add_tags,
    remove_tag,
)

router = DefaultRouter()
router.register(r'pdfs', PDFViewSet, basename='pdf')  


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
    path('', folder_list, name='folder-list'),           
    path('<int:pk>/', folder_detail, name='folder-detail'),  
    
    # Search & Recent
    path('search/', search_files, name='search-files'),  
    path('recent/', recent_files, name='recent-files'),  
    
    # Trash
    path('trash/', trash_list, name='trash-list'),  
    path('trash/<str:item_type>/<int:item_id>/restore/', restore_item, name='restore-item'),
    path('trash/<str:item_type>/<int:item_id>/delete/', permanent_delete, name='permanent-delete'),
    
    # Tags
    path('pdfs/<int:file_id>/tags/', add_tags, name='add-tags'),
    path('pdfs/<int:file_id>/tags/<str:tag>/', remove_tag, name='remove-tag'),
    
    path('', include(router.urls)),  
]