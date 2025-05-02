from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings
from viajes.models import Viaje

class Reserva(models.Model):
    ESTADOS = (
        ('pendiente', 'Pendiente'),
        ('confirmada','Confirmada'),
        ('cancelada','Cancelada'),
    )
    viaje        = models.ForeignKey(Viaje,
                                     on_delete=models.CASCADE,
                                     related_name='reservas')
    viajero      = models.ForeignKey(settings.AUTH_USER_MODEL,
                                     on_delete=models.CASCADE,
                                     related_name='reservas')
    fecha_reserva= models.DateTimeField(auto_now_add=True)
    estado       = models.CharField(max_length=10,
                                    choices=ESTADOS,
                                    default='pendiente')

    def __str__(self):
        return f"Reserva {self.id} de {self.viajero} en {self.viaje}"
