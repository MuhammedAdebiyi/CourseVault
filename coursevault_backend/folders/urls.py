from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FolderViewSet, PDFViewSet, UserProfileView, PublicFolderView

router = DefaultRouter()
router.register(r'folders', FolderViewSet, basename='folder')
router.register(r'pdfs', PDFViewSet, basename='pdf')

urlpatterns = [
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('folders/<slug:slug>/public/', PublicFolderView.as_view(), name='public-folder'),
    path('', include(router.urls)),
]
