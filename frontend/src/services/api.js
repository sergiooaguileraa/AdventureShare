// frontend/src/services/api.js
import axios from 'axios';

// 1) Instancia de Axios con proxy de CRA y envío de cookies si las usas
const api = axios.create({
  baseURL: '/api',       // CRA redirige '/api' a http://localhost:8000
  withCredentials: true, // si manejas sesión por cookie
});

// 2) Interceptor para añadir Bearer token desde localStorage (si lo necesitas)
api.interceptors.request.use(
  config => {
    const raw = localStorage.getItem('authTokens');
    if (raw) {
      const { access } = JSON.parse(raw);
      if (access) {
        config.headers.Authorization = `Bearer ${access}`;
      }
    }
    return config;
  },
  error => Promise.reject(error)
);

// 3) Funciones que exporta tu app

// Registro de usuario
export function registerUser(username, email, password, password2, role = 'viajero') {
  return api.post('/usuarios/register/', { username, email, password, password2, role });
}

// Login de usuario
export function loginUser(username, password) {
  return api.post('/token/', { username, password });
}

// Refresco de token (si usas JWT)
export function refreshToken(refresh) {
  return api.post('/token/refresh/', { refresh });
}

// Obtener perfil del usuario autenticado
export function fetchProfile() {
  return api.get('/usuarios/me/');
}

// Actualizar perfil (envía FormData para avatar + campos)
export function updateProfile(formData) {
  return api.patch('/usuarios/me/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// Cambiar contraseña
export function changePassword(oldPw, newPw) {
  return api.post('/usuarios/password/', { old_password: oldPw, new_password: newPw });
}

// 4) Export default de la instancia por si la necesitas directamente
export default api;

