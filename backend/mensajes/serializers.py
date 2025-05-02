from rest_framework import serializers
from .models import Mensaje

class MensajeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Mensaje
        fields = [
            'id',
            'remitente',
            'destinatario',
            'contenido',
            'leido',
            'fecha_envio',
        ]
        read_only_fields = ['id', 'fecha_envio']
