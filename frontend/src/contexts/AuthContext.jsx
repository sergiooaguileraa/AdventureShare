// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('authTokens');
    if (raw) {
      api.get('/usuarios/me/')
        .then(res => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('authTokens');
          navigate('/login', { replace: true });
        });
    }
  }, [navigate]);

  const login = async (username, password) => {
    const { data } = await api.post('/token/', { username, password });
    localStorage.setItem('authTokens', JSON.stringify(data));
    const userRes = await api.get('/usuarios/me/');
    setUser(userRes.data);
  };

  const register = async (username, email, password) => {
    await api.post('/usuarios/register/', {
      username,
      email,
      password,
      password2: password,
    });
    await login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('authTokens');
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}








