// src/pages/MessagesPage.jsx

import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import ChatModal from '../components/ChatModal';

export default function MessagesPage() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [messages, setMessages]     = useState(null);
  const [error, setError]           = useState('');
  const [chatConfig, setChatConfig] = useState(null);

  // 1) Definimos loadMessages con useCallback y lo incluimos en deps
  const loadMessages = useCallback(() => {
    api.get('/mensajes/')
      .then(res => setMessages(res.data))
      .catch(err => {
        console.error(err);
        if (err.response?.status === 401) {
          logout();
        } else {
          setError('No se pudieron cargar tus mensajes');
        }
      });
  }, [logout]);

  // 2) Ahora lo usamos en useEffect SIN warning
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    loadMessages();
  }, [user, navigate, loadMessages]);

  if (error)            return <p className="p-4 text-red-600">{error}</p>;
  if (messages === null) return <p className="p-4">Cargando mensajes…</p>;

  // Agrupa mensajes en conversaciones...
  const convosMap = new Map();
  messages.forEach(m => {
    const otherId = m.remitente_id === user.id ? m.destinatario : m.remitente_id;
    const otherUsername = m.remitente_id === user.id
      ? m.destinatario_username
      : m.remitente;
    const otherAvatar = m.remitente_id === user.id
      ? m.destinatario_avatar
      : m.remitente_avatar;
    const isIncoming = m.destinatario === user.id;
    const incUnread  = isIncoming && !m.leido ? 1 : 0;

    const existing = convosMap.get(otherId);
    if (!existing) {
      convosMap.set(otherId, {
        otherId,
        otherUsername,
        otherAvatar,
        lastContent: m.contenido,
        fecha_envio: m.fecha_envio,
        unreadCount: incUnread,
      });
    } else {
      if (new Date(m.fecha_envio) > new Date(existing.fecha_envio)) {
        existing.lastContent = m.contenido;
        existing.fecha_envio = m.fecha_envio;
      }
      if (incUnread) {
        existing.unreadCount += 1;
      }
    }
  });

  const convos = Array.from(convosMap.values())
    .sort((a, b) => new Date(b.fecha_envio) - new Date(a.fecha_envio));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Mis Conversaciones</h1>

        {convos.length === 0 ? (
          <p className="text-gray-600">No tienes conversaciones activas.</p>
        ) : (
          <div className="space-y-4">
            {convos.map(conv => {
              let fecha;
              try { fecha = new Date(conv.fecha_envio).toLocaleString(); }
              catch { fecha = conv.fecha_envio; }

              return (
                <div
                  key={conv.otherId}
                  className="bg-white flex items-center p-4 rounded shadow cursor-pointer hover:bg-gray-100"
                  onClick={() => setChatConfig(conv)}
                >
                  <img
                    src={conv.otherAvatar}
                    alt={conv.otherUsername}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h2 className="font-medium">{conv.otherUsername}</h2>
                      <span className="text-xs text-gray-500">{fecha}</span>
                    </div>
                    <p className="text-gray-700 truncate">{conv.lastContent}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="ml-4 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {chatConfig && (
          <ChatModal
            otherId={chatConfig.otherId}
            otherUsername={chatConfig.otherUsername}
            onClose={() => {
              setChatConfig(null);
              loadMessages();
            }}
          />
        )}
      </div>
    </div>
  );
}
