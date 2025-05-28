# backend/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Importa tus vistas y viewsets
from usuarios.views import (
    UserRegistrationView,
    CurrentUserView,
    ChangePasswordView,
    UsuarioViewSet,
)
from viajes.views       import ViajeViewSet
from reservas.views     import ReservaViewSet
from pagos.views        import PagoViewSet
from valoraciones.views import ValoracionViewSet
from mensajes.views     import MensajeViewSet

# Configura el router para los viewsets “genéricos”
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

    # ——— Endpoints de usuario (deben ir ANTES del router) ———
    # Registro público
    path('api/register/', UserRegistrationView.as_view(), name='user-register'),

    # “Mi perfil” (GET, PATCH) — ruta principal
    path('api/me/', CurrentUserView.as_view(), name='current-user'),
    # — alias exactamente igual, para no romper el frontend que usa /api/usuarios/me/
    path('api/usuarios/me/', CurrentUserView.as_view()),

    # Cambio de contraseña (POST) — ruta principal
    path('api/me/password/', ChangePasswordView.as_view(), name='change-password'),
    # — alias para /api/usuarios/me/password/
    path('api/usuarios/me/password/', ChangePasswordView.as_view()),

    # ——— JWT Auth ———
    path('api/token/',         TokenObtainPairView.as_view(),   name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(),      name='token_refresh'),

    # ——— Resto de tu API ———
    path('api/', include(router.urls)),

    # DRF browsable API login/logout (opcional)
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]

# Para servir ficheros media en desarrollo
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)



