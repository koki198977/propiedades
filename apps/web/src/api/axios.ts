import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adjuntar token y organización en cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  const orgId = localStorage.getItem('activeOrganizationId');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (orgId) {
    config.headers['x-organization-id'] = orgId;
  }

  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si el token expira, podrías intentar refrescarlo aquí o simplemente redirigir al login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
