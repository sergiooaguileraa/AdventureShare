"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Importa tus ViewSets y vistas adicionales
from usuarios.views      import UsuarioViewSet, UserRegistrationView, CurrentUserView
from viajes.views        import ViajeViewSet
from reservas.views      import ReservaViewSet
from pagos.views         import PagoViewSet
from valoraciones.views  import ValoracionViewSet
from mensajes.views      import MensajeViewSet

# Configuramos el router para los ViewSets
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

    # --- Rutas de usuarios ANTES del router para no ser sobreescritas ----
    path('api/usuarios/register/', UserRegistrationView.as_view(), name='user-register'),
    path('api/usuarios/me/',       CurrentUserView.as_view(),      name='current-user'),

    # API principal (ViewSets)
    path('api/', include(router.urls)),

    # Endpoints JWT para login y refresh de tokens
    path('api/token/',         TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(),  name='token_refresh'),

    # (Opcional) para poder probar la API con el navegador DRF
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
]

# Para servir ficheros media en desarrollo
from django.conf import settings
from django.conf.urls.static import static

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


