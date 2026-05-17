import axios from 'axios';

const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://praj-scheduler.onrender.com/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

// Interceptor to add the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Send token directly as per requirement
    config.headers.Authorization = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle unauthorized responses
api.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.status === 401) {
    // Token is likely expired or invalid
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;
