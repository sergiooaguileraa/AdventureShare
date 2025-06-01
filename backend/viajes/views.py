# backend/viajes/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Viaje
from .serializers import ViajeSerializer
from .permissions import IsOrganizerOrReadOnly

class ViajeViewSet(viewsets.ModelViewSet):
    """
    CRUD de viajes:
    - List/Retrieve: público
    - Create/Update/Delete: solo organizador
    - + acción extra ‘cancelar’
    """
    queryset = Viaje.objects.all().order_by('-fecha_inicio')
    serializer_class = ViajeSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOrganizerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        # Aquí asignamos siempre al usuario autenticado como organizador
        serializer.save(organizador=self.request.user)

    @action(detail=True, methods=['post'], url_path='cancelar')
    def cancelar(self, request, pk=None):
        viaje = self.get_object()
        viaje.cancelled = True
        viaje.save()
        return Response({'status': 'cancelado'}, status=status.HTTP_200_OK)
