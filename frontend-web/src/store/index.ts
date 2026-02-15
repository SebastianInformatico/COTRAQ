import { create } from 'zustand';
import { Vehicle, Trip } from '@/types';
import apiService from '@/services/api';

interface VehicleState {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;
  fetchVehicles: () => Promise<void>;
  selectVehicle: (vehicle: Vehicle) => void;
  createVehicle: (vehicleData: Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateVehicle: (id: string, vehicleData: Partial<Vehicle>) => Promise<void>;
  clearError: () => void;
}

export const useVehicleStore = create<VehicleState>((set, get) => ({
  vehicles: [],
  selectedVehicle: null,
  isLoading: false,
  error: null,

  fetchVehicles: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.getVehicles();
      set({
        vehicles: response.data.vehicles,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al cargar vehículos',
        isLoading: false,
      });
    }
  },

  selectVehicle: (vehicle: Vehicle) => {
    set({ selectedVehicle: vehicle });
  },

  createVehicle: async (vehicleData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.createVehicle(vehicleData);
      const newVehicle = response.data.vehicle;
      
      set(state => ({
        vehicles: [...state.vehicles, newVehicle],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al crear vehículo',
        isLoading: false,
      });
      throw error;
    }
  },

  updateVehicle: async (id: string, vehicleData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.updateVehicle(id, vehicleData);
      const updatedVehicle = response.data.vehicle;
      
      set(state => ({
        vehicles: state.vehicles.map(v => v.id === id ? updatedVehicle : v),
        selectedVehicle: state.selectedVehicle?.id === id ? updatedVehicle : state.selectedVehicle,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al actualizar vehículo',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  isLoading: boolean;
  error: string | null;
  fetchTrips: (params?: any) => Promise<void>;
  setCurrentTrip: (trip: Trip | null) => void;
  createTrip: (tripData: Omit<Trip, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  startTrip: (id: string) => Promise<void>;
  completeTrip: (id: string, data?: any) => Promise<void>;
  clearError: () => void;
}

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  currentTrip: null,
  isLoading: false,
  error: null,

  fetchTrips: async (params) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.getTrips(params);
      set({
        trips: response.data.trips,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al cargar viajes',
        isLoading: false,
      });
    }
  },

  setCurrentTrip: (trip: Trip | null) => {
    set({ currentTrip: trip });
  },

  createTrip: async (tripData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await apiService.createTrip(tripData);
      const newTrip = response.data.trip;
      
      set(state => ({
        trips: [...state.trips, newTrip],
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al crear viaje',
        isLoading: false,
      });
      throw error;
    }
  },

  startTrip: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      await apiService.startTrip(id);
      
      set(state => ({
        trips: state.trips.map(t => 
          t.id === id 
            ? { ...t, status: 'in_progress', actual_start_time: new Date().toISOString() }
            : t
        ),
        currentTrip: state.currentTrip?.id === id 
          ? { ...state.currentTrip, status: 'in_progress', actual_start_time: new Date().toISOString() }
          : state.currentTrip,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al iniciar viaje',
        isLoading: false,
      });
      throw error;
    }
  },

  completeTrip: async (id: string, data) => {
    set({ isLoading: true, error: null });
    
    try {
      await apiService.completeTrip(id, data);
      
      set(state => ({
        trips: state.trips.map(t => 
          t.id === id 
            ? { ...t, status: 'completed', actual_end_time: new Date().toISOString() }
            : t
        ),
        currentTrip: state.currentTrip?.id === id 
          ? { ...state.currentTrip, status: 'completed', actual_end_time: new Date().toISOString() }
          : state.currentTrip,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al completar viaje',
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

interface AppState {
  sidebarOpen: boolean;
  currentRoute: string;
  notifications: any[];
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentRoute: (route: string) => void;
  addNotification: (notification: any) => void;
  removeNotification: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  currentRoute: '/',
  notifications: [],

  toggleSidebar: () => set(state => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  setCurrentRoute: (route: string) => set({ currentRoute: route }),
  addNotification: (notification) => set(state => ({
    notifications: [...state.notifications, { ...notification, id: Date.now().toString() }]
  })),
  removeNotification: (id: string) => set(state => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
}));