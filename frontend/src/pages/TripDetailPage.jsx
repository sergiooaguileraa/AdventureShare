// src/pages/TripDetailPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

export default function TripDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [viaje, setViaje] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reserving, setReserving] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    // Cargamos detalle y valoraciones en paralelo
    Promise.all([
      api.get(`/viajes/${id}/`),
      api.get(`/valoraciones/?viaje=${id}`)
    ])
      .then(([viajeRes, revRes]) => {
        setViaje(viajeRes.data);
        setReviews(revRes.data);
      })
      .catch(err => {
        console.error(err);
        // Si es un 401, forzamos logout
        if (err.response?.status === 401) {
          logout();
        } else {
          setError('No se pudo cargar la información. Intenta de nuevo más tarde.');
        }
      })
      .finally(() => setLoading(false));
  }, [id, user, navigate, logout]);

  const handleReserva = async () => {
    setReserving(true);
    setError('');
    try {
      await api.post('/reservas/', { viaje: id });
      navigate('/reservas', { replace: true });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        logout();
      } else {
        setError('Error al reservar. Intenta de nuevo.');
        setReserving(false);
      }
    }
  };

  const handleReview = async () => {
    if (!comment.trim()) return;
    setSubmittingReview(true);
    setError('');
    try {
      await api.post('/valoraciones/', {
        viaje: id,
        puntuacion: rating,
        comentario: comment,
      });
      const res = await api.get(`/valoraciones/?viaje=${id}`);
      setReviews(res.data);
      setComment('');
      setRating(5);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        logout();
      } else {
        setError('Error al enviar valoración.');
      }
    }
    setSubmittingReview(false);
  };

  if (loading) {
    return <p className="text-center mt-6">Cargando viaje…</p>;
  }

  if (error && !viaje) {
    return <p className="text-center mt-6 text-red-600">{error}</p>;
  }

  // Normalizamos el precio
  const rawPrecio = viaje.precio;
  const precio = typeof rawPrecio === 'number'
    ? rawPrecio
    : parseFloat(rawPrecio) || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Volver atrás
        </button>

        <h2 className="text-2xl font-bold mb-2">{viaje.nombre}</h2>
        <p className="text-gray-600 mb-1">{viaje.origen} → {viaje.destino}</p>
        <p className="text-gray-500 mb-4 text-sm">
          {new Date(viaje.fecha_inicio).toLocaleDateString()} –{' '}
          {new Date(viaje.fecha_fin).toLocaleDateString()}
        </p>

        {viaje.imagen_url && (
          <img
            src={viaje.imagen_url}
            alt={viaje.destino}
            className="w-full max-h-96 object-cover rounded mb-4"
          />
        )}

        <p className="font-semibold text-lg mb-4">
          Precio por persona: €{precio.toFixed(2)}
        </p>
        <p className="mb-6">
          Plazas disponibles: <span className="font-medium">{viaje.plazas_disponibles}</span>
        </p>
        <p className="mb-6 text-gray-700">{viaje.descripcion}</p>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        <button
          onClick={handleReserva}
          disabled={reserving || viaje.plazas_disponibles <= 0}
          className={`w-full mb-6 py-2 rounded text-white transition ${
            viaje.plazas_disponibles > 0
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          {reserving
            ? 'Reservando…'
            : viaje.plazas_disponibles > 0
            ? 'Reservar'
            : 'Agotado'}
        </button>

        <hr className="my-6" />

        <h3 className="text-xl font-semibold mb-2">Deja tu valoración</h3>
        {user ? (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block mb-1">Puntuación</label>
              <select
                value={rating}
                onChange={e => setRating(Number(e.target.value))}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>
                    {n} estrella{n > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1">Comentario</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Tu comentario…"
                className="w-full border rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={handleReview}
              disabled={submittingReview}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
            >
              {submittingReview ? 'Enviando…' : 'Enviar valoración'}
            </button>
          </div>
        ) : (
          <p className="mb-6">Inicia sesión para valorar.</p>
        )}

        <h3 className="text-xl font-semibold mb-2">Valoraciones</h3>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.id} className="border rounded p-4">
                <p><strong>{r.puntuacion}⭐</strong></p>
                <p className="text-gray-700 mt-1">{r.comentario}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No hay valoraciones todavía.</p>
        )}
      </div>
    </div>
  );
}

