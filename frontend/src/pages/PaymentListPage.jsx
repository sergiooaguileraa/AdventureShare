// src/pages/PaymentListPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

import PaymentCard from '../components/PaymentCard';
import './PaymentListPage.css';

export default function PaymentListPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    setLoading(true);
    setError('');

    // Pedimos directamente /pagos/, el backend ya filtra por usuario
    api
      .get('/pagos/')
      .then((res) => {
        setPagos(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('No se pudieron cargar los pagos');
        setLoading(false);
      });
  }, [user, navigate]);

  if (loading) return <p>Cargando pagos…</p>;
  if (error)   return <p className="error">{error}</p>;
  if (!pagos.length) return <p>No tienes pagos registrados.</p>;

  return (
    <div className="payments-page">
      <h2 className="payments-page__title">Mis Pagos</h2>
      <div className="payments-grid">
        {pagos.map((p) => (
          <PaymentCard key={p.id} payment={p} />
        ))}
      </div>
    </div>
  );
}



