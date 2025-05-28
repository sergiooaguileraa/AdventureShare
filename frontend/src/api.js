// frontend/src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  withCredentials: true,
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      alert('Tu sesión ha expirado. Por favor, inicia sesión de nuevo.');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
