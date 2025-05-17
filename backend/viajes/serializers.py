# backend/viajes/serializers.py

from rest_framework import serializers
from .models import Viaje

class ViajeSerializer(serializers.ModelSerializer):
    organizador = serializers.ReadOnlyField(source='organizador.username')
    imagen_url = serializers.SerializerMethodField()

    class Meta:
        model = Viaje
        fields = [
            'id',
            'organizador',
            'titulo',
            'descripcion',
            'origen',
            'destino',
            'fecha_inicio',
            'fecha_fin',
            'precio',
            'plazas_totales',
            'plazas_disponibles',
            'imagen',
            'imagen_url',
        ]
        read_only_fields = ['id', 'organizador', 'plazas_disponibles']

    def get_imagen_url(self, obj):
        request = self.context.get('request')
        if obj.imagen and hasattr(obj.imagen, 'url'):
            url = obj.imagen.url
            return request.build_absolute_uri(url) if request else url
        return None

    def create(self, validated_data):
        # Asignar el usuario autenticado como organizador
        user = self.context['request'].user
        validated_data['organizador'] = user
        # Dejar que DRF maneje el resto de la creación
        return super().create(validated_data)


