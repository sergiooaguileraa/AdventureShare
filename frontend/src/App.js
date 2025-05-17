// frontend/src/App.js
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import TripListPage from './pages/TripListPage';
import TripDetailPage from './pages/TripDetailPage';
import CreateTripPage from './pages/CreateTripPage';
import { AuthContext } from './contexts/AuthContext';

// Componente de protección de rutas
function RequireAuth({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Ruta pública de login */}
      <Route path="/login" element={<LoginPage />} />

      {/* Listado de viajes (protegido) */}
      <Route
        path="/trips"
        element={
          <RequireAuth>
            <TripListPage />
          </RequireAuth>
        }
      />

      {/* Crear nuevo viaje (protegido) */}
      <Route
        path="/trips/create"
        element={
          <RequireAuth>
            <CreateTripPage />
          </RequireAuth>
        }
      />

      {/* Detalle de un viaje (protegido) */}
      <Route
        path="/trips/:id"
        element={
          <RequireAuth>
            <TripDetailPage />
          </RequireAuth>
        }
      />

      {/* Redirigir cualquier otra ruta */}
      <Route path="*" element={<Navigate to="/trips" replace />} />
    </Routes>
  );
}






