// frontend/src/components/TripCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TripCard({ viaje }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/trips/${viaje.id}`)}
      className="cursor-pointer bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
    >
      <img
        src={viaje.imagen_url} // o tu campo de imagen
        alt={viaje.destino}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{viaje.nombre}</h3>
        <p className="text-sm text-gray-600">
          {viaje.origen} → {viaje.destino}
        </p>
        <p className="text-sm text-gray-500">
          {new Date(viaje.fecha_inicio).toLocaleDateString()} –{' '}
          {new Date(viaje.fecha_fin).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}



