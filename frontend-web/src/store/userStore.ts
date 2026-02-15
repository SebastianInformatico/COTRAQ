import { create } from 'zustand';
import apiService from '@/services/api';
import { User } from '@/types';

interface Pagination {
  current_page: number;
  total_pages: number;
  total_users: number;
  per_page: number;
}

interface UserState {
  users: User[];
  pagination: Pagination | null;
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;
  
  fetchUsers: (params?: any) => Promise<void>;
  selectUser: (user: User | null) => void;
  createUser: (userData: any) => Promise<void>;
  updateUser: (id: string, userData: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  users: [],
  pagination: null,
  selectedUser: null,
  isLoading: false,
  error: null,

  fetchUsers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getUsers(params);
      set({
        users: response.data.users,
        pagination: response.data.pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al cargar usuarios',
        isLoading: false,
      });
    }
  },

  selectUser: (user) => {
    set({ selectedUser: user });
  },

  createUser: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.createUser(userData);
      const newUser = response.data.user;
      set(state => ({
        users: [...state.users, newUser],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al crear usuario',
        isLoading: false,
      });
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.updateUser(id, userData);
      const updatedUser = response.data.user;
      set(state => ({
        users: state.users.map(u => u.id === id ? updatedUser : u),
        selectedUser: state.selectedUser?.id === id ? updatedUser : state.selectedUser,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al actualizar usuario',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.deleteUser(id);
      set(state => ({
        users: state.users.filter(u => u.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al eliminar usuario',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
