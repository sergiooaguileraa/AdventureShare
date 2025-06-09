// src/pages/ReservationListPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

export default function ReservationListPage() {
  const { user } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data: mine } = await api.get(`/reservas/?viajero=${user.id}`);
        const myActive = mine.filter(r =>
          ['pendiente', 'confirmada', 'cancelada'].includes(r.estado)
        );

        const viajeIds = Array.from(new Set(myActive.map(r => r.viaje.id)));

        const arr = await Promise.all(
          viajeIds.map(async vid => {
            const misReservasDelViaje = myActive.filter(r => r.viaje.id === vid);
            const myReservation =
              misReservasDelViaje.find(r => r.estado === 'confirmada') ||
              misReservasDelViaje.find(r => r.estado === 'pendiente') ||
              misReservasDelViaje.find(r => r.estado === 'cancelada');

            const { data: viaje } = await api.get(`/viajes/${vid}/`);
            const { data: allConfirmed } = await api.get(`/reservas/?estado=confirmada`);

            const isOrganizer = user.id === viaje.organizador_id;

            const seen = new Set();
            const participantes = allConfirmed
              .filter(r =>
                r.viaje.id === vid && // 🔐 filtro por viaje exacto
                r.estado === 'confirmada' &&
                r.viajero_id !== viaje.organizador_id &&
                r.viajero_id !== user.id
              )
              .filter(r => {
                if (seen.has(r.viajero_id)) return false;
                seen.add(r.viajero_id);
                return true;
              });

            return {
              viaje: {
                ...viaje,
                organizador_avatar: viaje.organizador_avatar || '/avatars/default.png'
              },
              participantes,
              myReservation,
              plazas: viaje.plazas_totales
            };
          })
        );

        setGroups(arr);
      } catch (e) {
        console.error(e);
        setError('No se pudieron cargar tus reservas.');
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate]);

  if (loading) return <p className="text-center mt-6">Cargando reservas…</p>;
  if (error) return <p className="text-center mt-6 text-red-600">{error}</p>;
  if (!groups.length) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <h2 className="text-2xl font-semibold mb-6">Mis Reservas</h2>
        <p className="text-gray-600">No tienes reservas aún.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-semibold">Mis Reservas</h2>

      {groups.map(({ viaje, participantes, myReservation, plazas }) => {
        const { estado, pagado, id: rid } = myReservation;
        const isOrganizer = user.id === viaje.organizador_id;
        const showRejected = !isOrganizer && estado === 'cancelada';

        return (
          <div key={viaje.id} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="text-xl font-semibold">{viaje.titulo}</h3>
              <p className="text-sm text-gray-600">
                Fecha de inicio:{' '}
                {new Date(viaje.fecha_inicio).toLocaleDateString('es-ES')}
              </p>
              {!showRejected && (
                <p className="text-sm text-green-700 mt-1">
                  {participantes.length + 1} de {plazas} plazas
                </p>
              )}
            </div>

            {isOrganizer && (
              <div className="px-6 py-4">
                <div className="flex items-center space-x-4 overflow-x-auto">
                  <Link to={`/organizador/${viaje.organizador_id}`} className="flex-shrink-0">
                    <img
                      src={viaje.organizador_avatar}
                      alt={viaje.organizador}
                      className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
                    />
                  </Link>
                  {participantes.map(r => (
                    <Link
                      key={r.viajero_id}
                      to={`/organizador/${r.viajero_id}`}
                      className="flex-shrink-0"
                    >
                      <img
                        src={r.viajero_avatar || '/avatars/default.png'}
                        alt={r.viajero_username}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    </Link>
                  ))}
                </div>
                <p className="mt-2 text-gray-600">
                  Total confirmados: {participantes.length}
                </p>
              </div>
            )}

            {!isOrganizer && showRejected && (
              <div className="px-6 py-4 border-t">
                <p className="text-red-600">
                  Tu reserva ha sido <strong>cancelada</strong> por el organizador.
                </p>
              </div>
            )}

            {!isOrganizer && !showRejected && (
              <>
                <div className="flex items-center p-4 space-x-4 overflow-x-auto">
                  <Link
                    to={`/organizador/${viaje.organizador_id}`}
                    title={`Organizador: ${viaje.organizador}`}
                    className="flex-shrink-0"
                  >
                    <img
                      src={viaje.organizador_avatar}
                      alt={viaje.organizador}
                      className="w-12 h-12 rounded-full object-cover border-2 border-red-500"
                    />
                  </Link>
                  <Link
                    to={`/organizador/${user.id}`}
                    title="Tú"
                    className="flex-shrink-0"
                  >
                    <img
                      src={user.avatar || '/avatars/default.png'}
                      alt="Tú"
                      className="w-12 h-12 rounded-full object-cover border"
                    />
                  </Link>
                  {participantes.map(r => (
                    <Link
                      key={r.viajero_id}
                      to={`/organizador/${r.viajero_id}`}
                      title={r.viajero_username}
                      className="flex-shrink-0"
                    >
                      <img
                        src={r.viajero_avatar || '/avatars/default.png'}
                        alt={r.viajero_username}
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    </Link>
                  ))}
                </div>

                <div className="px-6 py-4 border-t">
                  {estado === 'confirmada' && (
                    <p className="text-green-600">¡Tu plaza está confirmada!</p>
                  )}
                  {estado === 'pendiente' && !pagado && (
                    <div className="flex justify-end">
                      <Link
                        to={`/reservas/${rid}/pay`}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Pagar ahora
                      </Link>
                    </div>
                  )}
                  {estado === 'pendiente' && pagado && (
                    <p className="italic text-gray-600">
                      Pago realizado, esperando confirmación del organizador.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}








































