# backend/mensajes/serializers.py

from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Mensaje

User = get_user_model()

class MensajeSerializer(serializers.ModelSerializer):
    # Lectura
    remitente             = serializers.ReadOnlyField(source='remitente.username')
    remitente_id          = serializers.ReadOnlyField(source='remitente.id')
    remitente_avatar      = serializers.SerializerMethodField()

    # Escritura / lectura de PK
    destinatario          = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    destinatario_username = serializers.ReadOnlyField(source='destinatario.username')
    destinatario_avatar   = serializers.SerializerMethodField()

    class Meta:
        model = Mensaje
        fields = [
            'id',
            'remitente',
            'remitente_id',
            'remitente_avatar',
            'destinatario',
            'destinatario_username',
            'destinatario_avatar',
            'contenido',
            'leido',
            'fecha_envio',
        ]
        read_only_fields = [
            'id',
            'fecha_envio',
            'remitente',
            'remitente_id',
            'destinatario_username',
            'leido',
        ]

    def get_remitente_avatar(self, obj):
        request = self.context.get('request')
        avatar = obj.remitente.avatar
        if avatar and hasattr(avatar, 'url'):
            url = avatar.url
            return request.build_absolute_uri(url) if request else url
        return None

    def get_destinatario_avatar(self, obj):
        request = self.context.get('request')
        avatar = obj.destinatario.avatar
        if avatar and hasattr(avatar, 'url'):
            url = avatar.url
            return request.build_absolute_uri(url) if request else url
        return None
