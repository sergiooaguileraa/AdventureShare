# backend/mensajes/views.py

from django.db.models import Q
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Mensaje
from .serializers import MensajeSerializer

class MensajeViewSet(viewsets.ModelViewSet):
    """
    ViewSet para Mensaje:
      - Solo usuarios autenticados pueden acceder.
      - get_queryset(): devuelve todos los mensajes enviados o recibidos por el usuario,
        ordenados de más reciente a más antiguo.
      - perform_create(): al crear, asigna automáticamente el remitente al usuario actual.
      - conversacion/:user_id/: GET personalizado para hilo con otro usuario.
    """
    serializer_class = MensajeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            Mensaje.objects
            .filter(Q(remitente=user) | Q(destinatario=user))
            .order_by('-fecha_envio')
            .distinct()
        )

    def perform_create(self, serializer):
        serializer.save(remitente=self.request.user)

    @action(detail=False, methods=['get'], url_path=r'conversacion/(?P<user_id>\d+)')
    def conversacion(self, request, user_id=None):
        """
        GET /api/mensajes/conversacion/{user_id}/
        Recupera el hilo completo (cronológico) entre request.user y user_id,
        y marca como leídos todos los mensajes que recibiste de ese user_id.
        """
        User = get_user_model()
        otro = get_object_or_404(User, pk=user_id)

        # 1) Recuperar todo el hilo ordenado ascendente
        hilo = Mensaje.objects.filter(
            Q(remitente=request.user, destinatario=otro) |
            Q(remitente=otro, destinatario=request.user)
        ).order_by('fecha_envio')

        # 2) Marcar como leído todos los que tú recibiste de "otro"
        Mensaje.objects.filter(
            remitente=otro,
            destinatario=request.user,
            leido=False
        ).update(leido=True)

        # 3) Serializar y paginar (si aplica)
        page = self.paginate_queryset(hilo)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(hilo, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


