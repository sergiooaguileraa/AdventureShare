from rest_framework import serializers
from .models import Reserva
from viajes.models import Viaje

class ViajeBasicSerializer(serializers.ModelSerializer):
    # Datos del organizador para el frontend
    organizador    = serializers.CharField(source='organizador.username', read_only=True)
    organizador_id = serializers.IntegerField(source='organizador.id',     read_only=True)

    # Cambiado a DateField, porque en el modelo Viaje es un DateField
    fecha_fin = serializers.DateField(read_only=True)

    class Meta:
        model  = Viaje
        fields = [
            'id',           # ID del viaje
            'titulo',       # Nombre del viaje
            'imagen',       # URL de la imagen de portada
            'fecha_inicio', # Fecha de inicio (DateTimeField o DateField según tu modelo)
            'fecha_fin',    # Fecha de fin del viaje (DateField)
            'organizador',  # Username del organizador
            'organizador_id' # ID del organizador
        ]

class ReservaSerializer(serializers.ModelSerializer):
    # Datos del viaje anidados
    viaje = ViajeBasicSerializer(read_only=True)

    # Para crear: el cliente envía solo viaje_id
    viaje_id = serializers.PrimaryKeyRelatedField(
        queryset=Viaje.objects.all(),
        write_only=True,
        source='viaje'
    )

    # Datos del viajero en solo lectura
    viajero_id       = serializers.IntegerField(source='viajero.id',       read_only=True)
    viajero_username = serializers.CharField(source='viajero.username',     read_only=True)
    viajero_avatar   = serializers.ImageField(source='viajero.avatar',      read_only=True)

    # Importe a pagar (campo de escritura)
    importe = serializers.DecimalField(max_digits=8, decimal_places=2)

    # Campos de solo lectura
    estado        = serializers.CharField(read_only=True)
    fecha_reserva = serializers.DateTimeField(read_only=True)
    pagado        = serializers.BooleanField(read_only=True)

    class Meta:
        model  = Reserva
        fields = [
            'id',
            'viaje',
            'viaje_id',
            'viajero_id',
            'viajero_username',
            'viajero_avatar',
            'estado',
            'fecha_reserva',
            'importe',
            'pagado',
        ]
        read_only_fields = [
            'id',
            'viajero_id',
            'viajero_username',
            'viajero_avatar',
            'estado',
            'fecha_reserva',
            'pagado',
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("El usuario no está autenticado.")

        viaje   = validated_data.pop('viaje')
        importe = validated_data.pop('importe')
        viajero = request.user

        # Evitar duplicados
        if Reserva.objects.filter(viaje=viaje, viajero=viajero).exists():
            raise serializers.ValidationError("Ya tienes una reserva para este viaje.")

        # Crear reserva (estado 'pendiente' y pagado=False por defecto)
        return Reserva.objects.create(
            viaje=viaje,
            viajero=viajero,
            importe=importe
        )






