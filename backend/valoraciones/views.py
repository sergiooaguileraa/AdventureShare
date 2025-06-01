# backend/valoraciones/views.py

from datetime import date
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response

from .models import Valoracion
from .serializers import ValoracionSerializer


class ValoracionViewSet(viewsets.ModelViewSet):
    """
    CRUD de valoraciones:
      - GET (list/retrieve): abierto solo a usuarios autenticados (IsAuthenticated).
      - POST (create): solo usuarios autenticados y solo si el viaje ya finalizó.
      - PUT/PATCH/DELETE: solo usuarios autenticados (IsAuthenticated).
      - Al crear, asigna automáticamente 'autor' = request.user.
    """
    queryset = Valoracion.objects.all().order_by('-creado_en')
    serializer_class = ValoracionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        Sobrescribimos create() para validar que el viaje haya finalizado antes
        de permitir la creación. Si no, devolvemos 400 con mensaje de error.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        viaje = serializer.validated_data.get('viaje')
        hoy = date.today()

        # Si el viaje NO ha finalizado aún, devolvemos error.
        if viaje.fecha_fin >= hoy:
            return Response(
                {
                    'viaje': [
                        'No puedes valorar un viaje que aún no ha finalizado.'
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Todo correcto: asignamos autor y guardamos
        serializer.save(autor=request.user)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        """
        (Este método no se usa directamente, puesto que gestionamos el guardado
         en create() arriba. Sin embargo, lo dejamos por si se llamase en otro contexto.)
        """
        serializer.save(autor=self.request.user)
