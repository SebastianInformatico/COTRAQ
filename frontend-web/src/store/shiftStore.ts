import { create } from 'zustand';
import apiService from '@/services/api';
import { Shift } from '@/types';

interface ShiftState {
  shifts: Shift[];
  selectedShift: Shift | null;
  isLoading: boolean;
  error: string | null;

  fetchShifts: (params?: any) => Promise<void>;
  selectShift: (shift: Shift | null) => void;
  createShift: (shiftData: any) => Promise<void>;
  updateShift: (id: string, shiftData: any) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useShiftStore = create<ShiftState>((set) => ({
  shifts: [],
  selectedShift: null,
  isLoading: false,
  error: null,

  fetchShifts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getShifts(params);
      set({
        shifts: response.data.shifts,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al cargar turnos',
        isLoading: false,
      });
    }
  },

  selectShift: (shift) => {
    set({ selectedShift: shift });
  },

  createShift: async (shiftData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.createShift(shiftData);
      const newShift = response.data.shift;
      set((state) => ({
        shifts: [...state.shifts, newShift],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al crear turno',
        isLoading: false,
      });
      throw error;
    }
  },

  updateShift: async (id, shiftData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.updateShift(id, shiftData);
      const updatedShift = response.data.shift;
      set((state) => ({
        shifts: state.shifts.map((s) => (s.id === id ? updatedShift : s)),
        selectedShift:
          state.selectedShift?.id === id ? updatedShift : state.selectedShift,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al actualizar turno',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteShift: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiService.request({ method: 'DELETE', url: `/shifts/${id}` });
      set((state) => ({
        shifts: state.shifts.filter((s) => s.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al eliminar turno',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
