from django.db.models import Q
from rest_framework import viewsets, permissions
from .models import Mensaje
from .serializers import MensajeSerializer

class MensajeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Mensaje:
      - Solo usuarios autenticados pueden acceder.
      - Devuelve mensajes enviados o recibidos por el usuario, ordenados de más reciente a más antiguo.
      - Al crear, asigna automáticamente el campo `remitente` al usuario actual.
    """
    serializer_class = MensajeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Usamos Q para unir filtros y distinct() para evitar duplicados
        return (
            Mensaje.objects
            .filter(Q(remitente=user) | Q(destinatario=user))
            .order_by('-created_at')
            .distinct()
        )

    def perform_create(self, serializer):
        # Asigna automáticamente el remitente
        serializer.save(remitente=self.request.user)

