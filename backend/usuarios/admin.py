# backend/usuarios/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    """
    Registramos el modelo Usuario en el Admin usando UserAdmin de Django,
    de modo que aparezca el enlace “Change password” y se encripte la clave.
    """

    ordering         = ['username']
    list_display     = ['username', 'email', 'role', 'is_active', 'date_joined']
    list_filter      = ['role', 'is_active', 'is_staff', 'is_superuser']
    search_fields    = ['username', 'email']
    filter_horizontal = ['groups', 'user_permissions']

    fieldsets = (
        (None,                     {'fields': ('username', 'password')}),
        (_('Información personal'),{'fields': ('first_name', 'last_name', 'email', 'avatar', 'bio')}),
        (_('Permisos'),            {
            'fields': (
                'role',
                'is_active',
                'is_staff',
                'is_superuser',
                'groups',
                'user_permissions',
            ),
        }),
        (_('Fechas importantes'),  {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'role', 'password1', 'password2'),
        }),
    )
