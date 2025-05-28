// frontend/src/pages/ReservationListPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

export default function ReservationListPage() {
  const { user } = useContext(AuthContext);
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    api.get(`/reservas/?user=${user.id}`)
      .then(res => setReservas(res.data))
      .catch(() => setReservas([]))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <p>Cargando reservas…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Mis Reservas</h2>
      {reservas.length > 0 ? (
        <ul className="space-y-4">
          {reservas.map(r => (
            <li key={r.id} className="bg-white p-4 rounded-lg shadow">
              <p>
                <span className="font-medium">Viaje #{r.viaje}</span> — Estado: {r.estado}
              </p>
              <Link
                to={`/reservas/${r.id}/pay`}
                className="mt-2 inline-block text-blue-600 hover:underline"
              >
                Ver detalles
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">Sin reservas</p>
      )}
    </div>
  );
}
