from rest_framework import serializers
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model   = Usuario
        fields  = ['id','username','email','role','date_joined']
        read_only_fields = ['id','date_joined']
