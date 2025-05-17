// frontend/src/pages/PaymentListPage.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

export default function PaymentListPage() {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('pagos/')
      .then(res => {
        setPagos(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudieron cargar los pagos');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Cargando pagos…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;
  if (!pagos.length) return <p>No tienes pagos registrados.</p>;

  return (
    <div style={{ padding: '16px' }}>
      <h2>Mis Pagos</h2>
      <ul>
        {pagos.map(p => (
          <li key={p.id} style={{ marginBottom: '0.5rem' }}>
            Pago #{p.id} — Reserva #{p.reserva} — €{p.importe} —{' '}
            <strong>{p.estado}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
