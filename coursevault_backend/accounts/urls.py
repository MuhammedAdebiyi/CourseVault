from django.urls import path
from .views import (
    CustomTokenObtainPairView,
    RegisterView,
    VerifyEmailView,
    ResendCodeView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("verify-email/", VerifyEmailView.as_view(), name="verify_email"),
    path("resend-code/", ResendCodeView.as_view(), name="resend_code"),
    path("login/", CustomTokenObtainPairView.as_view(), name="login"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
