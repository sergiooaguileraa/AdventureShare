# backend/viajes/models.py

from django.db import models
from django.conf import settings

class Viaje(models.Model):
    organizador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='viajes_creados'
    )
    titulo = models.CharField(max_length=200)
    descripcion = models.TextField()
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    origen = models.CharField(max_length=100)
    destino = models.CharField(max_length=100)
    plazas_totales = models.PositiveIntegerField()
    plazas_disponibles = models.PositiveIntegerField(null=True, blank=True)
    precio = models.DecimalField(max_digits=8, decimal_places=2)
    imagen = models.ImageField(upload_to='viajes/', null=True, blank=True)
    creado_en = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Inicializa plazas_disponibles al total si aún no asignado
        if self.plazas_disponibles is None:
            self.plazas_disponibles = self.plazas_totales
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.titulo} ({self.origen} → {self.destino})"
