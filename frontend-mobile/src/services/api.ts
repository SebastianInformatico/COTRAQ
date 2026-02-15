import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// URL del Backend (Usar IP local para dispositivos físicos/emuladores)
// Si usas emulador Android, puedes intentar 10.0.2.2 pero la IP LAN es mejor para dispositivos reales
const API_URL = 'http://192.168.1.103:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('scota_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  logout: async () => {
    await AsyncStorage.removeItem('scota_token');
    await AsyncStorage.removeItem('scota_user');
  }
};

export default api;
