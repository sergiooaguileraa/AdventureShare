from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from .models import Usuario
from .serializers import UsuarioSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    """
    Endpoint para gestionar usuarios.
    Solo usuarios administradores pueden listar, crear o modificar otros usuarios.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.IsAdminUser]
