# backend/pagos/serializers.py  

from rest_framework import serializers
from .models import Pago
from reservas.serializers import ReservaSerializer

class PagoSerializer(serializers.ModelSerializer):
    # Anidamos la reserva completa
    reserva = ReservaSerializer(read_only=True)

    # Campos adicionales para el front
    viajero_username = serializers.CharField(
        source='reserva.viajero_username', read_only=True
    )
    viaje_titulo = serializers.CharField(
        source='reserva.viaje.titulo', read_only=True
    )

    class Meta:
        model = Pago
        fields = [
            'id',
            'reserva',            # toda la info de la reserva
            'viajero_username',   # quien pagó
            'viaje_titulo',       # título del viaje
            'metodo',
            'importe',
            'estado',
            'fecha_pago',
        ]
        read_only_fields = ['id', 'fecha_pago', 'viajero_username', 'viaje_titulo']


