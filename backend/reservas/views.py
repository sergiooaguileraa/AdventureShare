from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from .models import Reserva
from .serializers import ReservaSerializer

class ReservaViewSet(viewsets.ModelViewSet):
    """
    Gestión de reservas.
    Solo el viajero que creó la reserva o un admin pueden verla y modificarla.
    """
    queryset = Reserva.objects.all().order_by('-fecha_reserva')
    serializer_class = ReservaSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # Guarda el viajero como el usuario autenticado
        serializer.save(viajero=self.request.user)
