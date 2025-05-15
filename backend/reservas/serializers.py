# reservas/serializers.py

from rest_framework import serializers
from .models import Reserva

class ReservaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        # incluye los campos que quieras exponer
        fields = ['id', 'viaje', 'viajero', 'estado', 'fecha_reserva']
        read_only_fields = ['id', 'viajero', 'fecha_reserva']