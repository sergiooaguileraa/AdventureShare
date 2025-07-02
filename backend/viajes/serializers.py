from rest_framework import serializers
from .models import Viaje

class ViajeSerializer(serializers.ModelSerializer):
    organizador = serializers.SerializerMethodField()
    organizador_id = serializers.ReadOnlyField(source='organizador.id')
    organizador_avatar = serializers.SerializerMethodField()
    imagen_url = serializers.SerializerMethodField()

    # AFORO TOTAL (sólo lectura mediante alias total_plazas)
    total_plazas = serializers.IntegerField(source='plazas_totales', read_only=True)
    # PLAZAS RESTANTES (sólo lectura mediante alias disponibles)
    disponibles = serializers.IntegerField(source='plazas_disponibles', read_only=True)

    cancelled = serializers.ReadOnlyField()

    class Meta:
        model = Viaje
        fields = [
            'id',
            'organizador', 'organizador_id', 'organizador_avatar',
            'titulo', 'descripcion', 'origen', 'destino',
            'fecha_inicio', 'fecha_fin', 'precio',
            'plazas_totales',            # Aforo total (editable)
            'plazas_disponibles',        # Plazas disponibles (editable o calculado en save)
            'total_plazas', 'disponibles',
            'imagen', 'imagen_url',
            'cancelled',
        ]
        read_only_fields = [
            'id', 'organizador',
            'plazas_disponibles',        # Sólo lectura, se inicializa en save()
            'total_plazas', 'disponibles',
            'cancelled',
        ]

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



