from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings
from viajes.models import Viaje

class Valoracion(models.Model):
    viaje        = models.ForeignKey(Viaje,
                                     on_delete=models.CASCADE,
                                     related_name='valoraciones')
    autor        = models.ForeignKey(settings.AUTH_USER_MODEL,
                                     on_delete=models.SET_NULL,
                                     null=True,
                                     related_name='valoraciones')
    puntuacion   = models.PositiveSmallIntegerField()  # rango 1–5
    comentario   = models.TextField()
    creado_en    = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.puntuacion}★ por {self.autor}"
