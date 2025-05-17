# backend/viajes/views.py

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.parsers import MultiPartParser, FormParser

from .models import Viaje
from .serializers import ViajeSerializer

class ViajeViewSet(viewsets.ModelViewSet):
    """
    CRUD de viajes:
    - GET (list/retrieve): abierto a todos (read-only)
    - POST, PUT, PATCH, DELETE: solo usuarios autenticados
    """
    queryset = Viaje.objects.all().order_by('-fecha_inicio')
    serializer_class = ViajeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [MultiPartParser, FormParser]

