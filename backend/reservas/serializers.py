from rest_framework import serializers
from .models import Reserva

class ReservaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = [
            'id',
            'viaje',
            'viajero',
            'fecha_reserva',
            'estado',
        ]
        read_only_fields = ['id', 'fecha_reserva']
