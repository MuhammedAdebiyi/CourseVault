from rest_framework import viewsets, generics, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.decorators import api_view
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.utils import timezone 
from .models import Folder, PDF
from .serializers import FolderSerializer, FolderListSerializer, PDFSerializer
from .models import UserProfile, FolderLibraryEntry
from .serializers import UserProfileSerializer, FolderLibraryEntrySerializer
from .models import AIGeneratedQuestion, QuizAttempt
from .pdf_utils import (
    extract_text_from_pdf,
    generate_quiz_questions_with_ai,
    generate_summary_with_ai,
    generate_flashcards_with_ai
)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db.models import Q
import boto3
import logging
from django.db.models import Q
from django.db import IntegrityError
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import timedelta
from django.contrib.auth import get_user_model
User = get_user_model()


logger = logging.getLogger("courses")

# Cloudflare R2 setup
r2_opts = settings.STORAGES["default"]["OPTIONS"]
s3_client = boto3.client(
    "s3",
    endpoint_url=r2_opts["endpoint_url"],
    aws_access_key_id=r2_opts["access_key"],
    aws_secret_access_key=r2_opts["secret_key"],
    config=boto3.session.Config(signature_version='s3v4'),  
    region_name='auto'  
)
R2_BUCKET = r2_opts["bucket_name"]


def delete_file_from_r2(file_path):

    key = file_path
    try:
        s3_client.delete_object(Bucket=R2_BUCKET, Key=key)
        logger.info(f"Deleted {file_path} from R2")
    except Exception as e:
        logger.error(f"Failed to delete {file_path} from R2: {e}")


def generate_presigned_url(file_name, expires_in=3600):
    
    key = file_name
    try:
        url = s3_client.generate_presigned_url(
            'get_object',
            Params={'Bucket': R2_BUCKET, 'Key': key},
            ExpiresIn=expires_in
        )
        return url
    except Exception as e:
        logger.error(f"Failed to generate presigned URL for {file_name}: {e}")
        return None


