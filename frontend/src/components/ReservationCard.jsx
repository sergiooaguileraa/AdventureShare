// src/components/ReservationCard.jsx

import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function ReservationCard({
  id,
  viaje,
  estado,
  importe,
  pagado,
  onCancel,
  onPay,
  onConfirm,
  onReject
}) {
  const { user } = useContext(AuthContext);

  // Mapear estado a estilos Tailwind para el badge
  const statusStyles = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    confirmada: 'bg-green-100 text-green-800',
    cancelada: 'bg-red-100 text-red-800',
  };

  // Mapear estado a texto legible
  const statusText = {
    pendiente: 'Pendiente',
    confirmada: 'Confirmada',
    cancelada: 'Cancelada',
  };

  // ¿Es el usuario actual el organizador de este viaje?
  const isOrganizador = user && viaje.organizador_id === user.id;

  return (
    <div className="flex flex-col md:flex-row bg-white rounded-lg shadow overflow-hidden">
      {/* Imagen del viaje (si existe) */}
      {viaje.imagen && (
        <img
          src={viaje.imagen}
          alt={viaje.titulo}
          className="w-full md:w-48 h-32 md:h-auto object-cover"
        />
      )}

      <div className="flex-1 p-4 flex flex-col justify-between">
        {/* Título del viaje y fecha de inicio */}
        <div>
          <h3 className="text-xl font-semibold">{viaje.titulo}</h3>
          {viaje.fecha_inicio && (
            <p className="text-sm text-gray-600">
              Fecha de inicio:{' '}
              {new Date(viaje.fecha_inicio).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* Badge de estado y botones de acción */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          {/* Badge de estado */}
          <span
            className={`inline-block px-3 py-1 text-sm font-medium rounded ${
              statusStyles[estado]
            }`}
          >
            {statusText[estado]}
          </span>

          <div className="mt-3 sm:mt-0 flex items-center space-x-3">
            {/* “Ver detalles” siempre visible */}
            <Link
              to={`/reservas/${id}/pay`}
              className="text-blue-600 hover:underline text-sm"
            >
              Ver detalles
            </Link>

            {/* --------------------------------------------------- */}
            {/* SI NO soy organizador: botones para el VIAJERO          */}
            {/* --------------------------------------------------- */}
            {!isOrganizador && estado === 'pendiente' && !pagado && (
              <button
                onClick={() => onPay(id)}
                className="text-green-600 hover:underline text-sm"
              >
                Pagar (€{parseFloat(importe).toFixed(2)})
              </button>
            )}
            {!isOrganizador && estado === 'pendiente' && (
              <button
                onClick={() => onCancel(id)}
                className="text-red-600 hover:underline text-sm"
              >
                Cancelar
              </button>
            )}


            {/* --------------------------------------------------- */}
            {/* SI soy el organizador: botones “Confirmar” y “Rechazar” */}
            {/* --------------------------------------------------- */}
            {isOrganizador && estado === 'pendiente' && (
              <>
                <button
                  onClick={() => onConfirm(id)}
                  className="text-green-600 hover:underline text-sm"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => onReject(id)}
                  className="text-red-600 hover:underline text-sm"
                >
                  Rechazar
                </button>
              </>
            )}


            {/* Si está confirmada Y pagada → texto de éxito */}
            {estado === 'confirmada' && pagado && (
              <span className="text-green-700 text-sm">✅ Pagada y confirmada</span>
            )}

            {/* Si está confirmada pero NO pagada (caso raro) */}
            {estado === 'confirmada' && !pagado && (
              <span className="text-yellow-700 text-sm">
                Confirmada (pendiente pago)
              </span>
            )}

            {/* Si está cancelada → texto cancelada */}
            {estado === 'cancelada' && (
              <span className="text-red-700 text-sm">✖ Cancelada</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ReservationCard.propTypes = {
  id: PropTypes.number.isRequired,
  viaje: PropTypes.shape({
    id: PropTypes.number.isRequired,
    titulo: PropTypes.string.isRequired,
    imagen: PropTypes.string,
    fecha_inicio: PropTypes.string,
    organizador: PropTypes.string,
    organizador_id: PropTypes.number,
  }).isRequired,
  estado: PropTypes.oneOf(['pendiente', 'confirmada', 'cancelada']).isRequired,
  importe: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  pagado: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onPay: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};



