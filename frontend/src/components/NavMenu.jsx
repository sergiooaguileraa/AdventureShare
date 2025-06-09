// src/components/NavMenu.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, User, LogOut } from 'lucide-react';
import './NavMenu.css';    // <-- importa tu CSS aquí

export default function NavMenu() {
  return (
    <nav className="nav-menu">
      <ul>
        <li>
          <NavLink to="/trips" className={({ isActive }) => (isActive ? 'active' : '')}>
            <Home size={20} /> Tus viajes
          </NavLink>
        </li>
        <li>
          <NavLink to="/messages" className={({ isActive }) => (isActive ? 'active' : '')}>
            <MessageCircle size={20} /> Mensajes
          </NavLink>
        </li>
        <li>
          <NavLink to="/perfil" className={({ isActive }) => (isActive ? 'active' : '')}>
            <User size={20} /> Perfil
          </NavLink>
        </li>
        <li>
          <NavLink to="/logout">
            <LogOut size={20} /> Cerrar sesión
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

