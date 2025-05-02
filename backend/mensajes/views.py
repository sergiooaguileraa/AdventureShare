from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from .models import Mensaje
from .serializers import MensajeSerializer

class MensajeViewSet(viewsets.ModelViewSet):
    """
    Chat de mensajes.
    Solo usuarios autenticados pueden enviar y ver sus mensajes.
    """
    serializer_class = MensajeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Muestra solo los mensajes que envías o recibes
        user = self.request.user
        return Mensaje.objects.filter(
            remitente=user
        ) | Mensaje.objects.filter(destinatario=user)

    def perform_create(self, serializer):
        # Asigna automáticamente el remitente
        serializer.save(remitente=self.request.user)
