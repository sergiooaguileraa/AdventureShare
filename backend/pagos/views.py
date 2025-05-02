from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, permissions
from .models import Pago
from .serializers import PagoSerializer

class PagoViewSet(viewsets.ModelViewSet):
    """
    Gestión de pagos.
    Solo el usuario que hizo la reserva o un admin pueden ver su pago.
    """
    queryset = Pago.objects.all().order_by('-fecha_pago')
    serializer_class = PagoSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated()]
