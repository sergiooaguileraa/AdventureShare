# backend/reservas/views.py

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Reserva
from .serializers import ReservaSerializer
from viajes.models import Viaje
from pagos.models import Pago
from pagos.serializers import PagoSerializer


class ReservaViewSet(viewsets.ModelViewSet):
    """
    Gestión de reservas:
      • Staff ve todas.
      • Organizador ve reservas de SUS viajes.
      • Viajero ve solo sus propias reservas.
    Acciones extra:
      * confirm    — organizador confirma reserva pagada
      * reject     — organizador rechaza reserva pendiente + reembolsa pago
      * cancel     — viajero/admin cancela + reembolsa pago si procede
      * mark_paid  — viajero marca pagado y crea Pago
    """
    serializer_class   = ReservaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Reserva.objects.all().order_by('-fecha_reserva')

        # organizador de al menos un viaje
        if Viaje.objects.filter(organizador=user).exists():
            return Reserva.objects.filter(viaje__organizador=user)\
                                  .order_by('-fecha_reserva')

        # viajero normal
        return Reserva.objects.filter(viajero=user).order_by('-fecha_reserva')

    def perform_create(self, serializer):
        serializer.save(viajero=self.request.user)

    @action(detail=True, methods=['put'])
    def confirm(self, request, pk=None):
        reserva = self.get_object()
        viaje   = reserva.viaje

        # solo organizador
        if request.user != viaje.organizador:
            return Response({"detail":"No tienes permiso para confirmar."},
                            status=status.HTTP_403_FORBIDDEN)

        if reserva.estado != 'pendiente' or not reserva.pagado:
            return Response({"detail":"Debe estar pendiente y pagada."},
                            status=status.HTTP_400_BAD_REQUEST)

        if viaje.plazas_disponibles is not None and viaje.plazas_disponibles < 1:
            return Response({"detail":"No hay plazas disponibles."},
                            status=status.HTTP_400_BAD_REQUEST)

        reserva.estado = 'confirmada'
        reserva.save()

        viaje.plazas_disponibles -= 1
        viaje.save()

        return Response(self.get_serializer(reserva).data,
                        status=status.HTTP_200_OK)

    @action(detail=True, methods=['put'])
    def reject(self, request, pk=None):
        """
        El organizador rechaza una reserva pendiente:
         - Pone estado → 'cancelada'
         - Si ya había pago 'realizado', pasa a 'reembolsado'
        """
        reserva = self.get_object()
        viaje   = reserva.viaje

        if request.user != viaje.organizador:
            return Response({"detail":"No tienes permiso para rechazar."},
                            status=status.HTTP_403_FORBIDDEN)
        if reserva.estado != 'pendiente':
            return Response({"detail":"Solo pendientes se pueden rechazar."},
                            status=status.HTTP_400_BAD_REQUEST)

        # 1) cancelamos la reserva
        reserva.estado = 'cancelada'
        reserva.pagado = False
        reserva.save()

        # 2) reembolsamos pagos 'realizado'
        pagos_realizados = Pago.objects.filter(reserva=reserva, estado='realizado')
        reembolsados = []
        for pago in pagos_realizados:
            pago.estado = 'reembolsado'
            pago.save()
            reembolsados.append(pago)

        # serializar
        reserva_data = self.get_serializer(reserva).data
        pagos_data   = PagoSerializer(reembolsados, many=True,
                                      context={'request': request}).data

        return Response({
            "reserva": reserva_data,
            "pagos_reembolsados": pagos_data,
            "detail": f"Reserva rechazada por {viaje.organizador.username}."
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['put'])
    def cancel(self, request, pk=None):
        """
        Viajero o staff cancela reserva en cualquier estado:
         - Si estaba pagada, reembolsa
        """
        reserva = self.get_object()
        user    = request.user

        if not (user.is_staff or reserva.viajero == user):
            return Response({"detail":"No tienes permiso para cancelar."},
                            status=status.HTTP_403_FORBIDDEN)
        if reserva.estado == 'cancelada':
            return Response({"detail":"Ya está cancelada."},
                            status=status.HTTP_400_BAD_REQUEST)

        reserva.estado = 'cancelada'
        reserva.save()

        # reembolso si ya pagado
        pagos_realizados = Pago.objects.filter(reserva=reserva, estado='realizado')
        reembolsados = []
        for pago in pagos_realizados:
            pago.estado = 'reembolsado'
            pago.save()
            reembolsados.append(pago)

        reserva_data = self.get_serializer(reserva).data
        pagos_data   = PagoSerializer(reembolsados, many=True,
                                      context={'request': request}).data

        return Response({
            "reserva": reserva_data,
            "pagos_reembolsados": pagos_data,
            "detail": "Reserva cancelada."
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['put'])
    def mark_paid(self, request, pk=None):
        """
        Viajero marca reserva como pagada → crea Pago estado 'realizado'
        """
        reserva = self.get_object()

        if reserva.viajero != request.user:
            return Response({"detail":"No tienes permiso."},
                            status=status.HTTP_403_FORBIDDEN)
        if reserva.pagado:
            return Response({"detail":"Ya está pagada."},
                            status=status.HTTP_400_BAD_REQUEST)

        reserva.pagado = True
        reserva.save()

        pago = Pago.objects.create(
            reserva=reserva,
            importe=reserva.importe,
            estado='realizado'
        )

        reserva_data = ReservaSerializer(reserva,
                                         context={'request': request}).data
        pago_data    = PagoSerializer(pago,
                                      context={'request': request}).data

        return Response({
            "reserva": reserva_data,
            "pago": pago_data
        }, status=status.HTTP_200_OK)

