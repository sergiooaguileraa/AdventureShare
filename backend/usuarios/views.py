# backend/usuarios/views.py

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from rest_framework import generics, viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    UserRegistrationSerializer,
    UsuarioSerializer,
    CustomTokenObtainPairSerializer
)
from usuarios.models import Usuario


class UserRegistrationView(generics.CreateAPIView):
    """
    Registro público de nuevos usuarios.
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class CurrentUserView(generics.RetrieveUpdateAPIView):
    """
    Permite al usuario autenticado ver y editar su propio perfil.
    """
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user


class ChangePasswordView(APIView):
    """
    Permite al usuario autenticado cambiar su contraseña de forma segura.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        # Verificar contraseña actual
        if not user.check_password(old_password):
            return Response(
                {'old_password': ['Contraseña antigua incorrecta.']},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validar la nueva contraseña
        try:
            validate_password(new_password, user)
        except ValidationError as e:
            return Response(
                {'new_password': e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Guardar la nueva contraseña
        user.set_password(new_password)
        user.save()
        return Response(
            {'detail': 'Contraseña actualizada con éxito.'},
            status=status.HTTP_200_OK
        )


class UsuarioViewSet(viewsets.ModelViewSet):
    """
    Gestión de usuarios (solo para administradores).
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAdminUser]
    parser_classes = [MultiPartParser, FormParser]


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Endpoint para login JWT que usa el serializer custom
    para distinguir errores de usuario/password.
    """
    serializer_class = CustomTokenObtainPairSerializer


class PublicUserView(generics.RetrieveAPIView):
    """
    Recupera el perfil público de cualquier usuario:
    avatar, bio, username (y cualquier otro campo que definas
    en UsuarioSerializer). No requiere autenticación.
    
    Ruta: GET /api/usuarios_publicos/<pk>/
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [AllowAny]

