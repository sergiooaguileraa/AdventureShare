// src/pages/TripDetailPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

  // Rating y valoraciones
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Chat
  const [showChat, setShowChat] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [chatError, setChatError] = useState('');

  // 1) Carga del viaje al montar el componente
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    setLoading(true);
    setError('');
    api
      .get(`/viajes/${id}/`)
      .then((res) => {
        setViaje(res.data);
      })
      .catch((err) => {
        console.error(err);
        if (err.response?.status === 401) {
          logout();
        } else {
          setError('No se pudo cargar la información. Intenta de nuevo más tarde.');
        }
      })
      .finally(() => setLoading(false));
  }, [id, user, navigate, logout]);

  // 2) Manejar reserva (envía viaje_id e importe), con verificación de organizador
  const handleReserva = async () => {
    if (!viaje) return;

    // Si el usuario es organizador del viaje, bloqueamos aquí
    if (viaje.organizador_id === user.id) {
      setError('No puedes reservar tu propio viaje.');
      return;
    }

    setReserving(true);
    setError('');

    // Normalizar precio a número
    const rawPrecio = viaje.precio;
    const importe = typeof rawPrecio === 'number'
      ? rawPrecio
      : parseFloat(rawPrecio) || 0;

    try {
      await api.post('/reservas/', { viaje_id: id, importe });
      // Si la reserva se crea correctamente, redirijo a Mis Reservas
      navigate('/reservas', { replace: true });
    } catch (err) {
      console.error(err);

      // Si token ha expirado o no está autenticado
      if (err.response?.status === 401) {
        logout();
        return;
      }

      // Si el back devuelve HTTP 400 (ValidationError “Ya tienes una reserva…”)
      if (err.response?.status === 400) {
        // Extraigo el primer mensaje de non_field_errors (tal como lo devolvemos en el Serializer)
        const nonField = err.response.data.non_field_errors;
        const msg =
          Array.isArray(nonField) && nonField.length > 0
            ? nonField[0]
            : err.response.data.detail || 'Ya existe una reserva para este viaje.';
        setError(msg);
      } else {
        setError('Error al reservar. Intenta de nuevo.');
      }

      setReserving(false);
    }
  };

  // 3) Enviar valoración
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
      setComment('');
      setRating(5);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        logout();
      } else if (err.response?.data?.viaje) {
        setError(err.response.data.viaje[0]);
      } else {
        setError('Error al enviar valoración.');
      }
    }
    setSubmittingReview(false);
  };

  // 4) Abrir chat y cargar conversación con el organizador
  const openChat = () => {
    setChatError('');
    setConversation([]);
    if (!viaje) return;
    setShowChat(true);
    api
      .get(`/mensajes/conversacion/${viaje.organizador_id}/`)
      .then((res) => setConversation(res.data))
      .catch((err) => {
        console.error(err);
        setChatError('No se pudo cargar la conversación');
      });
  };

  // 5) Enviar mensaje
  const sendMessage = () => {
    if (!messageBody.trim() || !viaje) return;
    api
      .post('/mensajes/', {
        destinatario: viaje.organizador_id,
        contenido: messageBody,
      })
      .then((res) => {
        setConversation((prev) => [...prev, res.data]);
        setMessageBody('');
      })
      .catch((err) => {
        console.error(err);
        setChatError('Error enviando mensaje');
      });
  };

  // --- Render condicional ---
  if (loading) {
    return <p className="text-center mt-6">Cargando viaje…</p>;
  }
  if (error && !viaje) {
    return <p className="text-center mt-6 text-red-600">{error}</p>;
  }

  // Si no tenemos datos del viaje (por alguna razón), no renderizamos nada
  if (!viaje) return null;

  // Normalizar precio y comprobar plazas
  const rawPrecio = viaje.precio;
  const precio = typeof rawPrecio === 'number'
    ? rawPrecio
    : parseFloat(rawPrecio) || 0;
  const hayPlazas = viaje.plazas_disponibles > 0;

  // Comprobar si el usuario actual es organizador de este viaje
  const esOrganizador = viaje.organizador_id === user.id;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        {/* Botón Volver */}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Volver atrás
        </button>

        {/* Datos del viaje */}
        <h2 className="text-2xl font-bold mb-2">{viaje.titulo}</h2>
        <p className="text-gray-600 mb-1">
          {viaje.origen} → {viaje.destino}
        </p>
        <p className="text-gray-500 mb-4 text-sm">
          {new Date(viaje.fecha_inicio).toLocaleDateString()} –{' '}
          {new Date(viaje.fecha_fin).toLocaleDateString()}
        </p>

        {viaje.imagen && (
          <img
            src={viaje.imagen}
            alt={viaje.destino}
            className="w-full max-h-96 object-cover rounded mb-4"
          />
        )}

        <p className="font-semibold text-lg mb-4">
          Precio por persona: €{precio.toFixed(2)}
        </p>
        <p className="mb-6">
          Plazas disponibles:{' '}
          <span className="font-medium">{viaje.plazas_disponibles}</span>
        </p>
        <p className="mb-6 text-gray-700">{viaje.descripcion}</p>

        {/* Botón de Reserva o mensaje si eres organizador */}
        {esOrganizador ? (
          <p className="text-red-600 font-medium mb-6">
            No puedes reservar tu propio viaje.
          </p>
        ) : (
          <button
            onClick={handleReserva}
            disabled={reserving || !hayPlazas}
            className={`w-full mb-6 py-2 rounded text-white transition ${
              hayPlazas
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {reserving
              ? 'Reservando…'
              : hayPlazas
              ? 'Reservar'
              : 'Agotado'}
          </button>
        )}

        {/* Mostrar mensaje de error si existe */}
        {error && (
          <p className="text-red-600 text-sm mb-6">{error}</p>
        )}

        {/* Avatar + Organizador + Chat */}
        <div className="flex items-center mb-6 space-x-4">
          {viaje.organizador_avatar && (
            <img
              src={viaje.organizador_avatar}
              alt={viaje.organizador}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-sm text-gray-500">Organizado por</p>
            {/* Enlace corregido: apuntar a /organizador/{id} */}
            <Link
              to={`/organizador/${viaje.organizador_id}`}
              className="text-lg text-blue-600 hover:underline"
            >
              {viaje.organizador}
            </Link>
          </div>
          <button
            onClick={openChat}
            className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Enviar mensaje
          </button>
        </div>

        {/* ── BOTONES PARA EL ORGANIZADOR ── */}
        {esOrganizador && (
          <div className="flex items-center space-x-4 mb-6">
            {!viaje.cancelled ? (
              <button
                onClick={async () => {
                  if (
                    !window.confirm('¿Estás seguro de que quieres cancelar el viaje?')
                  )
                    return;
                  try {
                    await api.post(`/viajes/${id}/cancelar/`);
                    setViaje((prev) => ({ ...prev, cancelled: true }));
                  } catch (e) {
                    console.error(e);
                    alert('Error cancelando el viaje');
                  }
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Cancelar viaje
              </button>
            ) : (
              <span className="px-4 py-2 bg-red-600 text-white rounded">
                Viaje cancelado
              </span>
            )}
            <button
              onClick={async () => {
                if (
                  !window.confirm(
                    '¿Estás seguro de que quieres ELIMINAR este viaje definitivamente?'
                  )
                )
                  return;
                try {
                  await api.delete(`/viajes/${id}/`);
                  navigate('/trips', { replace: true });
                } catch (e) {
                  console.error(e);
                  alert('Error eliminando el viaje');
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Eliminar viaje
            </button>
          </div>
        )}
        {/* ────────────────────────────────── */}

        {/* Chat Modal */}
        {showChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-96 rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">
                  Chat con {viaje.organizador}
                </h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-500 hover:text-gray-800"
                >
                  ×
                </button>
              </div>
              <div className="h-64 overflow-y-auto mb-3 border rounded p-2 flex flex-col">
                {chatError && <p className="text-red-600 text-sm">{chatError}</p>}
                {conversation.map((m) => (
                  <div
                    key={m.id}
                    className={`my-2 p-2 rounded ${
                      m.remitente === user.username
                        ? 'self-end bg-blue-100'
                        : 'self-start bg-gray-200'
                    }`}
                  >
                    <strong>{m.remitente}:</strong> {m.contenido}
                  </div>
                ))}
              </div>
              <textarea
                className="w-full border rounded p-2 mb-2 h-20"
                placeholder="Escribe un mensaje…"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
              />
              <button
                onClick={sendMessage}
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Enviar
              </button>
            </div>
          </div>
        )}
        {/* ────────────────────────────────── */}

        <hr className="my-6" />

        {/* Sección de valoraciones - SOLO FORMULARIO */}
        <h3 className="text-xl font-semibold mb-2">Deja tu valoración</h3>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block mb-1">Puntuación</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {[1, 2, 3, 4, 5].map((n) => (
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
              onChange={(e) => setComment(e.target.value)}
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
      </div>
    </div>
  );
}







