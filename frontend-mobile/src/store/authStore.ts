import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { authService } from '../services/api';

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isHydrated: false,

      setHydrated: () => set({ isHydrated: true }),

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          
          if (response.data && response.data.token) {
            const { user, token } = response.data;
            await AsyncStorage.setItem('scota_token', token);
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
             throw new Error('Respuesta inválida del servidor');
          }
        } catch (error: any) {
          console.error("Login error:", error);
          const msg = error.response?.data?.error || error.message || 'Error de conexión o credenciales';
          set({
            isLoading: false,
            error: msg,
            isAuthenticated: false,
            user: null,
            token: null
          });
          throw error;
        }
      },

      logout: async () => {
        try {
            await AsyncStorage.removeItem('scota_token');
        } catch(e) { console.log(e); }
        set({ user: null, token: null, isAuthenticated: false, error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      }
    }
  )
);
