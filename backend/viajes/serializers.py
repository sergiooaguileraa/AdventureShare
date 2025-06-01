# backend/viajes/serializers.py

from rest_framework import serializers
from .models import Viaje

class ViajeSerializer(serializers.ModelSerializer):
    organizador = serializers.SerializerMethodField()
    organizador_id = serializers.ReadOnlyField(source='organizador.id')
    organizador_avatar = serializers.SerializerMethodField()
    imagen_url = serializers.SerializerMethodField()
    # Nuevo campo para exponer el estado de cancelación
    cancelled = serializers.ReadOnlyField()

    class Meta:
        model = Viaje
        fields = [
            'id',
            'organizador',
            'organizador_id',
            'organizador_avatar',
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
            'cancelled',  # ← lo añadimos aquí
        ]
        read_only_fields = ['id', 'organizador', 'plazas_disponibles', 'cancelled']

    def get_imagen_url(self, obj):
        request = self.context.get('request')
        if obj.imagen and hasattr(obj.imagen, 'url'):
            url = obj.imagen.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_organizador(self, obj):
        return obj.organizador.username

    def get_organizador_avatar(self, obj):
        request = self.context.get('request')
        avatar = obj.organizador.avatar
        if avatar and hasattr(avatar, 'url'):
            url = avatar.url
            return request.build_absolute_uri(url) if request else url
        return None


