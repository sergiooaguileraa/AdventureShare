// src/App.js

import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';

import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import TripListPage from './pages/TripListPage';
import TripDetailPage from './pages/TripDetailPage';
import CreateTripPage from './pages/CreateTripPage';
import ReservationListPage from './pages/ReservationListPage';
import PaymentPage from './pages/PaymentPage';
import PaymentListPage from './pages/PaymentListPage';
import MessagesPage from './pages/MessagesPage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import OrganizerReservations from './pages/OrganizerReservations'; // ← Nueva pantalla de solicitudes

function RequireAuth({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas dentro del layout general */}
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        {/* Redirige "/" a "/trips" */}
        <Route path="/" element={<Navigate to="/trips" replace />} />

        {/* Gestión de viajes */}
        <Route path="trips" element={<TripListPage />} />
        <Route path="trips/create" element={<CreateTripPage />} />
        <Route path="trips/:id" element={<TripDetailPage />} />

        {/* Reservas y pagos (viajero) */}
        <Route path="reservas" element={<ReservationListPage />} />
        <Route path="reservas/:id/pay" element={<PaymentPage />} />
        <Route path="pagos" element={<PaymentListPage />} />

        {/* Panel de organizador: ver/confirmar solicitudes de reserva */}
        <Route path="organizador/reservas" element={<OrganizerReservations />} />

        {/* Mensajes y conversaciones */}
        <Route path="mensajes" element={<MessagesPage />} />

        {/* Perfil propio y cambio de contraseña */}
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="perfil/cambiar-contraseña" element={<ChangePasswordPage />} />

        {/* Perfil público de otro usuario (organizador) */}
        <Route path="organizador/:id" element={<ProfilePage />} />
      </Route>

      {/* Fallback: redirige rutas desconocidas a /trips */}
      <Route path="*" element={<Navigate to="/trips" replace />} />
    </Routes>
  );
}











