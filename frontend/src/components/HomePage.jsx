import React from 'react';

export default function HomePage() {
  return (
    <div className="p-8">
      {/* Este título usará Raleway, el “heading” */}
      <h1 className="font-heading text-4xl text-primary mb-4">
        Vive tu próxima aventura
      </h1>

      {/* Este párrafo usará Inter, el “body” */}
      <p className="font-body text-base text-gray-700">
        Nuestra plataforma te lleva a las rutas más espectaculares que puedas imaginar.
      </p>
    </div>
  );
}
