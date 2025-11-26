from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FolderViewSet, PDFViewSet


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
    path('', include(router.urls)), 
]