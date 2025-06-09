// frontend/src/services/api.js

import axios from 'axios';

// ----------------------------------------------------------------------
// Configuramos Axios para que apunte directamente al backend Django,
// evitando el proxy de CRA que estaba provocando ECONNREFUSED.
// ----------------------------------------------------------------------

// Ajusta esta URL si tu servidor Django corre en otro puerto o host.
// En este ejemplo asumimos que Django está en http://127.0.0.1:8000
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  withCredentials: true,
});

// Interceptor para añadir Bearer token desde localStorage (si usas JWT)
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

// ——————————————————————————————————————————————————————————————
// Funciones que exporta tu app (las rutas ahora usarán la URL completa).
//—————————————————————————————————————————————————————————————

export function registerUser(username, email, password, password2, role = 'viajero') {
  return api.post('/usuarios/register/', { username, email, password, password2, role });
}

export function loginUser(username, password) {
  return api.post('/token/', { username, password });
}

export function refreshToken(refresh) {
  return api.post('/token/refresh/', { refresh });
}

export function fetchProfile() {
  return api.get('/usuarios/me/');
}

export function updateProfile(formData) {
  return api.patch('/usuarios/me/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export function changePassword(oldPw, newPw) {
  return api.post('/usuarios/me/password/', { old_password: oldPw, new_password: newPw });
}

// ----------------------------------------------------------------------
// Nueva función: obtener perfil de cualquier usuario por su ID
// ----------------------------------------------------------------------
/**
 * Obtener datos de un usuario dado su ID
 * @param {number|string} userId 
 * @returns {Promise} Resuelve con { id, username, email, avatar, ... }
 */
export function fetchUserById(userId) {
  return api.get(`/usuarios/${userId}/`);
}

//  Export default de la instancia, por si necesitas usarla directamente
export default api;

