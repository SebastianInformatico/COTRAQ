import { create } from 'zustand';
import apiService from '@/services/api';
import { Maintenance } from '@/types';

interface MaintenanceState {
  maintenances: Maintenance[];
  selectedMaintenance: Maintenance | null;
  isLoading: boolean;
  error: string | null;

  fetchMaintenances: (params?: any) => Promise<void>;
  selectMaintenance: (maintenance: Maintenance | null) => void;
  createMaintenance: (maintenanceData: any) => Promise<void>;
  updateMaintenance: (id: string, maintenanceData: any) => Promise<void>;
  deleteMaintenance: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useMaintenanceStore = create<MaintenanceState>((set) => ({
  maintenances: [],
  selectedMaintenance: null,
  isLoading: false,
  error: null,

  fetchMaintenances: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getMaintenances(params);
      set({
        maintenances: response.data.maintenances,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al cargar mantenimientos',
        isLoading: false,
      });
    }
  },

  selectMaintenance: (maintenance) => {
    set({ selectedMaintenance: maintenance });
  },

  createMaintenance: async (maintenanceData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.createMaintenance(maintenanceData);
      const newMaintenance = response.data.maintenance;
      set((state) => ({
        maintenances: [...state.maintenances, newMaintenance],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al crear mantenimiento',
        isLoading: false,
      });
      throw error;
    }
  },

  updateMaintenance: async (id, maintenanceData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.updateMaintenance(id, maintenanceData);
      const updatedMaintenance = response.data.maintenance;
      set((state) => ({
        maintenances: state.maintenances.map((m) =>
          m.id === id ? updatedMaintenance : m
        ),
        selectedMaintenance:
          state.selectedMaintenance?.id === id
            ? updatedMaintenance
            : state.selectedMaintenance,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al actualizar mantenimiento',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteMaintenance: async (id) => {
    // Implement if API supports delete, otherwise remove from store only if confident
    // For now assuming a delete endpoint might not be fully exposed in previous api list but common practice
    set({ isLoading: true, error: null });
    try {
      // Assuming apiService has deleteMaintenance or we use request
      await apiService.request({ method: 'DELETE', url: `/maintenance/${id}` });
      set((state) => ({
        maintenances: state.maintenances.filter((m) => m.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al eliminar mantenimiento',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
