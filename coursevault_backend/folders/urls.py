from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'pdfs', views.PDFViewSet, basename='pdf')

urlpatterns = [
    # ==========================================
    # FOLDERS (manual - most specific first!)
    # ==========================================
    
    # Specific folder actions first
    path('<int:pk>/rename/', views.FolderViewSet.as_view({
        'patch': 'rename'
    }), name='folder-rename'),
    
    path('<int:folder_id>/toggle-public/', views.toggle_folder_public, name='toggle-public'),
    
    # Then general CRUD
    path('', views.FolderViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='folder-list'),
    
    path('<int:pk>/', views.FolderViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='folder-detail'),
    
    # ==========================================
    # PUBLIC SHARING
    # ==========================================
    
    path('public/<slug:slug>/', views.PublicFolderView.as_view(), name='public-folder'),
    path('discover/folders/', views.public_folders, name='public-folders'),
    path('discover/trending/', views.trending_folders, name='trending-folders'),
    path('discover/profiles/', views.discover_profiles, name='discover-profiles'),
    path('<int:folder_id>/toggle-public/', views.toggle_folder_public, name='toggle-public'),
    
    # ==========================================
    # USER PROFILES
    # ==========================================
    
    path('profile/<slug:username_slug>/', views.user_profile, name='user-profile'),
    
    # ==========================================
    # LIBRARY MANAGEMENT
    # ==========================================
    
    path('library/', views.my_library, name='my-library'),
    path('library/add/<int:folder_id>/', views.add_to_library, name='add-to-library'),
    path('library/remove/<int:folder_id>/', views.remove_from_library, name='remove-from-library'),
    
    # ==========================================
    # SEARCH & RECENT
    # ==========================================
    
    path('search/', views.search_files, name='search-files'),
    path('recent/', views.recent_files, name='recent-files'),
    
    # ==========================================
    # TRASH
    # ==========================================
    
    path('trash/', views.trash_list, name='trash-list'),
    path('restore/<str:item_type>/<int:item_id>/', views.restore_item, name='restore-item'),
    path('permanent-delete/<str:item_type>/<int:item_id>/', views.permanent_delete, name='permanent-delete'),
    
    # ==========================================
    # TAGS
    # ==========================================
    
    path('pdfs/<int:file_id>/tags/', views.add_tags, name='add-tags'),
    path('pdfs/<int:file_id>/tags/<str:tag>/', views.remove_tag, name='remove-tag'),
    
    # ==========================================
    # AI FEATURES
    # ==========================================
    
    path('pdfs/<int:pdf_id>/extract-text/', views.extract_pdf_text, name='extract-text'),
    path('search/content/', views.search_pdf_content, name='search-content'),
    
    path('pdfs/<int:pdf_id>/generate-quiz/', views.generate_quiz, name='generate-quiz'),
    path('pdfs/<int:pdf_id>/quiz/', views.get_quiz, name='get-quiz'),
    path('pdfs/<int:pdf_id>/submit-quiz/', views.submit_quiz, name='submit-quiz'),
    
    path('pdfs/<int:pdf_id>/generate-summary/', views.generate_summary, name='generate-summary'),
    path('pdfs/<int:pdf_id>/generate-flashcards/', views.generate_flashcards, name='generate-flashcards'),
    
    # ==========================================
    # ✅ ROUTER AT END - For PDFs only
    # ==========================================
    path('', include(router.urls)),
]