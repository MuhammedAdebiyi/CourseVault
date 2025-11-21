from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FolderViewSet, PDFViewSet, FolderDeleteView, PDFDeleteView, UserProfileView, PublicFolderView

router = DefaultRouter()
router.register(r'folders', FolderViewSet, basename='folder') 
router.register(r'pdfs', PDFViewSet, basename='pdf')

urlpatterns = [
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('folders/<int:folder_id>/delete/', FolderDeleteView.as_view(), name='folder-delete'),
    path('pdfs/<int:pdf_id>/delete/', PDFDeleteView.as_view(), name='pdf-delete'),
    path('', include(router.urls)),
     path("folders/<slug:slug>/public/", PublicFolderView.as_view(), name="public-folder"),
]
