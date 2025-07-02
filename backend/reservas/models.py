# reservas/models.py

from django.db import models
from django.conf import settings
from viajes.models import Viaje

class Reserva(models.Model):
    # Definimos constantes para evitar errores de tipeo
    ESTADO_PENDIENTE   = 'pendiente'
    ESTADO_CONFIRMADA  = 'confirmada'
    ESTADO_RECHAZADA   = 'rechazada'
    ESTADO_CANCELADA   = 'cancelada'

    ESTADOS = (
        (ESTADO_PENDIENTE,  'Pendiente'),
        (ESTADO_CONFIRMADA, 'Confirmada'),
        (ESTADO_RECHAZADA,  'Rechazada'),
        (ESTADO_CANCELADA,  'Cancelada'),
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

    importe = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        help_text="Importe que debe pagar el viajero"
    )

    pagado = models.BooleanField(
        default=False,
        help_text="True cuando el viajero haya pagado"
    )

    estado = models.CharField(
        max_length=10,
        choices=ESTADOS,
        default=ESTADO_PENDIENTE
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
        return (
            f"Reserva #{self.id} ({self.estado}) de "
            f"{self.viajero.username} en '{self.viaje}' el {fecha_str}"
        )

