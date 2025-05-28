// src/components/Layout.jsx
import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

export default function Layout() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [reservas, setReservas] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      // Obtiene las reservas del usuario actual
      api.get(`/reservas/?user=${user.id}`)
        .then(res => setReservas(res.data))
        .catch(() => setReservas([]));
    }
  }, [user]);

  const toggleMenu = () => setMenuOpen(open => !open);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header fijo */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow p-4 z-10">
        <nav className="max-w-6xl mx-auto flex items-center">
          <div className="flex items-center space-x-6">
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
          </div>

          {user && (
            <div className="ml-auto relative">
              <button onClick={toggleMenu} className="focus:outline-none">
                {user.avatar
                  ? <img src={user.avatar} alt="Avatar" className="h-10 w-10 rounded-full object-cover" />
                  : <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-lg font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                }
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border shadow-lg rounded-lg p-4">
                  <p className="font-semibold">{user.username}</p>
                  <p className="text-sm text-gray-600 mb-2">{user.email}</p>

                  <hr className="my-2" />
                  <p className="font-medium">Reservas</p>
                  {reservas.length > 0 ? (
                    <ul className="list-disc list-inside text-sm mb-2">
                      {reservas.map(r => (
                        <li key={r.id}>
                          Viaje #{r.viaje} — {r.estado}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500 mb-2">Sin reservas</p>
                  )}

                  <hr className="my-2" />
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

      {/* Main con padding-top para no tapar el header */}
      <main className="pt-20 p-4 flex-1 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Aquí se renderiza el contenido de cada ruta */}
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow p-4 text-center">
        © 2025 Mi Plataforma de Viajes
      </footer>
    </div>
  );
}
