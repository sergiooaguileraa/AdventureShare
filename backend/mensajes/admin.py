from django.contrib import admin

# Register your models here.
# backend/mensajes/admin.py

from django.contrib import admin
from .models import Mensaje

@admin.register(Mensaje)
class MensajeAdmin(admin.ModelAdmin):
    list_display = ('id', 'remitente', 'destinatario', 'fecha_envio', 'leido')
    list_filter  = ('leido',)
    search_fields = ('remitente__username', 'destinatario__username', 'contenido')
