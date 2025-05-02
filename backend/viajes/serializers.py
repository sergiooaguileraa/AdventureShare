from rest_framework import serializers
from .models import Viaje

class ViajeSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Viaje
        fields = ['id','organizador','titulo','descripcion',
                  'fecha_inicio','fecha_fin','origen','destino',
                  'plazas_totales','precio','creado_en']
        read_only_fields = ['id','creado_en']
