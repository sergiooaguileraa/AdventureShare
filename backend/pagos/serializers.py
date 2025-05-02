from rest_framework import serializers
from .models import Pago

class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = [
            'id',
            'reserva',
            'metodo',
            'importe',
            'estado',
            'fecha_pago',
        ]
        read_only_fields = ['id', 'fecha_pago']
