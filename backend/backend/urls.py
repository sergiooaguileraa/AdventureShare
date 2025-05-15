"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Importa tus ViewSets
from usuarios.views      import UsuarioViewSet
from viajes.views        import ViajeViewSet
from reservas.views      import ReservaViewSet
from pagos.views         import PagoViewSet
from valoraciones.views  import ValoracionViewSet
from mensajes.views      import MensajeViewSet

# Configuramos el router
router = DefaultRouter()
router.register(r'usuarios',     UsuarioViewSet,     basename='usuario')
router.register(r'viajes',       ViajeViewSet,       basename='viaje')
router.register(r'reservas',     ReservaViewSet,     basename='reserva')
router.register(r'pagos',        PagoViewSet,        basename='pago')
router.register(r'valoraciones', ValoracionViewSet,  basename='valoracion')
router.register(r'mensajes',     MensajeViewSet,     basename='mensaje')

# Rutas principales
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),

    # Endpoints JWT
    path('api/token/',         TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(),  name='token_refresh'),
]
