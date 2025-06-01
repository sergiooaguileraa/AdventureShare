# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from usuarios.views import (
    UserRegistrationView,
    CurrentUserView,
    ChangePasswordView,
    UsuarioViewSet,
    CustomTokenObtainPairView,  # vista JWT custom
    PublicUserView              # vista perfil público
)
from rest_framework_simplejwt.views import TokenRefreshView

from viajes.views       import ViajeViewSet
from reservas.views     import ReservaViewSet
from pagos.views        import PagoViewSet
from valoraciones.views import ValoracionViewSet
from mensajes.views     import MensajeViewSet

# Configura el router para los viewsets "genéricos"
router = DefaultRouter()
router.register(r'usuarios',     UsuarioViewSet,     basename='usuario')
router.register(r'viajes',       ViajeViewSet,       basename='viaje')
router.register(r'reservas',     ReservaViewSet,     basename='reserva')
router.register(r'pagos',        PagoViewSet,        basename='pago')
router.register(r'valoraciones', ValoracionViewSet,  basename='valoracion')
router.register(r'mensajes',     MensajeViewSet,     basename='mensaje')

urlpatterns = [
    # Panel de administración
    path('admin/', admin.site.urls),

    # ———  ENDPOINTS DE USUARIO (ANTES DEL ROUTER)  ———

    # 1) Registro público
    path('api/register/'          , UserRegistrationView.as_view(), name='user-register'),
    path('api/usuarios/register/' , UserRegistrationView.as_view(), name='user-register-usuarios'),

    # 2) "Mi perfil" (GET / PATCH)
    path('api/me/'                , CurrentUserView.as_view(),      name='current-user'),
    path('api/usuarios/me/'       , CurrentUserView.as_view()),

    # 3) Cambio de contraseña (POST)
    path('api/me/password/'       , ChangePasswordView.as_view(),   name='change-password'),
    path('api/usuarios/me/password/', ChangePasswordView.as_view()),

    # 4) Perfil PÚBLICO de cualquier usuario (no requiere login)
    #    /api/usuarios_publicos/<pk>/
    path('api/usuarios_publicos/<int:pk>/', PublicUserView.as_view(), name='public-user'),

    # ———  JWT AUTH PERSONALIZADO  ———
    path('api/token/'             , CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/'     , TokenRefreshView.as_view(),           name='token_refresh'),

    # ———  Resto de la API  ———
    path('api/'                   , include(router.urls)),

    # DRF browsable API login/logout (opcional)
    path('api-auth/'              , include('rest_framework.urls', namespace='rest_framework')),
]

# Para servir ficheros media en desarrollo
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
