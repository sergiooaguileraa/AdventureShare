# backend/usuarios/serializers.py

from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed

Usuario = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    role = serializers.ChoiceField(
        choices=Usuario.ROLES,
        default='viajero'
    )

    class Meta:
        model = Usuario
        fields = [
            'id',
            'username',
            'email',
            'password',
            'password2',
            'role',
        ]
        extra_kwargs = {
            'password': {
                'write_only': True,
                'style': {'input_type': 'password'}
            },
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({
                'password2': 'Las contraseñas no coinciden.'
            })
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        role = validated_data.pop('role', 'viajero')
        user = Usuario.objects.create_user(
            **validated_data,
            role=role
        )
        return user


class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializer para que el usuario vea y edite su propio perfil.
    Incluye avatar y bio, y permite cambios parciales.
    """
    class Meta:
        model = Usuario
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'role',
            'avatar',
            'bio',
            'date_joined',
        ]
        read_only_fields = ['id', 'date_joined']

    def update(self, instance, validated_data):
        avatar = validated_data.pop('avatar', None)
        if avatar:
            if instance.avatar:
                instance.avatar.delete(save=False)
            instance.avatar = avatar

        return super().update(instance, validated_data)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer JWT que devuelve mensajes diferenciados si
    el usuario no existe o la contraseña es incorrecta.
    """
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        # 1) ¿Existe el usuario?
        user = Usuario.objects.filter(username=username).first()
        if user is None:
            raise AuthenticationFailed('Usuario no existe', 'no_user')

        # 2) ¿Contraseña correcta?
        if not user.check_password(password):
            raise AuthenticationFailed('Contraseña incorrecta', 'bad_password')

        # 3) Flujo normal para emisión de tokens
        return super().validate(attrs)

