from django.contrib import admin

# Register your models here.
# backend/usuarios/admin.py

from django.contrib import admin
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'is_active', 'date_joined')
    list_filter  = ('role', 'is_active')
    search_fields = ('username', 'email')
