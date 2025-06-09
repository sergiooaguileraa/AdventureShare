// src/components/Layout.jsx

import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import AdventureShareLogo from '../assets/AdventureShareLogo.png';

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [reservas, setReservas] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      api.get(`/reservas/?user=${user.id}`)
        .then(res => setReservas(res.data))
        .catch(() => setReservas([]));
    } else {
      setReservas([]);
    }
  }, [user]);

  const toggleMenu = () => setMenuOpen(o => !o);
  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Limitar lista a 5 elementos para no desbordar
  const shown = reservas.slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 bg-white shadow p-4 z-10">
        <nav className="max-w-6xl mx-auto flex items-center">
          <div className="flex items-center space-x-6">
            <Link to="/trips" className="flex items-center">
              <img
                src={AdventureShareLogo}
                alt="AdventureShare"
                className="h-12 w-auto mr-8"
              />
              <span className="text-gray-700 hover:text-blue-600 font">
                Viajes
              </span>
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
            {user?.role === 'organizador' && (
              <Link
                to="/organizador/reservas"
                className="text-gray-700 hover:text-blue-600"
              >
                Solicitudes
              </Link>
            )}
          </div>

          {user && (
            <div className="ml-auto relative">
              <button onClick={toggleMenu} className="focus:outline-none">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border shadow-lg rounded-lg p-4">
                  {/* Cabecera del menú */}
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-600 mb-2">{user.email}</p>

                  <hr className="my-2" />

                  {/* Listado limitado de reservas con scroll */}
                  <p className="font-medium mb-1">Reservas</p>
                  {reservas.length > 0 ? (
                    <div className="max-h-40 overflow-y-auto mb-2">
                      <ul className="list-disc list-inside text-sm">
                        {shown.map(r => (
                          <li key={r.id} className="mb-1">
                            Viaje: {r.viaje.titulo || `#${r.viaje.id}`} —{' '}
                            <span className="capitalize">{r.estado}</span>
                          </li>
                        ))}
                      </ul>
                      {reservas.length > shown.length && (
                        <p className="text-xs text-center text-gray-500">
                          y {reservas.length - shown.length} más…
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-2">Sin reservas</p>
                  )}

                  <hr className="my-2" />

                  {/* Enlaces fijos */}
                  <Link
                    to="/perfil"
                    className="block text-blue-600 hover:underline mb-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    Ver perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-red-600 hover:underline"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      <main className="pt-20 p-4 flex-1 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      <footer className="bg-white shadow p-4 text-center">
        © 2025 Mi Plataforma de Viajes
      </footer>
    </div>
  );
}






