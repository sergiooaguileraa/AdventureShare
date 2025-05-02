from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from .models import Valoracion
from .serializers import ValoracionSerializer

class ValoracionViewSet(viewsets.ModelViewSet):
    """
    CRUD de valoraciones.
    Solo usuarios autenticados pueden crear y ver valoraciones.
    """
    queryset = Valoracion.objects.all().order_by('-creado_en')
    serializer_class = ValoracionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Asigna automáticamente el autor
        serializer.save(autor=self.request.user)
