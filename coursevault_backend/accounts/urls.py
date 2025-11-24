from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    VerifyEmailView,
    CustomTokenObtainPairView,
    ResendCodeView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    UserProfileView,
    CustomerDashboardView,
    PublicUserView,
)

urlpatterns = [
    # Registration & Verification
    path('register/', RegisterView.as_view(), name='register'),
    path('verify-email/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-code/', ResendCodeView.as_view(), name='resend-code'),
    
    # Login & Token Management
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),  # THIS IS THE LOGIN ENDPOINT
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Password Reset
    path('password-reset/', PasswordResetRequestView.as_view(), name='password-reset'),
    path('password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    
    # User Profile
    path('me/', UserProfileView.as_view(), name='user-profile'),
    path('dashboard/', CustomerDashboardView.as_view(), name='customer-dashboard'),
    path('users/<uuid:user_id>/', PublicUserView.as_view(), name='public-user'),
]