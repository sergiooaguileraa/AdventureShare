# reservas/views.py

from rest_framework import viewsets, permissions
from .models import Reserva
from .serializers import ReservaSerializer

class ReservaViewSet(viewsets.ModelViewSet):
    """
    Gestión de reservas.
    Solo el viajero que creó la reserva o un admin pueden verla y modificarla.
    """
    serializer_class = ReservaSerializer
    # Permitimos cualquier acceso (solo para desarrollo/mock)
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        user = self.request.user
        # Admin ve todas, usuarios solo las suyas
        if user and user.is_staff:
            return Reserva.objects.all().order_by('-fecha_reserva')
        if user:
            return Reserva.objects.filter(viajero=user).order_by('-fecha_reserva')
        # Si no hay user (mock), devolvemos todas para probar
        return Reserva.objects.all().order_by('-fecha_reserva')

    def perform_create(self, serializer):
        # Asigna el usuario autenticado como viajero, sin pedirlo en el POST
        # En mock, self.request.user podría ser None, así que solo si existe:
        if self.request.user and self.request.user.is_authenticated:
            serializer.save(viajero=self.request.user)
        else:
            # En mock, asignamos un viajero por defecto (id=1 por ejemplo)
            serializer.save(viajero_id=1)

