// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',  // Apunta a tu backend Django
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,                  // Si en el futuro usas cookies de sesión
});

// Interceptor: añade el Authorization header en cada petición si hay token
api.interceptors.request.use(
  (config) => {
    const raw = localStorage.getItem('authTokens');
    if (raw) {
      const { access } = JSON.parse(raw);
      if (access) {
        config.headers.Authorization = `Bearer ${access}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
