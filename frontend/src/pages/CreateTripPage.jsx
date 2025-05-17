// frontend/src/pages/CreateTripPage.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';

export default function CreateTripPage() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    origen: '',
    destino: '',
    fecha_inicio: '',
    fecha_fin: '',
    precio: '',
    plazas_totales: '',
    imagen: null,
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  const onChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const data = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val !== null && val !== '') {
        data.append(key, val);
      }
    });

    try {
      await api.post('/viajes/', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/trips', { replace: true });
    } catch (err) {
      console.error(err.response?.data || err.message);
      if (err.response?.status === 401) {
        logout();
      } else if (err.response?.data) {
        const errs = err.response.data;
        let msgs = '';
        if (typeof errs === 'object' && errs !== null) {
          msgs = Object.entries(errs)
            .map(([field, m]) => {
              if (Array.isArray(m)) {
                return `${field}: ${m.join(', ')}`;
              }
              return `${field}: ${m}`;
            })
            .join(' · ');
        } else {
          msgs = String(errs);
        }
        setError(msgs);
      } else {
        setError('Error al crear el viaje. Revisa los datos.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-4">Crear nuevo viaje</h2>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow"
      >
        <div>
          <label className="block mb-1 font-medium">Título</label>
          <input
            name="titulo"
            value={form.titulo}
            onChange={onChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Descripción</label>
          <textarea
            name="descripcion"
            value={form.descripcion}
            onChange={onChange}
            className="w-full border rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ['origen', 'Origen'],
            ['destino', 'Destino'],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="block mb-1 font-medium">{label}</label>
              <input
                name={name}
                value={form[name]}
                onChange={onChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            ['fecha_inicio', 'Fecha inicio'],
            ['fecha_fin', 'Fecha fin'],
          ].map(([name, label]) => (
            <div key={name}>
              <label className="block mb-1 font-medium">{label}</label>
              <input
                name={name}
                type="date"
                value={form[name]}
                onChange={onChange}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Precio (€)</label>
            <input
              name="precio"
              type="number"
              step="0.01"
              value={form.precio}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Plazas totales</label>
            <input
              name="plazas_totales"
              type="number"
              min="1"
              value={form.plazas_totales}
              onChange={onChange}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">Foto de la ruta</label>
          <label
            htmlFor="imagen"
            className="flex items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500 transition-colors"
          >
            {form.imagen ? form.imagen.name : (
              <span className="text-gray-500">
                Haz clic o arrastra aquí tu imagen
              </span>
            )}
            <input
              id="imagen"
              name="imagen"
              type="file"
              accept="image/*"
              onChange={onChange}
              className="hidden"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Crear viaje'}
        </button>
      </form>
    </div>
  );
}

