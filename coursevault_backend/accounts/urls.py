from django.urls import path
from .views import (
    RegisterView, VerifyEmailView, CustomTokenObtainPairView,
    ResendCodeView, PasswordResetRequestView, PasswordResetConfirmView,
    UserProfileView, PublicUserView, CustomerDashboardView
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify-email"),
    path("login/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("resend-code/", ResendCodeView.as_view(), name="resend-code"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("me/", UserProfileView.as_view(), name="user-profile"),
    path("dashboard/", CustomerDashboardView.as_view(), name="customer-dashboard"),
    path("public/<int:user_id>/", PublicUserView.as_view(), name="public-user"),
]
