// src/pages/OrganizerReservations.jsx

import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

export default function OrganizerReservations() {
  const { user } = useContext(AuthContext);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    setLoading(true);

    api
      .get('/reservas/')
      .then((res) => {
        // Filtramos SOLO las reservas de MIS viajes, PENDIENTES y PAGADAS
        const misSolicitudes = res.data.filter(
          (r) =>
            r.viaje.organizador_id === user.id &&  // soy organizador
            r.estado === 'pendiente' &&              // están pendientes
            r.pagado === true                        // ya han pagado
        );
        setReservas(misSolicitudes);
      })
      .catch((err) => {
        console.error('Error cargando reservas del organizador:', err);
        setReservas([]);
      })
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleConfirm = (id) => {
    api
      .put(`/reservas/${id}/confirm/`)
      .then(() => {
        setReservas((prev) => prev.filter((r) => r.id !== id));
      })
      .catch((err) => {
        console.error('Error al confirmar reserva:', err);
        alert('No se pudo confirmar la reserva.');
      });
  };

  const handleReject = (id) => {
    api
      .put(`/reservas/${id}/reject/`)
      .then((res) => {
        alert(res.data.detail || 'Reserva rechazada.');
        setReservas((prev) => prev.filter((r) => r.id !== id));
      })
      .catch((err) => {
        console.error('Error al rechazar reserva:', err);
        alert('No se pudo rechazar la reserva.');
      });
  };

  const handleCancel = (id) => {
    api
      .put(`/reservas/${id}/cancel/`)
      .then(() => {
        setReservas((prev) => prev.filter((r) => r.id !== id));
      })
      .catch((err) => {
        console.error('Error al cancelar reserva:', err);
        alert('No se pudo cancelar la reserva.');
      });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <p>Cargando solicitudes de reserva…</p>
      </div>
    );
  }

  // Agrupamos solo las reservas que pasaron el filtro
  const solicitudesPorViaje = {};
  reservas.forEach((r) => {
    const vid = r.viaje.id;
    if (!solicitudesPorViaje[vid]) {
      solicitudesPorViaje[vid] = { viaje: r.viaje, items: [] };
    }
    solicitudesPorViaje[vid].items.push(r);
  });

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">
        Solicitudes de reserva de mis viajes
      </h2>

      {Object.values(solicitudesPorViaje).length > 0 ? (
        Object.values(solicitudesPorViaje).map(({ viaje, items }) => (
          <div
            key={viaje.id}
            className="mb-8 bg-white rounded-lg shadow overflow-hidden"
          >
            <div className="flex items-center p-4 border-b">
              {viaje.imagen && (
                <img
                  src={viaje.imagen}
                  alt={viaje.titulo}
                  className="w-20 h-20 object-cover rounded mr-4"
                />
              )}
              <div>
                <h3 className="text-xl font-semibold">{viaje.titulo}</h3>
                <p className="text-sm text-gray-600">
                  Fecha de inicio:{' '}
                  {new Date(viaje.fecha_inicio).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-sm text-orange-600">
                  Tienes {items.length}{' '}
                  {items.length === 1 ? 'nueva solicitud' : 'nuevas solicitudes'}
                </p>
              </div>
            </div>

            <div className="divide-y">
              {items.map((r) => (
                <div
                  key={r.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <Link
                      to={`/perfil/${r.viajero_id}`}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      {r.viajero_username}
                    </Link>{' '}
                    ha pagado y solicita unirse
                    <p className="text-xs text-gray-500">
                      Solicitado el{' '}
                      {new Date(r.fecha_reserva).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="mt-3 sm:mt-0 flex space-x-4">
                    <button
                      onClick={() => handleConfirm(r.id)}
                      className="text-green-600 hover:underline text-sm"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => handleReject(r.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Rechazar
                    </button>
                    <button
                      onClick={() => handleCancel(r.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-600">No hay solicitudes de reserva pendientes.</p>
      )}
    </div>
  );
}


