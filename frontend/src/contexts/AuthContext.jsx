import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchProfile,
  registerUser,
  loginUser,
  updateProfile,
  changePassword,
} from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Carga inicial del usuario si hay tokens guardados
  useEffect(() => {
    const raw = localStorage.getItem('authTokens');
    if (raw) {
      fetchProfile()
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.removeItem('authTokens');
          setUser(null);
          navigate('/login', { replace: true });
        });
    }
  }, [navigate]);

  // Inicia sesión y carga perfil
  const login = async (username, password) => {
    const { data: tokens } = await loginUser(username, password);
    localStorage.setItem('authTokens', JSON.stringify(tokens));
    const { data: userData } = await fetchProfile();
    setUser(userData);
    navigate('/', { replace: true });
  };

  // Registra y luego inicia sesión automáticamente
  const register = async (username, email, password, role = 'viajero') => {
    await registerUser(username, email, password, password, role);
    await login(username, password);
  };

  // Cierra sesión
  const logout = () => {
    localStorage.removeItem('authTokens');
    setUser(null);
    navigate('/login', { replace: true });
  };

  // Actualiza perfil en backend y contexto
  const updateUserProfile = async (formData) => {
    const { data } = await updateProfile(formData);
    setUser(data);
    return data;
  };

  // Cambia contraseña
  const changeUserPassword = async (oldPassword, newPassword) => {
    return await changePassword(oldPassword, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateUserProfile,
        changeUserPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}










