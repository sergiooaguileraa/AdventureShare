from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings

class Viaje(models.Model):
    organizador   = models.ForeignKey(settings.AUTH_USER_MODEL,
                                      on_delete=models.CASCADE,
                                      related_name='viajes_creados')
    titulo        = models.CharField(max_length=200)
    descripcion   = models.TextField()
    fecha_inicio  = models.DateField()
    fecha_fin     = models.DateField()
    origen        = models.CharField(max_length=100)
    destino       = models.CharField(max_length=100)
    plazas_totales= models.PositiveIntegerField()
    precio        = models.DecimalField(max_digits=8, decimal_places=2)
    creado_en     = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.titulo} ({self.origen} → {self.destino})"
