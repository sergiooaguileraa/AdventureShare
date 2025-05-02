from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from .models import Viaje
from .serializers import ViajeSerializer

class ViajeViewSet(viewsets.ModelViewSet):
    """
    CRUD de viajes.
    Solo usuarios autenticados pueden ver y crear viajes.
    """
    queryset = Viaje.objects.all().order_by('-creado_en')
    serializer_class = ViajeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Asigna automáticamente el organizador al usuario que crea el viaje
        serializer.save(organizador=self.request.user)
