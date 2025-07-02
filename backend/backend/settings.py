# backend/settings.py

import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()
BASE_DIR = Path(__file__).resolve().parent.parent

# ──────────────────────────────────────────────────────────────────────────────
# Claves y flags
# ──────────────────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY')
DEBUG = os.getenv('DJANGO_DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', '').split(',')

# ──────────────────────────────────────────────────────────────────────────────
# Estáticos y medios (deben ir aquí para staticfiles)
# ──────────────────────────────────────────────────────────────────────────────
STATIC_URL = '/static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ──────────────────────────────────────────────────────────────────────────────
# Aplicaciones instaladas
# ──────────────────────────────────────────────────────────────────────────────
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',    # <-- requiere STATIC_URL definido arriba
    'corsheaders',
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'django_filters',
    'usuarios',
    'viajes',
    'reservas',
    'pagos',
    'valoraciones',
    'mensajes',
]

# ──────────────────────────────────────────────────────────────────────────────
# Middleware
# ──────────────────────────────────────────────────────────────────────────────
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# ──────────────────────────────────────────────────────────────────────────────
# CORS
# ──────────────────────────────────────────────────────────────────────────────
CORS_ALLOWED_ORIGINS = ['http://localhost:3001']
CORS_ALLOW_CREDENTIALS = True

# ──────────────────────────────────────────────────────────────────────────────
# URLs y WSGI
# ──────────────────────────────────────────────────────────────────────────────
ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],              # rutas a carpetas de templates si las necesitas
        'APP_DIRS': True,        # busca /templates/ en cada app
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',           # opcional
                'django.template.context_processors.request',         # necesario para admin
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# ──────────────────────────────────────────────────────────────────────────────
# Bases de datos
# ──────────────────────────────────────────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB'),
        'USER': os.getenv('POSTGRES_USER'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD'),
        'HOST': os.getenv('POSTGRES_HOST', 'localhost'),
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
        'OPTIONS': {'client_encoding': 'UTF8'},
    }
}

# ──────────────────────────────────────────────────────────────────────────────
# Modelo de usuario
# ──────────────────────────────────────────────────────────────────────────────
AUTH_USER_MODEL = 'usuarios.Usuario'

# ──────────────────────────────────────────────────────────────────────────────
# Django REST Framework
# ──────────────────────────────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# ──────────────────────────────────────────────────────────────────────────────
# Validadores de contraseña
# ──────────────────────────────────────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ──────────────────────────────────────────────────────────────────────────────
# Localización
# ──────────────────────────────────────────────────────────────────────────────
LANGUAGE_CODE = 'es-es'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ──────────────────────────────────────────────────────────────────────────────
# Configuración de Email
# ──────────────────────────────────────────────────────────────────────────────
if DEBUG:
    # En desarrollo: imprime los correos en la consola
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
else:
    # En producción: configura tu SMTP real vía variables de entorno
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.tuproveedor.com')
    EMAIL_PORT = int(os.getenv('EMAIL_PORT', 587))
    EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER')
    EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD')
    EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
    DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'webmaster@tudominio.com')

# ──────────────────────────────────────────────────────────────────────────────
# Prefield ID
# ──────────────────────────────────────────────────────────────────────────────
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

