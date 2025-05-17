// frontend/src/pages/ReservationListPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ReservationListPage() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) return navigate('/login');
    api.get('reservas/')
      .then(res => {
        setReservas(res.data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [user, navigate]);

  if (loading) return <p>Cargando reservas…</p>;
  if (!reservas.length) return <p>No tienes reservas.</p>;

  return (
    <div style={{ padding: '16px' }}>
      <h2>Mis Reservas</h2>
      <ul>
        {reservas.map(r => (
          <li key={r.id}>
            Viaje #{r.viaje} — Estado: {r.estado}
          </li>
        ))}
      </ul>
    </div>
  );
}
