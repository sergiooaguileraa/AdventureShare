// src/components/PaymentCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import './PaymentCard.css';

export default function PaymentCard({ payment }) {
  const { importe, estado, fecha_pago, reserva, metodo } = payment;

  // Datos del usuario que pagó
  const usuarioNombre = reserva?.viajero_username ?? 'Desconocido';
  const usuarioId     = reserva?.viajero_id;
  const usuarioAvatar = reserva?.viajero_avatar || '/avatars/default.png';

  // Datos de la reserva
  const viajeNombre = reserva?.viaje?.titulo ?? 'Desconocido';
  const reservaEstado = reserva?.estado;

  // Fecha del pago en formato local
  const fechaPago = fecha_pago
    ? new Date(fecha_pago).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : '';

  // Estado capitalizado
  const estadoLabel = estado
    ? estado.charAt(0).toUpperCase() + estado.slice(1)
    : '';

  return (
    <div className="payment-card">
      <div className="pc-header">
        <Link
          to={usuarioId ? `/perfil/${usuarioId}` : '#'}
          className="pc-avatar-link"
        >
          <img
            src={usuarioAvatar}
            alt={usuarioNombre}
            className="pc-avatar"
          />
        </Link>
        <div className="pc-title">
          <Link
            to={usuarioId ? `/perfil/${usuarioId}` : '#'}
            className="pc-user-link"
          >
            Pago realizado por <strong>{usuarioNombre}</strong>
          </Link>
          <span className={`pc-badge pc-${estado?.toLowerCase()}`}>
            {estadoLabel}
          </span>
        </div>
      </div>

      <div className="pc-body">
        <p><strong>Reserva:</strong> {viajeNombre}</p>
        {metodo && <p><strong>Método:</strong> {metodo}</p>}
        {fechaPago && <p><strong>Fecha del pago:</strong> {fechaPago}</p>}
        <p><strong>Importe:</strong> €{parseFloat(importe).toFixed(2)}</p>

        {reservaEstado === 'cancelada' && (
          <p className="pc-refund">
            Tu pago ha sido <strong>reembolsado</strong>.
          </p>
        )}
      </div>
    </div>
  );
}





