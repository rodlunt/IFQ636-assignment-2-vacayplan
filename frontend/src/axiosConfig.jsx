import axios from 'axios';
import { STORAGE_KEY, readUserFromStorage } from './lib/authStorage';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001',
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const user = readUserFromStorage();
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? '';
    const isAuthAttempt =
      url.includes('/api/auth/login') || url.includes('/api/auth/register');
    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
