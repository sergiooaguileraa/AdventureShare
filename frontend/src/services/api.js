// frontend/src/services/api.js
import axios from 'axios';

// ——— Función para leer la cookie CSRF ———
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    document.cookie.split(';').forEach(cookie => {
      const [key, val] = cookie.trim().split('=');
      if (key === name) cookieValue = decodeURIComponent(val);
    });
  }
  return cookieValue;
}

// Configuración de Axios
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    // JWT desde localStorage
    const raw = localStorage.getItem('authTokens');
    if (raw) {
      const { access } = JSON.parse(raw);
      if (access) {
        config.headers.Authorization = `Bearer ${access}`;
      }
    }
    // CSRF para métodos inseguros (si aún usas SessionAuthentication)
    const csrf = getCookie('csrftoken');
    if (csrf && ['post','put','patch','delete'].includes(config.method)) {
      config.headers['X-CSRFToken'] = csrf;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
  return api.patch('/usuarios/me/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
}
export function changePassword(oldPw, newPw) {
  return api.post('/usuarios/me/password/', { old_password: oldPw, new_password: newPw });
}
export function fetchUserById(userId) {
  return api.get(`/usuarios/${userId}/`);
}

export default api;
