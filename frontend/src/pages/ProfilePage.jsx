// src/pages/ProfilePage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

export default function ProfilePage() {
  // --- 1) Parámetros y contexto ---
  const { id } = useParams();           // Si “id” es undefined → mi propio perfil
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  // --- 2) Estados principales ---
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Chat
  const [showChat, setShowChat] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [messageBody, setMessageBody] = useState('');
  const [chatError, setChatError] = useState('');

  // Valoraciones recibidas (solo las del organizador correcto)
  const [reviewsReceived, setReviewsReceived] = useState([]);

  // Edición inline de username/bio
  const [editMode, setEditMode] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [usernameError, setUsernameError] = useState('');

  // Avatar:
  //  - previewAvatar: URL de previsualización (dataURL o URL del backend)
  //  - savingProfile: indicador de si se está subiendo avatar o guardando cambios
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  // --- 3) ¿Estoy viendo mi propio perfil o el de otro?
  //     - Si “id” está undefined → /perfil → es mi propio perfil.
  //     - Si “id” existe y coincide con user.id → también es mi propio perfil.
  const isOwnProfile = !id || parseInt(id, 10) === user?.id;

  // ========================================================================
  //                              EFECTOS
  // ========================================================================

  // --- Efecto 1: Cargar datos del perfil (propio o ajeno) ---
  useEffect(() => {
    if (!user) {
      // Si no hay usuario en contexto → redirigir a login
      navigate('/login', { replace: true });
      return;
    }

    setLoading(true);
    setError('');

    if (!id) {
      // 1.A) “/perfil” → cargar mi propio perfil
      api
        .get('/usuarios/me/')
        .then((res) => {
          setProfile(res.data);
          if (res.data.avatar) {
            setPreviewAvatar(res.data.avatar);
          }
        })
        .catch((err) => {
          console.error(err);
          if (err.response?.status === 401) {
            logout();
            navigate('/login', { replace: true });
          } else {
            setError('No se pudo cargar tu perfil.');
          }
        })
        .finally(() => setLoading(false));
    } else {
      // 1.B) “/organizador/:id” → cargar perfil público de otro usuario
      api
        .get(`/usuarios_publicos/${id}/`)
        .then((res) => {
          setProfile(res.data);
          if (res.data.avatar) {
            setPreviewAvatar(res.data.avatar);
          }
        })
        .catch((err) => {
          console.error(err);
          if (err.response?.status === 401) {
            logout();
            navigate('/login', { replace: true });
          } else if (err.response?.status === 404) {
            setError('Usuario no encontrado.');
          } else {
            setError('No se pudo cargar el perfil.');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [id, user, navigate, logout]);

  // --- Efecto 2: Cargar únicamente las valoraciones recibidas por el organizador correcto ---
  //      Si ese usuario (o yo, si es mi perfil) organiza al menos un viaje, las solicitamos
  useEffect(() => {
    if (!profile) return;

    // Determinar “organizadorId”:
    //   - si “id” existe → perfil ajeno → organizadorId = parseInt(id)
    //   - si “id” no existe → perfil propio → organizadorId = user.id
    const organizadorId = id ? parseInt(id, 10) : user.id;

    // 2.A) Primero, verificamos si este usuario organiza algún viaje:
    api
      .get(`/viajes/?organizador=${organizadorId}`)
      .then((res) => {
        const misViajes = res.data;

        if (misViajes.length === 0) {
          // Si no organiza NINGÚN viaje, no le pedimos valoraciones
          setReviewsReceived([]);
          return;
        }

        // 2.B) Si sí organiza al menos un viaje → buscamos todas las valoraciones de esos viajes:
        api
          .get(`/valoraciones/?viaje__organizador=${organizadorId}`)
          .then((res2) => {
            setReviewsReceived(res2.data);
          })
          .catch((err2) => {
            console.error(err2);
            setReviewsReceived([]);
          });
      })
      .catch((err) => {
        console.error(err);
        setReviewsReceived([]);
      });
  }, [profile, id, user.id]);

  // ========================================================================
  //                            FUNCIONES AUXILIARES
  // ========================================================================

  // --- Funciones para el chat (solo si es perfil ajeno) ---
  const openChat = () => {
    setChatError('');
    setConversation([]);

    // Si estoy en mi propio perfil → no muestro chat
    if (!id) return;

    api
      .get(`/mensajes/conversacion/${id}/`)
      .then((res) => {
        setConversation(res.data);
      })
      .catch((err) => {
        console.error(err);
        setChatError('No se pudo cargar la conversación.');
      });

    setShowChat(true);
  };

  const sendMessage = () => {
    if (!messageBody.trim() || !id) return;

    api
      .post('/mensajes/', {
        destinatario: parseInt(id, 10),
        contenido: messageBody,
      })
      .then((res) => {
        setConversation((prev) => [...prev, res.data]);
        setMessageBody('');
      })
      .catch((err) => {
        console.error(err);
        setChatError('Error enviando mensaje.');
      });
  };

  // --- Edición inline de username/bio ---
  const startEdit = (field) => {
    setUsernameError('');
    setEditMode(field);
    if (field === 'username') {
      setTempValue(profile.username || '');
    } else if (field === 'bio') {
      setTempValue(profile.bio || '');
    }
  };

  const cancelEdit = () => {
    setEditMode(null);
    setTempValue('');
  };

  // --- Subir avatar inmediatamente (sin botón “Guardar”) ---
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Previsualizar localmente
    setPreviewAvatar(URL.createObjectURL(file));
    setSavingProfile(true);

    try {
      const form = new FormData();
      form.append('avatar', file);

      // PATCH a /usuarios/me/ solamente con avatar
      const { data } = await api.patch('/usuarios/me/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Refrescar el objeto `profile` con la URL definitiva
      setProfile(data);
      if (data.avatar) setPreviewAvatar(data.avatar);
    } catch (err) {
      console.error(err);
      alert('Error subiendo la foto de perfil. Intenta de nuevo.');
      // Si falla, revertimos la previsualización
      if (profile && profile.avatar) {
        setPreviewAvatar(profile.avatar);
      } else {
        setPreviewAvatar(null);
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // --- Guardar cambios en username o bio ---
  const saveProfile = async () => {
    setSavingProfile(true);
    setUsernameError('');

    try {
      const form = new FormData();
      if (editMode === 'username') {
        if (!tempValue.trim()) {
          setUsernameError('El usuario no puede quedar vacío.');
          setSavingProfile(false);
          return;
        }
        form.append('username', tempValue.trim());
      }
      if (editMode === 'bio') {
        form.append('bio', tempValue);
      }

      await api.patch('/usuarios/me/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Cargar nuevamente mis datos actualizados
      const { data } = await api.get('/usuarios/me/');
      setProfile(data);
      if (data.avatar) setPreviewAvatar(data.avatar);
      setEditMode(null);
      setTempValue('');
    } catch (err) {
      console.error(err);
      if (err.response?.data?.username) {
        setUsernameError(err.response.data.username[0]);
      } else {
        alert('Error guardando cambios en el perfil.');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // ========================================================================
  //                            RENDERIZADO PRINCIPAL
  // ========================================================================
  if (loading) {
    return <p className="text-center mt-6">Cargando perfil…</p>;
  }
  if (error) {
    return <p className="text-center mt-6 text-red-600">{error}</p>;
  }
  if (!profile) {
    return null; // (no hay nada que mostrar)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6">
        {/* ← Volver atrás */}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline mb-4"
        >
          ← Volver atrás
        </button>

        {/* ——— Avatar, Username y Biografía ——— */}
        <div className="flex flex-col items-center mb-6">
          <label htmlFor="avatar-input" className="cursor-pointer">
            <input
              id="avatar-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
              disabled={!isOwnProfile || savingProfile}
            />
            {previewAvatar ? (
              <img
                src={previewAvatar}
                alt={profile.username}
                className="w-32 h-32 rounded-full object-cover mb-4"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 mb-4 flex items-center justify-center text-gray-500">
                📷
              </div>
            )}
          </label>

          {/* Editable: Username */}
          {editMode === 'username' ? (
            <div className="w-full max-w-xs">
              <input
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-1"
                disabled={savingProfile}
              />
              {usernameError && (
                <p className="text-red-600 text-sm mb-1">{usernameError}</p>
              )}
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelEdit}
                  disabled={savingProfile}
                  className="text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingProfile ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h2 className="text-2xl font-bold">{profile.username}</h2>
              {isOwnProfile && (
                <button
                  onClick={() => startEdit('username')}
                  className="text-gray-500 hover:text-gray-800"
                >
                  ✎
                </button>
              )}
            </div>
          )}

          {/* Editable: Biografía */}
          {editMode === 'bio' ? (
            <div className="w-full max-w-md mt-3">
              <textarea
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full border rounded px-3 py-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-400 mb-1"
                disabled={savingProfile}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={cancelEdit}
                  disabled={savingProfile}
                  className="text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {savingProfile ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {profile.bio && (
                <p className="mt-2 text-gray-700 text-center">{profile.bio}</p>
              )}
              {isOwnProfile && (
                <button
                  onClick={() => startEdit('bio')}
                  className="mt-2 text-gray-500 hover:text-gray-800"
                >
                  ✎ Editar biografía
                </button>
              )}
            </>
          )}
        </div>

        {/* ——— Cambiar contraseña (solo en mi propio perfil) ——— */}
        {isOwnProfile && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => navigate('/perfil/cambiar-contraseña')}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
            >
              Cambiar contraseña
            </button>
          </div>
        )}

        {/* ——— Botón de “Enviar mensaje” (solo si es perfil ajeno) ——— */}
        {!isOwnProfile && (
          <div className="flex justify-center mb-6">
            <button
              onClick={openChat}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Enviar mensaje
            </button>
          </div>
        )}

        {/* ——— Lista de Valoraciones Recibidas (solo del organizador correcto) ——— */}
        <h3 className="text-xl font-semibold mb-4">Valoraciones recibidas</h3>
        {reviewsReceived.length === 0 ? (
          <p className="text-gray-600 mb-6">
            {isOwnProfile
              ? 'Aún no has recibido valoraciones.'
              : 'Este usuario aún no tiene valoraciones.'}
          </p>
        ) : (
          <div className="space-y-4 mb-6">
            {reviewsReceived.map((r) => (
              <div key={r.id} className="border rounded p-4">
                <div className="flex justify-between items-center mb-1">
                  <p className="font-medium">{r.autor_username}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(r.creado_en).toLocaleDateString()}
                  </p>
                </div>
                <p className="text-yellow-600 font-semibold mb-1">
                  {r.puntuacion}★
                </p>
                <p className="text-gray-700">{r.comentario}</p>
              </div>
            ))}
          </div>
        )}

        {/* ——— Modal de Chat ——— */}
        {showChat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-96 rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Chat con {profile.username}</h3>
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
                      m.remitente === user.username ? 'self-end bg-blue-100' : 'self-start bg-gray-200'
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
        {/* ——— Fin Modal de Chat ——— */}
      </div>
    </div>
  );
}





