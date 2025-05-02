from django.contrib import admin

# Register your models here.
# backend/reservas/admin.py

from django.contrib import admin
from .models import Reserva

@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ('id', 'viaje', 'viajero', 'fecha_reserva', 'estado')
    list_filter  = ('estado',)
    search_fields = ('viaje__titulo', 'viajero__username')
