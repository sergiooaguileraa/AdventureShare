from rest_framework import serializers
from .models import Valoracion

class ValoracionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Valoracion
        fields = [
            'id',
            'viaje',
            'autor',
            'puntuacion',
            'comentario',
            'creado_en',
        ]
        read_only_fields = ['id', 'creado_en']
