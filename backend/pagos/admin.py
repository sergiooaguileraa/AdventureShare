from django.contrib import admin

# Register your models here.
# backend/pagos/admin.py

from django.contrib import admin
from .models import Pago

@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ('id', 'reserva', 'metodo', 'importe', 'estado', 'fecha_pago')
    list_filter  = ('metodo', 'estado')
    search_fields = ('reserva__viaje__titulo',)
