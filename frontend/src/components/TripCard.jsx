// frontend/src/components/TripCard.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TripCard({ viaje }) {
  const navigate = useNavigate();

  // Parseamos las fechas que vienen como strings JSON
  const inicio = new Date(viaje.fecha_inicio);
  const fin = new Date(viaje.fecha_fin);
  const hoy = new Date();

  // Determinar el estado del viaje (por iniciar / en curso / realizado)
  let estadoText = '';
  let estadoClasses = '';
  if (hoy < inicio) {
    estadoText = 'Por iniciar';
    estadoClasses = 'bg-blue-100 text-blue-800';
  } else if (hoy >= inicio && hoy < fin) {
    estadoText = 'En curso';
    estadoClasses = 'bg-yellow-100 text-yellow-800';
  } else {
    estadoText = 'Realizado';
    estadoClasses = 'bg-green-100 text-green-800';
  }

  return (
    <div
      onClick={() => navigate(`/trips/${viaje.id}`)}
      className="relative cursor-pointer bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
    >
      {/*
        Aquí reemplazamos `viaje.imagen_url` por `viaje.imagen`
        (que es la propiedad que devuelve tu API).
      */}
      {viaje.imagen && (
        <img
          src={viaje.imagen}
          alt={viaje.titulo}
          className="w-full h-48 object-cover"
        />
      )}

      {/* Badge de estado en la esquina superior derecha sobre la imagen */}
      <div className="absolute top-2 right-2">
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${estadoClasses}`}
        >
          {/* Punto de color a la izquierda */}
          <span
            className={`inline-block w-2 h-2 rounded-full mr-1 ${
              estadoText === 'Por iniciar'
                ? 'bg-blue-500'
                : estadoText === 'En curso'
                ? 'bg-yellow-500'
                : 'bg-green-500'
            }`}
          ></span>
          {estadoText}
        </span>
      </div>

      <div className="p-4">
        {/* Mostramos sólo propiedades concretas, nunca el objeto entero */}
        <h3 className="text-lg font-semibold mb-1">{viaje.titulo}</h3>
        <p className="text-sm text-gray-600 mb-2">
          {viaje.origen} → {viaje.destino}
        </p>
        <p className="flex items-center text-sm text-gray-500">
          {new Date(viaje.fecha_inicio).toLocaleDateString('es-ES')} –{' '}
          {new Date(viaje.fecha_fin).toLocaleDateString('es-ES')}
        </p>
        <p className="font-semibold mt-2">€{parseFloat(viaje.precio).toFixed(2)}</p>
      </div>
    </div>
  );
}




