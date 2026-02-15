import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { AuthResponse, LoginCredentials, RegisterData } from '@/types';

// Configuración base de Axios
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor para agregar el token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('scota_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor para manejar errores
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Si el token ha expirado
        if (error.response?.status === 403 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('scota_refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const { token } = response.data;
              
              localStorage.setItem('scota_token', token);
              originalRequest.headers.Authorization = `Bearer ${token}`;
              
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh token también expiró
            this.clearAuthData();
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private clearAuthData() {
    localStorage.removeItem('scota_token');
    localStorage.removeItem('scota_refresh_token');
    localStorage.removeItem('scota_user');
  }

  // Métodos de autenticación
  async login(credentials: LoginCredentials): Promise<AxiosResponse<AuthResponse>> {
    return this.api.post('/auth/login', credentials);
  }

  async register(userData: RegisterData): Promise<AxiosResponse<AuthResponse>> {
    return this.api.post('/auth/register', userData);
  }

  async refreshToken(refreshToken: string): Promise<AxiosResponse<{ token: string; refreshToken: string }>> {
    return this.api.post('/auth/refresh', { refreshToken });
  }

  async getProfile(): Promise<AxiosResponse<{ user: any }>> {
    return this.api.get('/auth/profile');
  }

  async updateProfile(data: any): Promise<AxiosResponse<{ user: any }>> {
    return this.api.put('/auth/profile', data);
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<AxiosResponse> {
    return this.api.post('/auth/change-password', data);
  }

  async logout(): Promise<AxiosResponse> {
    return this.api.post('/auth/logout');
  }

  // Métodos de usuarios
  async getUsers(params?: any): Promise<AxiosResponse<{ users: any[]; pagination: any }>> {
    return this.api.get('/users', { params });
  }

  async getUser(id: string): Promise<AxiosResponse<{ user: any }>> {
    return this.api.get(`/users/${id}`);
  }

  async createUser(userData: any): Promise<AxiosResponse<{ user: any }>> {
    return this.api.post('/users', userData);
  }

  async updateUser(id: string, userData: any): Promise<AxiosResponse<{ user: any }>> {
    return this.api.put(`/users/${id}`, userData);
  }

  async deleteUser(id: string): Promise<AxiosResponse> {
    return this.api.delete(`/users/${id}`);
  }

  async getDrivers(): Promise<AxiosResponse<{ drivers: any[] }>> {
    return this.api.get('/users/drivers');
  }

  // Métodos de vehículos
  async getVehicles(params?: any): Promise<AxiosResponse<{ vehicles: any[] }>> {
    return this.api.get('/vehicles', { params });
  }

  async getVehicle(id: string): Promise<AxiosResponse<{ vehicle: any }>> {
    return this.api.get(`/vehicles/${id}`);
  }

  async createVehicle(vehicleData: any): Promise<AxiosResponse<{ vehicle: any }>> {
    return this.api.post('/vehicles', vehicleData);
  }

  async updateVehicle(id: string, vehicleData: any): Promise<AxiosResponse<{ vehicle: any }>> {
    return this.api.put(`/vehicles/${id}`, vehicleData);
  }

  async getAvailableVehicles(): Promise<AxiosResponse<{ vehicles: any[] }>> {
    return this.api.get('/vehicles/available');
  }

  // Métodos de viajes
  async getTrips(params?: any): Promise<AxiosResponse<{ trips: any[] }>> {
    return this.api.get('/trips', { params });
  }

  async getTrip(id: string): Promise<AxiosResponse<{ trip: any }>> {
    return this.api.get(`/trips/${id}`);
  }

  async createTrip(tripData: any): Promise<AxiosResponse<{ trip: any }>> {
    return this.api.post('/trips', tripData);
  }

  async updateTrip(id: string, tripData: any): Promise<AxiosResponse<{ trip: any }>> {
    return this.api.put(`/trips/${id}`, tripData);
  }

  async startTrip(id: string): Promise<AxiosResponse> {
    return this.api.post(`/trips/${id}/start`);
  }

  async completeTrip(id: string, data?: any): Promise<AxiosResponse> {
    return this.api.post(`/trips/${id}/complete`, data);
  }

  // Métodos de checklists
  async getChecklists(params?: any): Promise<AxiosResponse<{ checklists: any[] }>> {
    return this.api.get('/checklists', { params });
  }

  async getChecklist(id: string): Promise<AxiosResponse<{ checklist: any }>> {
    return this.api.get(`/checklists/${id}`);
  }

  async createChecklist(checklistData: any): Promise<AxiosResponse<{ checklist: any }>> {
    return this.api.post('/checklists', checklistData);
  }

  async updateChecklist(id: string, checklistData: any): Promise<AxiosResponse<{ checklist: any }>> {
    return this.api.put(`/checklists/${id}`, checklistData);
  }

  async deleteChecklist(id: string): Promise<AxiosResponse> {
    return this.api.delete(`/checklists/${id}`);
  }

  // Métodos de checklist responses
  async submitChecklistResponse(tripId: string, responses: any[]): Promise<AxiosResponse> {
    return this.api.post(`/trips/${tripId}/checklist-responses`, { responses });
  }

  async getChecklistResponses(tripId: string): Promise<AxiosResponse<{ responses: any[] }>> {
    return this.api.get(`/trips/${tripId}/checklist-responses`);
  }

  async updateChecklistResponse(responseId: string, data: any): Promise<AxiosResponse> {
    return this.api.put(`/checklist-responses/${responseId}`, data);
  }

  // Métodos de usuarios
  async getUsers(params?: any): Promise<AxiosResponse<{ users: any[], pagination: any }>> {
    return this.api.get('/users', { params });
  }

  async getUser(id: string): Promise<AxiosResponse<{ user: any }>> {
    return this.api.get(`/users/${id}`);
  }

  async createUser(userData: any): Promise<AxiosResponse<{ user: any }>> {
    return this.api.post('/users', userData);
  }

  async updateUser(id: string, userData: any): Promise<AxiosResponse<{ user: any }>> {
    return this.api.put(`/users/${id}`, userData);
  }

  async deleteUser(id: string): Promise<AxiosResponse> {
    return this.api.delete(`/users/${id}`);
  }

  // Métodos de turnos
  async getShifts(params?: any): Promise<AxiosResponse<{ shifts: any[] }>> {
    return this.api.get('/shifts', { params });
  }

  async getShift(id: string): Promise<AxiosResponse<{ shift: any }>> {
    return this.api.get(`/shifts/${id}`);
  }

  async createShift(shiftData: any): Promise<AxiosResponse<{ shift: any }>> {
    return this.api.post('/shifts', shiftData);
  }

  async updateShift(id: string, shiftData: any): Promise<AxiosResponse<{ shift: any }>> {
    return this.api.put(`/shifts/${id}`, shiftData);
  }

  // Métodos de mantenimiento
  async getMaintenances(params?: any): Promise<AxiosResponse<{ maintenances: any[] }>> {
    return this.api.get('/maintenance', { params });
  }

  async getMaintenance(id: string): Promise<AxiosResponse<{ maintenance: any }>> {
    return this.api.get(`/maintenance/${id}`);
  }

  async createMaintenance(maintenanceData: any): Promise<AxiosResponse<{ maintenance: any }>> {
    return this.api.post('/maintenance', maintenanceData);
  }

  async updateMaintenance(id: string, maintenanceData: any): Promise<AxiosResponse<{ maintenance: any }>> {
    return this.api.put(`/maintenance/${id}`, maintenanceData);
  }

  // Métodos de documentos
  async getDocuments(params?: any): Promise<AxiosResponse<{ documents: any[] }>> {
    return this.api.get('/documents', { params });
  }

  async getDocument(id: string): Promise<AxiosResponse<{ document: any }>> {
    return this.api.get(`/documents/${id}`);
  }

  async uploadDocument(formData: FormData): Promise<AxiosResponse<{ document: any }>> {
    return this.api.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Métodos de fotos
  async getPhotos(params?: any): Promise<AxiosResponse<{ photos: any[] }>> {
    return this.api.get('/photos', { params });
  }

  async uploadPhoto(formData: FormData): Promise<AxiosResponse<{ photo: any }>> {
    return this.api.post('/photos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deletePhoto(photoId: string): Promise<AxiosResponse> {
    return this.api.delete(`/photos/${photoId}`);
  }

  async verifyPhoto(photoId: string, notes?: string): Promise<AxiosResponse> {
    return this.api.post(`/photos/${photoId}/verify`, { notes });
  }

  async getPhotosByTrip(tripId: string): Promise<AxiosResponse<{ photos: any[] }>> {
    return this.api.get(`/trips/${tripId}/photos`);
  }

  async getPhotosByVehicle(vehicleId: string): Promise<AxiosResponse<{ photos: any[] }>> {
    return this.api.get(`/vehicles/${vehicleId}/photos`);
  }

  // Método genérico para requests personalizados
  async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.request(config);
  }

  // Método para verificar salud del servidor
  async healthCheck(): Promise<AxiosResponse> {
    return this.api.get('/health');
  }
}

export const apiService = new ApiService();
export default apiService;