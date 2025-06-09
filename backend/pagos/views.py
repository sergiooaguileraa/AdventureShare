# backend/pagos/views.py

from rest_framework import viewsets, permissions
from .models import Pago
from .serializers import PagoSerializer

class PagoViewSet(viewsets.ModelViewSet):
    """
    Gestión de pagos.
    Solo el usuario que hizo la reserva o un admin pueden ver su pago.
    """
    serializer_class = PagoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Admins pueden ver todos los pagos
        if user.is_staff or user.is_superuser:
            return Pago.objects.all().order_by('-fecha_pago')
        # Usuarios normales solo sus pagos (a través de la reserva)
        return Pago.objects.filter(reserva__viajero=user).order_by('-fecha_pago')

