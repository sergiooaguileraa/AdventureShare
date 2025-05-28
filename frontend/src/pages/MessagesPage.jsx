// frontend/src/pages/MessagesPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

export default function MessagesPage() {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    api.get(`/mensajes/?user=${user.id}`)
      .then(res => setMessages(res.data))
      .catch(() => setMessages([]));
  }, [user, navigate]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Mis Mensajes</h2>
      {messages.length > 0 ? (
        <ul className="space-y-2">
          {messages.map(msg => (
            <li key={msg.id} className="bg-white p-4 rounded-lg shadow">
              <p className="font-medium">De: {msg.sender_username}</p>
              <p>{msg.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(msg.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No tienes mensajes.</p>
      )}
    </div>
  );
}
