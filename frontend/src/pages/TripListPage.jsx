// src/pages/TripListPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import TripCard from '../components/TripCard';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function TripListPage() {
  const [viajes, setViajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('');

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/viajes/');
        // Filtramos de entrada sólo los no cancelados:
        const activos = res.data.filter(v => !v.cancelled);
        setViajes(activos);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
        } else {
          setError('Error al cargar los viajes.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user, navigate, logout]);

  if (loading) {
    return <p className="text-center mt-6">Cargando viajes…</p>;
  }
  if (error) {
    return <p className="text-center mt-6 text-red-600">{error}</p>;
  }

  // Orígenes únicos para el filtro
  const origins = Array.from(new Set(viajes.map(v => v.origen)));

  // Buscador + filtro de origen (ahora incluye tanto destino como título):
  const filtered = viajes.filter(v => {
    // 1) Sigue descartando los cancelados (por si quedara alguno):
    if (v.cancelled) return false;

    // 2) Comparación en minúsculas, buscando coincidencia en destino O en título:
    const textoBuscado = search.trim().toLowerCase();
    const destinoLower = v.destino.toLowerCase();
    const tituloLower = v.titulo.toLowerCase();
    const coincideBusqueda =
      destinoLower.includes(textoBuscado) ||
      tituloLower.includes(textoBuscado);

    if (!coincideBusqueda) return false;

    // 3) Filtro de origen (si se ha seleccionado alguno distinto de “”):
    if (filterOrigin && v.origen !== filterOrigin) return false;

    return true;
  });

  return (
    <div className="p-4 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Listado de Viajes</h2>
        <button
          onClick={() => navigate('/trips/create')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Crear viaje
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por destino o título..."
          className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <select
          value={filterOrigin}
          onChange={e => setFilterOrigin(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="">Todos los orígenes</option>
          {origins.map(orig => (
            <option key={orig} value={orig}>
              {orig}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-gray-600">No hay viajes que coincidan.</p>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(v => (
            <TripCard key={v.id} viaje={v} />
          ))}
        </div>
      )}
    </div>
  );
}