# Folder ViewSet
@method_decorator(csrf_exempt, name='dispatch')
class FolderViewSet(viewsets.ModelViewSet):
    """CRUD operations for folders"""
    permission_classes = [IsAuthenticated]
    serializer_class = FolderSerializer
    queryset = Folder.objects.all()  
    
    def get_serializer_class(self):
        if self.action == 'list':
            return FolderListSerializer
        return FolderSerializer
    
    def get_queryset(self):
        # Only show NON-DELETED root folders
        return Folder.objects.filter(
            owner=self.request.user, 
            parent__isnull=True,
            deleted_at__isnull=True
        ).order_by('-updated_at')
    
    def get_object(self):
        """Override to allow access to ANY non-deleted folder user owns"""
        pk = self.kwargs.get('pk')
        folder = get_object_or_404(
            Folder, 
            id=pk, 
            owner=self.request.user,
            deleted_at__isnull=True
        )
        return folder
    
    def perform_create(self, serializer):
        
        serializer.save(owner=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        
        folder = self.get_object()
        
        # Recursive function to soft delete all subfolders
        def soft_delete_subfolders(parent):
            for child in parent.children.filter(deleted_at__isnull=True):
                for pdf in child.pdfs.filter(deleted_at__isnull=True):
                    pdf.soft_delete()
                soft_delete_subfolders(child)
                child.soft_delete()
        
        # Soft delete all PDFs in this folder
        for pdf in folder.pdfs.filter(deleted_at__isnull=True):
            pdf.soft_delete()
        
        # Soft delete all subfolders
        soft_delete_subfolders(folder)
        
        # Soft delete the folder itself
        folder.soft_delete()
        
        return Response(
            {"message": "Folder moved to trash"},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['patch'])
    def rename(self, request, pk=None):
        """Rename folder"""
        folder = self.get_object()
        new_title = request.data.get("title")
        if not new_title:
            return Response({"error": "Title required"}, status=status.HTTP_400_BAD_REQUEST)
        folder.title = new_title
        folder.save()
        return Response(FolderSerializer(folder, context={'request': request}).data)


# PDF ViewSet
@method_decorator(csrf_exempt, name='dispatch')
class PDFViewSet(viewsets.ModelViewSet):
    """CRUD operations for PDF files"""
    serializer_class = PDFSerializer
    permission_classes = [IsAuthenticated]
    queryset = PDF.objects.all() 
    
    def get_queryset(self):
        """Only show NON-DELETED files from user's folders"""
        return PDF.objects.filter(
            folder__owner=self.request.user,
            deleted_at__isnull=True
        ).order_by('-uploaded_at')
    
    def retrieve(self, request, *args, **kwargs):
        """Get PDF details with presigned download URL"""
        pdf = self.get_object()
        pdf.record_view()
        
        serializer = self.get_serializer(pdf)
        data = serializer.data
        
        if pdf.file:
            data['download_url'] = generate_presigned_url(pdf.file.name, expires_in=3600)
        
        return Response(data)

    def perform_create(self, serializer):
        try:
            print("==DEBUG PDF UPLOAD===")
            print("Request data:", self.request.data)
            print("Validated data:", serializer.validated_data)
            print("Files:", self.request.FILES)
        
            folder_id = serializer.validated_data.get("folder_id")

            if not folder_id:
                folder_id = (
                    self.request.data.get("folder") or
                    self.request.data.get("folder_id")
                )
            
            print("Folder ID:", folder_id)

            if not folder_id:
                raise serializer.ValidationError(
                    {"folder_id": "This is a required a field"}
                )
            
            folder = get_object_or_404(
                Folder, id=folder_id, owner=self.request.user
            )

            serializer.save(folder=folder)
        
        except Exception as e:

            print("=== PDF UPLOAD ERROR ===")
            print(type(e).__name__, ":", e)
            raise  

    @action(detail=True, methods=['post'])
    def move(self, request, pk=None):
        """Move file to another folder"""
        pdf = self.get_object()
        target_folder_id = request.data.get('folder')
        
        if not target_folder_id:
            return Response(
                {"error": "Target folder ID required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        target_folder = get_object_or_404(
            Folder,
            id=target_folder_id,
            owner=request.user,
            deleted_at__isnull=True
        )
        
        pdf.folder = target_folder
        pdf.save()
        
        return Response({
            "message": "File moved successfully",
            "file": PDFSerializer(pdf).data
        })
    
    def destroy(self, request, *args, **kwargs):
        """Soft delete PDF"""
        pdf = self.get_object()
        pdf.soft_delete()
        
        return Response(
            {"message": "File moved to trash"},
            status=status.HTTP_200_OK
        )

# Public Folder View
class PublicFolderView(generics.RetrieveAPIView):
    """View public folders"""
    permission_classes = [AllowAny]
    serializer_class = FolderSerializer
    lookup_field = "slug"

    def get(self, request, slug):
        folder = get_object_or_404(
            Folder, 
            slug=slug, 
            is_public=True,
            deleted_at__isnull=True  
        )
        
        # Generate presigned URLs for all PDFs
        for pdf in folder.pdfs.filter(deleted_at__isnull=True):
            pdf.download_url = generate_presigned_url(pdf.file.name)
        
        return Response(FolderSerializer(folder, context={'request': request}).data)


@api_view(['GET'])
def search_files(request):
    """Search files by title, tags, or date"""
    user = request.user
    query = request.GET.get('q', '')
    tags = request.GET.get('tags', '')
    date_from = request.GET.get('date_from')
    date_to = request.GET.get('date_to')
    
    # Start with user's non-deleted files
    files = PDF.objects.filter(
        folder__owner=user,
        deleted_at__isnull=True
    )
    
    # Text search
    if query:
        files = files.filter(
            Q(title__icontains=query) | Q(description__icontains=query)
        )
    
    # Filter by tags
    if tags:
        tag_list = [t.strip() for t in tags.split(',')]
        for tag in tag_list:
            files = files.filter(tags__contains=[tag])
    
    # Date range filter
    if date_from:
        files = files.filter(uploaded_at__gte=date_from)
    if date_to:
        files = files.filter(uploaded_at__lte=date_to)
    
    serializer = PDFSerializer(files[:50], many=True)
    return Response({
        'count': files.count(),
        'results': serializer.data
    })


@api_view(['GET'])
def recent_files(request):
    """Get recently viewed or uploaded files"""
    user = request.user
    file_type = request.GET.get('type', 'viewed')
    
    files = PDF.objects.filter(
        folder__owner=user,
        deleted_at__isnull=True
    )
    
    if file_type == 'viewed':
        files = files.filter(last_viewed__isnull=False).order_by('-last_viewed')
    else:
        files = files.order_by('-uploaded_at')
    
    serializer = PDFSerializer(files[:20], many=True)
    return Response(serializer.data)


@api_view(['GET'])
def trash_list(request):
   
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    user = request.user
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    # Get deleted folders
    deleted_folders = Folder.objects.filter(
        owner=user,
        deleted_at__isnull=False,
        deleted_at__gte=thirty_days_ago
    ).order_by('-deleted_at')
    
    # Get deleted files
    deleted_files = PDF.objects.filter(
        folder__owner=user,
        deleted_at__isnull=False,
        deleted_at__gte=thirty_days_ago
    ).order_by('-deleted_at')
    
    return Response({
        'folders': FolderListSerializer(deleted_folders, many=True).data,
        'files': PDFSerializer(deleted_files, many=True).data
    })


@api_view(['POST'])
def restore_item(request, item_type, item_id):
   
    user = request.user
    
    if item_type == 'folder':
        item = get_object_or_404(Folder, id=item_id, owner=user, deleted_at__isnull=False)
        # Restore all child folders and files too
        for child in item.children.filter(deleted_at__isnull=False):
            child.restore()
        for pdf in item.pdfs.filter(deleted_at__isnull=False):
            pdf.restore()
    else:
        item = get_object_or_404(PDF, id=item_id, folder__owner=user, deleted_at__isnull=False)
    
    item.restore()
    
    return Response({
        'message': f'{item_type.capitalize()} restored successfully',
        'id': item.id
    })


@api_view(['DELETE'])
def permanent_delete(request, item_type, item_id):
   
    user = request.user
    
    if item_type == 'folder':
        folder = get_object_or_404(Folder, id=item_id, owner=user, deleted_at__isnull=False)
        
       
        def hard_delete_subfolders(parent):
            for child in parent.children.all():
                
                for pdf in child.pdfs.all():
                    if pdf.file:
                        delete_file_from_r2(pdf.file.name)
                    pdf.delete()
                
                hard_delete_subfolders(child)
                child.delete()
        
        
        for pdf in folder.pdfs.all():
            if pdf.file:
                delete_file_from_r2(pdf.file.name)
            pdf.delete()
        
        
        hard_delete_subfolders(folder)
        
       
        folder.delete()
        
    else:
        pdf = get_object_or_404(PDF, id=item_id, folder__owner=user, deleted_at__isnull=False)
        if pdf.file:
            delete_file_from_r2(pdf.file.name)
        pdf.delete()
    
    return Response({
        'message': f'{item_type.capitalize()} permanently deleted'
    }, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
def add_tags(request, file_id):
    """Add tags to a file"""
    user = request.user
    pdf = get_object_or_404(
        PDF, 
        id=file_id, 
        folder__owner=user,
        deleted_at__isnull=True  
    )
    
    new_tags = request.data.get('tags', [])
    for tag in new_tags:
        pdf.add_tag(tag)
    
    return Response({
        'message': 'Tags added',
        'tags': pdf.tags
    })


@api_view(['DELETE'])
def remove_tag(request, file_id, tag):
    """Remove a specific tag from a file"""
    user = request.user
    pdf = get_object_or_404(
        PDF, 
        id=file_id, 
        folder__owner=user,
        deleted_at__isnull=True  
    )
    
    pdf.remove_tag(tag)
    
    return Response({
        'message': 'Tag removed',
        'tags': pdf.tags
    })


 
# PUBLIC PROFILE VIEWS

@api_view(['GET'])
def user_profile(request, username_slug):
    """
    Get public profile for a user
    Shows their public folders
    """
    profile = get_object_or_404(UserProfile, username_slug=username_slug, is_profile_public=True)
    serializer = UserProfileSerializer(profile, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def discover_profiles(request):
   
    profiles = UserProfile.objects.filter(
        is_profile_public=True,
        user__owned_folders__is_public=True,
        user__owned_folders__deleted_at__isnull=True
    ).distinct().order_by('-updated_at')[:20]
    
    serializer = UserProfileSerializer(profiles, many=True, context={'request': request})
    return Response(serializer.data)



# LIBRARY MANAGEMENT
@api_view(['GET'])
def my_library(request):
    """
    Get current user's library (folders they've added)
    """
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    library_entries = FolderLibraryEntry.objects.filter(
        user=request.user,
        folder__deleted_at__isnull=True
    ).order_by('-added_at')
    
    serializer = FolderLibraryEntrySerializer(library_entries, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
def add_to_library(request, folder_id):
    
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    
    folder = get_object_or_404(
        Folder,
        id=folder_id,
        is_public=True,
        deleted_at__isnull=True
    )
    
    
    if FolderLibraryEntry.objects.filter(user=request.user, folder=folder).exists():
        return Response({'error': 'Already in your library'}, status=400)
    
    
    custom_name = request.data.get('custom_name', '')
    entry = FolderLibraryEntry.objects.create(
        user=request.user,
        folder=folder,
        custom_name=custom_name
    )
    
    serializer = FolderLibraryEntrySerializer(entry, context={'request': request})
    return Response({
        'message': 'Added to library successfully',
        'entry': serializer.data
    }, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
def remove_from_library(request, folder_id):
    
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    entry = get_object_or_404(
        FolderLibraryEntry,
        user=request.user,
        folder_id=folder_id
    )
    
    entry.delete()
    
    return Response({
        'message': 'Removed from library'
    }, status=status.HTTP_204_NO_CONTENT)



# PUBLIC FOLDER SHARING


@api_view(['POST'])
def toggle_folder_public(request, folder_id):
   
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, status=401)
    
    folder = get_object_or_404(
        Folder,
        id=folder_id,
        owner=request.user,
        deleted_at__isnull=True
    )
    
    folder.is_public = not folder.is_public
    folder.save()
    
    return Response({
        'message': f'Folder is now {"public" if folder.is_public else "private"}',
        'is_public': folder.is_public,
        'share_url': folder.share_url if folder.is_public else None
    })


@api_view(['GET'])
def public_folders(request):
    """
    Browse all public folders (discovery page)
    """
    folders = Folder.objects.filter(
        is_public=True,
        deleted_at__isnull=True,
        parent__isnull=True  
    ).order_by('-updated_at')[:50]
    
    serializer = FolderListSerializer(folders, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['GET'])
def trending_folders(request):
    """
    Get trending public folders (most added to libraries)
    """
    from django.db.models import Count
    
    folders = Folder.objects.filter(
        is_public=True,
        deleted_at__isnull=True,
        parent__isnull=True
    ).annotate(
        library_adds=Count('added_by')
    ).filter(
        library_adds__gt=0
    ).order_by('-library_adds', '-updated_at')[:20]
    
    serializer = FolderListSerializer(folders, many=True, context={'request': request})
    return Response(serializer.data)



@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    
    if not created:
        return

    try:
        UserProfile.objects.get_or_create(user=instance)
    except IntegrityError as exc:
        # Someone else may have created it concurrently — log and continue.
        logger.exception("IntegrityError while creating UserProfile for %s: %s", instance.id, exc)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """Save profile when user is saved"""
    if hasattr(instance, 'profile'):
        instance.profile.save()


# ✅ PDF TEXT EXTRACTION
# ==========================================

@api_view(['POST'])
def extract_pdf_text(request, pdf_id):
    """
    Extract text from a PDF file
    """
    user = request.user
    pdf = get_object_or_404(PDF, id=pdf_id, folder__owner=user, deleted_at__isnull=True)
    
    # Check if already extracted
    if pdf.text_extraction_status == 'completed' and pdf.extracted_text:
        return Response({
            'message': 'Text already extracted',
            'text': pdf.extracted_text,
            'page_count': pdf.page_count
        })
    
    # Mark as processing
    pdf.text_extraction_status = 'processing'
    pdf.save()
    
    try:
        # Extract text
        result = extract_text_from_pdf(pdf.file)
        
        if result['success']:
            pdf.extracted_text = result['text']
            pdf.page_count = result['page_count']
            pdf.text_extraction_status = 'completed'
            pdf.save()
            
            return Response({
                'message': 'Text extracted successfully',
                'text': result['text'],
                'page_count': result['page_count']
            })
        else:
            pdf.text_extraction_status = 'failed'
            pdf.save()
            
            return Response({
                'error': result['error']
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    except Exception as e:
        pdf.text_extraction_status = 'failed'
        pdf.save()
        
        return Response({
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def search_pdf_content(request):
    """
    ✅ SEARCH INSIDE PDF CONTENT
    Query param: q (search query)
    """
    user = request.user
    query = request.GET.get('q', '').strip()
    
    if not query or len(query) < 3:
        return Response({
            'error': 'Search query must be at least 3 characters'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Search in extracted text
    results = PDF.objects.filter(
        folder__owner=user,
        deleted_at__isnull=True,
        text_extraction_status='completed',
        extracted_text__icontains=query
    )[:20]
    
    # Build response with context
    search_results = []
    for pdf in results:
        # Find the query in text and extract context
        text_lower = pdf.extracted_text.lower()
        query_lower = query.lower()
        
        matches = []
        start = 0
        while True:
            index = text_lower.find(query_lower, start)
            if index == -1:
                break
            
            # Extract 100 chars before and after
            context_start = max(0, index - 100)
            context_end = min(len(pdf.extracted_text), index + len(query) + 100)
            context = pdf.extracted_text[context_start:context_end]
            
            # Highlight the query
            context = context.replace(query, f"**{query}**")
            
            matches.append({
                'context': context,
                'position': index
            })
            
            start = index + 1
            
            # Limit to 3 matches per PDF
            if len(matches) >= 3:
                break
        
        search_results.append({
            'pdf_id': pdf.id,
            'title': pdf.title,
            'folder_id': pdf.folder.id,
            'matches': matches,
            'match_count': len(matches)
        })
    
    return Response({
        'query': query,
        'count': len(search_results),
        'results': search_results
    })


# ==========================================
# ✅ AI QUIZ GENERATION
# ==========================================

@api_view(['POST'])
def generate_quiz(request, pdf_id):
    """
    Generate quiz questions from PDF using AI
    Body: { "num_questions": 5 }
    """
    user = request.user
    pdf = get_object_or_404(PDF, id=pdf_id, folder__owner=user, deleted_at__isnull=True)
    
    num_questions = request.data.get('num_questions', 5)
    
    # Check if text is extracted
    if pdf.text_extraction_status != 'completed' or not pdf.extracted_text:
        # Extract text first
        result = extract_text_from_pdf(pdf.file)
        if result['success']:
            pdf.extracted_text = result['text']
            pdf.page_count = result['page_count']
            pdf.text_extraction_status = 'completed'
            pdf.save()
        else:
            return Response({
                'error': 'Failed to extract PDF text'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Check if questions already exist
    existing_questions = AIGeneratedQuestion.objects.filter(pdf=pdf)
    if existing_questions.exists():
        return Response({
            'message': 'Questions already generated',
            'count': existing_questions.count(),
            'questions': [
                {
                    'id': q.id,
                    'question': q.question,
                    'options': q.options,
                    'correct_answer': q.correct_answer,
                    'explanation': q.explanation,
                    'difficulty': q.difficulty
                }
                for q in existing_questions
            ]
        })
    
    # Generate questions using AI
    try:
        questions_data = generate_quiz_questions_with_ai(pdf.extracted_text, num_questions)
        
        # Save to database
        created_questions = []
        for q_data in questions_data:
            question = AIGeneratedQuestion.objects.create(
                pdf=pdf,
                question=q_data['question'],
                options=q_data['options'],
                correct_answer=q_data['correct_answer'],
                explanation=q_data.get('explanation', ''),
                difficulty=q_data.get('difficulty', 'medium'),
                source_text=q_data.get('source_text', '')
            )
            created_questions.append(question)
        
        return Response({
            'message': f'Generated {len(created_questions)} questions',
            'count': len(created_questions),
            'questions': [
                {
                    'id': q.id,
                    'question': q.question,
                    'options': q.options,
                    'correct_answer': q.correct_answer,
                    'explanation': q.explanation,
                    'difficulty': q.difficulty
                }
                for q in created_questions
            ]
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'error': f'Failed to generate questions: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_quiz(request, pdf_id):
    """Get all quiz questions for a PDF"""
    user = request.user
    pdf = get_object_or_404(PDF, id=pdf_id, folder__owner=user, deleted_at__isnull=True)
    
    questions = AIGeneratedQuestion.objects.filter(pdf=pdf)
    
    return Response({
        'count': questions.count(),
        'questions': [
            {
                'id': q.id,
                'question': q.question,
                'options': q.options,
                'difficulty': q.difficulty
            }
            for q in questions
        ]
    })


@api_view(['POST'])
def submit_quiz(request, pdf_id):
    """
    Submit quiz answers and get results
    Body: { "answers": {"1": "A", "2": "B", ...}, "time_taken": 180 }
    """
    user = request.user
    pdf = get_object_or_404(PDF, id=pdf_id, folder__owner=user, deleted_at__isnull=True)
    
    answers = request.data.get('answers', {})
    time_taken = request.data.get('time_taken')
    
    # Get all questions
    questions = AIGeneratedQuestion.objects.filter(pdf=pdf)
    
    # Calculate score
    correct_count = 0
    results = []
    
    for question in questions:
        user_answer = answers.get(str(question.id))
        is_correct = user_answer == question.correct_answer
        
        if is_correct:
            correct_count += 1
        
        results.append({
            'question_id': question.id,
            'question': question.question,
            'user_answer': user_answer,
            'correct_answer': question.correct_answer,
            'is_correct': is_correct,
            'explanation': question.explanation
        })
    
    total_questions = questions.count()
    score_percentage = (correct_count / total_questions * 100) if total_questions > 0 else 0
    
    # Save attempt
    QuizAttempt.objects.create(
        user=user,
        pdf=pdf,
        total_questions=total_questions,
        correct_answers=correct_count,
        score_percentage=score_percentage,
        answers=answers,
        time_taken_seconds=time_taken
    )
    
    return Response({
        'score': correct_count,
        'total': total_questions,
        'percentage': score_percentage,
        'results': results
    })


# ==========================================
# ✅ AI SUMMARY & FLASHCARDS
# ==========================================

@api_view(['POST'])
def generate_summary(request, pdf_id):
    """Generate AI summary of PDF"""
    user = request.user
    pdf = get_object_or_404(PDF, id=pdf_id, folder__owner=user, deleted_at__isnull=True)
    
    # Extract text if needed
    if pdf.text_extraction_status != 'completed':
        result = extract_text_from_pdf(pdf.file)
        if result['success']:
            pdf.extracted_text = result['text']
            pdf.text_extraction_status = 'completed'
            pdf.save()
        else:
            return Response({'error': 'Failed to extract text'}, status=500)
    
    # Generate summary
    summary = generate_summary_with_ai(pdf.extracted_text)
    
    if summary:
        # Save to description
        pdf.description = summary
        pdf.save()
        
        return Response({'summary': summary})
    else:
        return Response({'error': 'Failed to generate summary'}, status=500)


@api_view(['POST'])
def generate_flashcards(request, pdf_id):
    """Generate flashcards from PDF"""
    user = request.user
    pdf = get_object_or_404(PDF, id=pdf_id, folder__owner=user, deleted_at__isnull=True)
    
    num_cards = request.data.get('num_cards', 10)
    
    # Extract text if needed
    if pdf.text_extraction_status != 'completed':
        result = extract_text_from_pdf(pdf.file)
        if result['success']:
            pdf.extracted_text = result['text']
            pdf.text_extraction_status = 'completed'
            pdf.save()
    
    # Generate flashcards
    flashcards = generate_flashcards_with_ai(pdf.extracted_text, num_cards)
    
    return Response({
        'count': len(flashcards),
        'flashcards': flashcards
    })