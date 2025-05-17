// src/components/Layout.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Borra tokens y redirige al login
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1) Header fijo */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow p-4 z-10">
        <nav className="max-w-6xl mx-auto flex items-center space-x-6">
          <Link to="/trips" className="text-gray-700 hover:text-blue-600">
            Viajes
          </Link>
          <Link to="/reservas" className="text-gray-700 hover:text-blue-600">
            Mis reservas
          </Link>
          <Link to="/pagos" className="text-gray-700 hover:text-blue-600">
            Pagos
          </Link>
          <Link to="/mensajes" className="text-gray-700 hover:text-blue-600">
            Mensajes
          </Link>
          <button
            onClick={handleLogout}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            Logout
          </button>
        </nav>
      </header>

      {/* 2) Main con padding-top para no tapar el header */}
      <main className="pt-16 p-4 flex-1 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>

      {/* 3) (Opcional) Footer */}
      <footer className="bg-white shadow p-4 text-center">
        © 2025 Mi Plataforma de Viajes
      </footer>
    </div>
  );
}
