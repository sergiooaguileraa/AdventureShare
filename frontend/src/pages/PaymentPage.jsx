// src/pages/PaymentPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

export default function PaymentPage() {
  const { id } = useParams();        // ID de la reserva
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [paying, setPaying]     = useState(false);

  // 1️⃣ Al montar, obtenemos la reserva “/reservas/{id}/”
  useEffect(() => {
    api
      .get(`/reservas/${id}/`)
      .then((res) => setReserva(res.data))
      .catch(() => setError('No se pudo cargar la reserva'))
      .finally(() => setLoading(false));
  }, [id]);

  // 2️⃣ Función que procesa el pago: llamamos a mark_paid
  const handlePay = async () => {
    if (!reserva) return;
    setPaying(true);
    setError('');
    try {
      const { data } = await api.put(`/reservas/${id}/mark_paid/`);
      // data.reserva viene actualizado
      setReserva(data.reserva);
    } catch (err) {
      // 🔍 Logging completo para entender el 403
      console.error('🚨 mark_paid error:', {
        status: err.response?.status,
        data: err.response?.data,
        headers: err.response?.headers,
      });
      // Mostrar al usuario el detalle que venga desde el backend
      setError(err.response?.data?.detail || 'Error al procesar el pago');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando reserva…</p>;
  if (error)   return <p style={{ color: 'red', textAlign: 'center', marginTop: '2rem' }}>{error}</p>;
  if (!reserva) return null;

  const { viaje, importe, estado, pagado } = reserva;

  return (
    <div
      style={{
        maxWidth: '480px',
        margin: '2rem auto',
        padding: '1.5rem',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* Título con el nombre del viaje */}
      <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600 }}>
        {viaje.titulo}
      </h2>
      <p style={{ margin: '0.5rem 0 1rem', color: '#666' }}>
        <small>Reserva #{reserva.id}</small>
      </p>

      <div style={{ lineHeight: 1.6, color: '#333' }}>
        <p>
          <strong>Importe a pagar:</strong> €{parseFloat(importe).toFixed(2)}
        </p>
        <p>
          <strong>Estado actual:</strong>{' '}
          {estado.charAt(0).toUpperCase() + estado.slice(1)}
        </p>
      </div>

      {/* Mensajes de estado */}
      {pagado && estado === 'pendiente' && (
        <p style={{ marginTop: '1rem', fontStyle: 'italic', color: '#555' }}>
          Pago realizado con éxito. Esperando confirmación del organizador.
        </p>
      )}
      {pagado && estado === 'confirmada' && (
        <p style={{ marginTop: '1rem', color: 'green', fontWeight: 500 }}>
          ¡Tu plaza está confirmada!
        </p>
      )}
      {!pagado && estado !== 'pendiente' && (
        <p style={{ marginTop: '1rem', color: '#888' }}>
          No se puede pagar porque la reserva está “{estado}”.
        </p>
      )}

      {/* Botón de pagar */}
      {!pagado && estado === 'pendiente' && (
        <button
          onClick={handlePay}
          disabled={paying}
          style={{
            display: 'block',
            width: '100%',
            marginTop: '1.5rem',
            padding: '0.75rem',
            background: paying ? '#a0c4ff' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            cursor: paying ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {paying ? 'Procesando pago…' : 'Pagar ahora'}
        </button>
      )}

      {/* Enlace de regreso */}
      <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <Link
          to="/reservas"
          style={{ color: '#007bff', textDecoration: 'none' }}
        >
          ← Volver a Mis Reservas
        </Link>
      </div>
    </div>
  );
}





