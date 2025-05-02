from django.db import models

# Create your models here.
from django.db import models
from reservas.models import Reserva

class Pago(models.Model):
    METODOS = (
        ('stripe','Stripe'),
        ('paypal','PayPal'),
    )
    ESTADOS = (
        ('pagado','Pagado'),
        ('pendiente','Pendiente'),
        ('reembolsado','Reembolsado'),
    )
    reserva    = models.OneToOneField(Reserva,
                                      on_delete=models.CASCADE,
                                      related_name='pago')
    metodo     = models.CharField(max_length=10, choices=METODOS)
    importe    = models.DecimalField(max_digits=8, decimal_places=2)
    estado     = models.CharField(max_length=12,
                                  choices=ESTADOS,
                                  default='pendiente')
    fecha_pago = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pago {self.id} ({self.get_metodo_display()})"
