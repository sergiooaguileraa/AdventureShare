from django.contrib import admin

# Register your models here.
# backend/viajes/admin.py

from django.contrib import admin
from .models import Viaje

@admin.register(Viaje)
class ViajeAdmin(admin.ModelAdmin):
    list_display = ('titulo', 'organizador', 'origen', 'destino', 'fecha_inicio', 'plazas_totales')
    list_filter  = ('origen', 'destino', 'fecha_inicio')
    search_fields = ('titulo', 'descripcion')
    date_hierarchy = 'fecha_inicio'
