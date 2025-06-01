# backend/viajes/permissions.py

from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsOrganizerOrReadOnly(BasePermission):
    """
    Sólo el organizador del viaje puede editar, borrar o cancelar.
    GET/HEAD/OPTIONS abiertos a cualquiera.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.organizador == request.user
