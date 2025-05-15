from django.db import models
from django.conf import settings
from viajes.models import Viaje

class Reserva(models.Model):
    ESTADOS = (
        ('pendiente',   'Pendiente'),
        ('confirmada',  'Confirmada'),
        ('cancelada',   'Cancelada'),
    )

    viaje = models.ForeignKey(
        Viaje,
        on_delete=models.CASCADE,
        related_name='reservas'
    )
    viajero = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reservas'
    )
    fecha_reserva = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(
        max_length=10,
        choices=ESTADOS,
        default='pendiente'
    )

    class Meta:
        ordering = ['-fecha_reserva']
        constraints = [
            models.UniqueConstraint(
                fields=['viaje', 'viajero'],
                name='unique_reserva_por_usuario_y_viaje'
            ),
        ]

    def __str__(self):
        fecha_str = self.fecha_reserva.strftime('%Y-%m-%d %H:%M')
        return f"Reserva #{self.id} ({self.estado}) de {self.viajero.username} en '{self.viaje}' el {fecha_str}"

