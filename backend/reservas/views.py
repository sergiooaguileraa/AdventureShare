from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.core.mail import send_mail
from django.conf import settings

from .models import Reserva
from .serializers import ReservaSerializer
from viajes.models import Viaje
from pagos.models import Pago
from pagos.serializers import PagoSerializer


class ReservaViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar reservas: permite listar, crear y acciones customizadas
    como confirmar, rechazar, cancelar y marcar como pagada.
    """
    serializer_class = ReservaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Si es staff, ve todas las reservas
        if user.is_staff:
            return Reserva.objects.all().order_by('-fecha_reserva')
        # Si es organizador, ve reservas de sus viajes
        if Viaje.objects.filter(organizador=user).exists():
            return Reserva.objects.filter(viaje__organizador=user).order_by('-fecha_reserva')
        # En otro caso, reservas donde es viajero
        return Reserva.objects.filter(viajero=user).order_by('-fecha_reserva')

    def perform_create(self, serializer):
        # Al crear reserva, asignamos automáticamente el viajero actual
        serializer.save(viajero=self.request.user)

    @action(detail=True, methods=['put'])
    def confirm(self, request, pk=None):
        """
        Organizador confirma una reserva → cambia estado a 'confirmada' y notifica al viajero.
        """
        reserva = self.get_object()
        user = request.user

        # Permiso: solo el organizador o staff
        if not (reserva.viaje.organizador == user or user.is_staff):
            return Response(
                {"detail": "No tienes permiso para confirmar esta reserva."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Ya confirmada?
        if reserva.estado == Reserva.ESTADO_CONFIRMADA:
            return Response(
                {"detail": "La reserva ya está confirmada."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Cambiar estado y guardar
        reserva.estado = Reserva.ESTADO_CONFIRMADA
        reserva.save()

        # Notificar por email al viajero
        viajero = reserva.viajero
        send_mail(
            subject=f"Tu reserva #{reserva.id} ha sido confirmada",
            message=(
                f"¡Hola {viajero.username}!\n\n"
                f"Tu reserva #{reserva.id} para \"{reserva.viaje.titulo}\" "
                f"ha sido confirmada. ¡Que disfrutes del viaje!"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[viajero.email],
            fail_silently=False,
        )

        data = ReservaSerializer(reserva, context={'request': request}).data
        return Response({"reserva": data}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['put'])
    def reject(self, request, pk=None):
        """
        Organizador rechaza una reserva → cambia estado a 'rechazada' y notifica al viajero.
        """
        reserva = self.get_object()
        user = request.user

        if not (reserva.viaje.organizador == user or user.is_staff):
            return Response(
                {"detail": "No tienes permiso para rechazar esta reserva."},
                status=status.HTTP_403_FORBIDDEN
            )

        if reserva.estado == Reserva.ESTADO_RECHAZADA:
            return Response(
                {"detail": "La reserva ya está rechazada."},
                status=status.HTTP_400_BAD_REQUEST
            )

        reserva.estado = Reserva.ESTADO_RECHAZADA
        reserva.save()

        viajero = reserva.viajero
        send_mail(
            subject=f"Tu reserva #{reserva.id} ha sido rechazada",
            message=(
                f"Hola {viajero.username},\n\n"
                f"Lo sentimos, tu reserva #{reserva.id} para \"{reserva.viaje.titulo}\" "
                f"ha sido rechazada por el organizador."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[viajero.email],
            fail_silently=False,
        )

        data = ReservaSerializer(reserva, context={'request': request}).data
        return Response({"reserva": data}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['put'])
    def cancel(self, request, pk=None):
        """
        Viajero (o staff) cancela una reserva → cambia estado a 'cancelada' y notifica al organizador.
        """
        reserva = self.get_object()
        user = request.user

        if not (reserva.viajero == user or user.is_staff):
            return Response(
                {"detail": "No tienes permiso para cancelar esta reserva."},
                status=status.HTTP_403_FORBIDDEN
            )

        if reserva.estado == Reserva.ESTADO_CANCELADA:
            return Response(
                {"detail": "La reserva ya está cancelada."},
                status=status.HTTP_400_BAD_REQUEST
            )

        reserva.estado = Reserva.ESTADO_CANCELADA
        reserva.save()

        organizador = reserva.viaje.organizador
        send_mail(
            subject=f"Reserva #{reserva.id} cancelada",
            message=(
                f"¡Hola {organizador.username}!\n\n"
                f"El viajero {user.username} ha cancelado la reserva #{reserva.id} para "
                f"\"{reserva.viaje.titulo}\"."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[organizador.email],
            fail_silently=False,
        )

        data = ReservaSerializer(reserva, context={'request': request}).data
        return Response({"reserva": data}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['put'])
    def mark_paid(self, request, pk=None):
        """
        Viajero (o staff) marca reserva como pagada → crea Pago y notifica al organizador.
        """
        reserva = self.get_object()
        user = request.user

        if not (reserva.viajero == user or user.is_staff):
            return Response({"detail": "No tienes permiso."},
                            status=status.HTTP_403_FORBIDDEN)
        if reserva.pagado:
            return Response({"detail": "Ya está pagada."},
                            status=status.HTTP_400_BAD_REQUEST)

        reserva.pagado = True
        reserva.save()

        pago = Pago.objects.create(
            reserva=reserva,
            importe=reserva.importe,
            estado='realizado'
        )

        organizador = reserva.viaje.organizador
        send_mail(
            subject=f"Reserva pagada #{reserva.id}",
            message=(
                f"¡Buenas!\n\n"
                f"El viajero {user.username} acaba de marcar PAGADA la reserva #{reserva.id} para "
                f"\"{reserva.viaje.titulo}\"."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[organizador.email],
            fail_silently=False,
        )

        reserva_data = ReservaSerializer(reserva, context={'request': request}).data
        pago_data = PagoSerializer(pago, context={'request': request}).data
        return Response({
            "reserva": reserva_data,
            "pago": pago_data
        }, status=status.HTTP_200_OK)



