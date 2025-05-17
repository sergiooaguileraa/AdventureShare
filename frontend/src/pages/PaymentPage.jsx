// frontend/src/pages/PaymentPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function PaymentPage() {
  const { id } = useParams();        // ID de la reserva
  const navigate = useNavigate();
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);

  // 1️⃣ Al montar, obtenemos la reserva
  useEffect(() => {
    api.get(`reservas/${id}/`)
      .then(res => {
        setReserva(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudo cargar la reserva');
        setLoading(false);
      });
  }, [id]);

  // 2️⃣ Función que procesa el pago
  const handlePay = async () => {
    setPaying(true);
    try {
      await api.post('pagos/', {
        reserva: id,
        metodo: 'dummy',
        importe: reserva.importe,    // debe venir en el objeto reserva
        estado: 'completado'
      });
      // 3️⃣ Al completar, redirigimos al listado de reservas
      navigate('/reservas');
    } catch {
      setError('Error al procesar el pago');
      setPaying(false);
    }
  };

  // 4️⃣ Renderizado según estado
  if (loading) return <p>Cargando reserva…</p>;
  if (error)   return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ padding: '16px' }}>
      <h2>Pago de Reserva #{reserva.id}</h2>
      <p>Viaje: {reserva.viaje}</p>
      <p>Importe: €{reserva.importe}</p>
      <button
        onClick={handlePay}
        disabled={paying}
        style={{ padding: '0.5rem 1rem' }}
      >
        {paying ? 'Procesando pago…' : 'Pagar ahora'}
      </button>
    </div>
  );
}
