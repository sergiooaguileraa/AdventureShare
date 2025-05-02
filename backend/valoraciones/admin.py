from django.contrib import admin

# Register your models here.
# backend/valoraciones/admin.py

from django.contrib import admin
from .models import Valoracion

@admin.register(Valoracion)
class ValoracionAdmin(admin.ModelAdmin):
    list_display = ('id', 'viaje', 'autor', 'puntuacion', 'creado_en')
    list_filter  = ('puntuacion',)
    search_fields = ('viaje__titulo', 'autor__username')
