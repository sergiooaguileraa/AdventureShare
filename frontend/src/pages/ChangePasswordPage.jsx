// frontend/src/pages/ChangePasswordPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../services/api';

export default function ChangePasswordPage() {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);        // Para mostrar éxito o error
  const [messageType, setMessageType] = useState('');  // 'success' | 'error'
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await changePassword(oldPw, newPw);
      setMessage('✅ Contraseña actualizada correctamente');
      setMessageType('success');
      setOldPw('');
      setNewPw('');
      // Opcional: redirigir pasados unos segundos
      setTimeout(() => navigate('/perfil', { replace: true }), 2000);
    } catch (err) {
      setMessage('❌ No se pudo cambiar la contraseña');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-xl font-bold mb-4">Cambiar contraseña</h1>

      {/* Mensaje inline */}
      {message && (
        <div
          className={`mb-4 p-2 rounded text-white ${
            messageType === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Contraseña actual</label>
          <input
            type="password"
            value={oldPw}
            onChange={e => setOldPw(e.target.value)}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Nueva contraseña</label>
          <input
            type="password"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            required
            className="w-full border rounded px-2 py-1"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="
            bg-blue-600 
            text-white 
            px-4 py-2 
            rounded 
            flex items-center justify-center
            disabled:opacity-40 
            disabled:cursor-not-allowed
          "
        >
          {/* Icono de guardar */}
          <span className="mr-2">💾</span>
          {loading ? 'Cambiando…' : 'Cambiar contraseña'}
        </button>
      </form>
    </div>
  );
}
