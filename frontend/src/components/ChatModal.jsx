// src/components/ChatModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

export default function ChatModal({ otherId, otherUsername, onClose }) {
  const { user, logout } = useContext(AuthContext);
  const [conversation, setConversation] = useState([]);
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    api.get(`/mensajes/conversacion/${otherId}/`)
      .then(res => setConversation(res.data))
      .catch(err => {
        console.error(err);
        setError('No se pudo cargar la conversación');
        if (err.response?.status === 401) logout();
      });
  }, [otherId, logout]);

  const send = () => {
    if (!body.trim()) return;
    api.post('/mensajes/', { destinatario: otherId, contenido: body })
      .then(res => {
        setConversation(prev => [...prev, res.data]);
        setBody('');
      })
      .catch(err => {
        console.error(err);
        setError('Error al enviar mensaje');
      });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white w-96 rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Chat con {otherUsername}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">×</button>
        </div>
        <div className="h-64 overflow-y-auto mb-3 border rounded p-2 flex flex-col">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {conversation.map(m => (
            <div
              key={m.id}
              className={`my-2 p-2 rounded self-${m.remitente === user.username ? 'end bg-blue-100' : 'start bg-gray-200'}`}
            >
              <strong>{m.remitente}:</strong> {m.contenido}
            </div>
          ))}
        </div>
        <textarea
          className="w-full border rounded p-2 mb-2 h-20"
          placeholder="Escribe un mensaje…"
          value={body}
          onChange={e => setBody(e.target.value)}
        />
        <button
          onClick={send}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
