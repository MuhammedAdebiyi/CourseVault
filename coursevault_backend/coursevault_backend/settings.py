"""
Django settings for coursevault_backend project.
"""

from pathlib import Path
import logging

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY

SECRET_KEY = '***REMOVED***'
DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# INSTALLED APPS

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'storages',
    'accounts',
    'folders',
]

# MIDDLEWARE

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'coursevault_backend.urls'


# TEMPLATES

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'coursevault_backend.wsgi.application'


# AUTH

AUTH_USER_MODEL = "accounts.CustomUser"


# CORS

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
]

CSRF_COOKIE_HTTPONLY = False
CSRF_COOKIE_SAMESITE = 'Lax'
CSRF_USE_SESSIONS = False


# DATABASE

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# REST FRAMEWORK

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
    ),
}

# CELERY

CELERY_BROKER_URL = "redis://127.0.0.1:6379/0"
CELERY_RESULT_BACKEND = "redis://127.0.0.1:6379/0"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = "Africa/Lagos"


# SMTP

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = "devbyadebiyi@gmail.com"
EMAIL_HOST_PASSWORD = "***REMOVED***"
DEFAULT_FROM_EMAIL = "CourseVault <devbyadebiyi@gmail.com>"


# INTERNATIONALIZATION

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True


# STATIC FILES

STATIC_URL = 'static/'


# CLOUDFLARE R2 STORAGE

STORAGES = {
    "default": {  
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        "OPTIONS": {
            "access_key": "***REMOVED***",
            "secret_key": "***REMOVED***",
            "bucket_name": "coursevault-files",
            "endpoint_url": "https://04ae8418853853c716df4f26bbc75fdd.r2.cloudflarestorage.com",
        },
    },
    "staticfiles": {  
        "BACKEND": "storages.backends.s3boto3.S3Boto3Storage",
        "OPTIONS": {
            "access_key": "***REMOVED***",
            "secret_key": "***REMOVED***",
            "bucket_name": "coursevault-files",
            "endpoint_url": "https://04ae8418853853c716df4f26bbc75fdd.r2.cloudflarestorage.com",
           
        },
    },
}

AWS_S3_REGION_NAME = None
AWS_S3_ADDRESSING_STYLE = "virtual"
AWS_S3_SIGNATURE_VERSION = "s3v4"
AWS_DEFAULT_ACL = None
AWS_QUERYSTRING_AUTH = False
AWS_S3_OBJECT_PARAMETERS = {"CacheControl": "max-age=86400"}


if DEBUG:
    STATICFILES_DIRS = []
    STATIC_ROOT = BASE_DIR / "staticfiles"
    STORAGES["staticfiles"] = {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"
    }

ALLOWED_HOSTS = ["127.0.0.1", "localhost"]
