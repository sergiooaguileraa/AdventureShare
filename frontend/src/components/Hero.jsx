// src/components/Hero.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <div
      className="bg-hero bg-cover bg-center h-screen flex flex-col justify-center items-center text-white"
      style={{ backgroundBlendMode: "multiply", backgroundColor: "rgba(0,0,0,0.4)" }}
    >
      <h1 className="text-5xl font-heading drop-shadow-lg mb-4">
        Vive tu próxima aventura
      </h1>
      <p className="text-lg mb-6 max-w-xl text-center">
        Explora rutas únicas, reserva tus viajes y déjate llevar por la naturaleza.
      </p>
      <Link
        to="/trips"
        className="bg-secondary hover:bg-secondary/90 text-white font-semibold px-6 py-3 rounded-lg transition"
      >
        Ver viajes
      </Link>
    </div>
  );
}
