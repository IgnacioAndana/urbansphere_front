import axios from 'axios';

// Instancia global de Axios apuntando al API Gateway o al entorno Docker local
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Ajustable según los puertos del Docker Compose de Ignacio
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// INTERCEPTOR DE PETICIONES: Inyecta el token JWT automáticamente si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('urbansphere_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR DE RESPUESTAS: Captura errores globales (Ej: Expiró el token o error de servidor)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Caso 401: Token inválido o expirado -> Limpiar sesión y mandar al login
      if (error.response.status === 401) {
        localStorage.removeItem('urbansphere_token');
        window.location.href = '/login';
      }
      console.error(`[API Error ${error.response.status}]:`, error.response.data);
    } else {
      console.error('[Network Error]: No se pudo conectar con el servidor backend.');
    }
    return Promise.reject(error);
  }
);

export default api;