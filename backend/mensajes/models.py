from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings

class Mensaje(models.Model):
    remitente     = models.ForeignKey(settings.AUTH_USER_MODEL,
                                      on_delete=models.CASCADE,
                                      related_name='mensajes_enviados')
    destinatario  = models.ForeignKey(settings.AUTH_USER_MODEL,
                                      on_delete=models.CASCADE,
                                      related_name='mensajes_recibidos')
    contenido      = models.TextField()
    leido          = models.BooleanField(default=False)
    fecha_envio    = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"De {self.remitente} a {self.destinatario} @ {self.fecha_envio}"
