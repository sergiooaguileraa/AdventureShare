# backend/valoraciones/serializers.py

from rest_framework import serializers
from .models import Valoracion


class ValoracionSerializer(serializers.ModelSerializer):
    # Campo adicional de solo lectura para exponer el username del autor
    autor_username = serializers.ReadOnlyField(source='autor.username')

    class Meta:
        model = Valoracion
        fields = [
            'id',
            'viaje',
            'autor',            # PK del usuario que creó la valoración (solo lectura)
            'autor_username',   # Nombre de usuario en texto (solo lectura)
            'puntuacion',
            'comentario',
            'creado_en',        # Timestamp de creación (solo lectura)
        ]
        read_only_fields = [
            'id',
            'autor',
            'autor_username',
            'creado_en',
        ]

