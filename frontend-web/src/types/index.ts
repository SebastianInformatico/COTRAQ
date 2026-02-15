// Tipos de usuario
export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'admin' | 'supervisor' | 'driver' | 'mechanic';
  license_number?: string;
  license_expiry?: string;
  employee_id?: string;
  profile_picture?: string;
  is_active: boolean;
  last_login?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Tipos de vehículo
export interface Vehicle {
  id: string;
  license_plate: string;
  brand: string;
  model: string;
  year: number;
  type: 'truck' | 'pickup' | 'van' | 'refrigerated' | 'tank';
  capacity_kg?: number;
  capacity_m3?: number;
  fuel_type: 'gasoline' | 'diesel' | 'gas' | 'electric' | 'hybrid';
  vin?: string;
  engine_number?: string;
  odometer?: number;
  status: 'active' | 'maintenance' | 'inactive' | 'retired';
  insurance_company?: string;
  insurance_policy?: string;
  insurance_expiry?: string;
  inspection_expiry?: string;
  permit_expiry?: string;
  has_gps: boolean;
  has_temperature_control: boolean;
  temperature_range_min?: number;
  temperature_range_max?: number;
  acquisition_date?: string;
  acquisition_cost?: number;
  color?: string;
  notes?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

// Tipos de viaje
export interface Trip {
  id: string;
  trip_number: string;
  driver_id: string;
  vehicle_id: string;
  supervisor_id?: string;
  cargo_type: 'alimento' | 'choritos' | 'producto_terminado' | 'mixto';
  cargo_description?: string;
  cargo_weight_kg?: number;
  cargo_volume_m3?: number;
  origin_address: string;
  destination_address: string;
  scheduled_start: string;
  scheduled_end?: string;
  actual_start?: string;
  actual_end?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'delayed';
  distance_km?: number;
  fuel_consumption_liters?: number;
  odometer_start?: number;
  odometer_end?: number;
  temperature_required: boolean;
  temperature_min?: number;
  temperature_max?: number;
  client_name?: string;
  client_contact?: string;
  client_phone?: string;
  delivery_instructions?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  toll_cost?: number;
  other_expenses?: number;
  notes?: string;
  incidents?: string;
  delivery_confirmation?: string;
  signature_url?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  driver?: Partial<User>;
  supervisor?: Partial<User>;
  vehicle?: Partial<Vehicle>;
}

// Tipos de checklist
export interface Checklist {
  id: string;
  name: string;
  description?: string;
  type: 'pre_trip' | 'during_trip' | 'post_trip' | 'maintenance' | 'safety';
  cargo_type: 'alimento' | 'choritos' | 'producto_terminado' | 'general';
  vehicle_type: 'truck' | 'pickup' | 'van' | 'refrigerated' | 'tank' | 'all';
  is_mandatory: boolean;
  is_active: boolean;
  version: string;
  instructions?: string;
  estimated_duration_minutes?: number;
  requires_photo_evidence: boolean;
  created_by?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  items?: ChecklistItem[];
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  question: string;
  type: 'yes_no' | 'text' | 'number' | 'select' | 'multiselect' | 'photo' | 'signature';
  is_required: boolean;
  order_index: number;
  options?: any;
  validation_rules?: any;
  help_text?: string;
  category?: string;
  points_value: number;
  is_critical: boolean;
  requires_photo: boolean;
  default_value?: string;
  conditional_logic?: any;
  created_at: string;
  updated_at: string;
}

export interface ChecklistResponse {
  id: string;
  trip_id: string;
  checklist_item_id: string;
  response_value?: string;
  response_numeric?: number;
  response_boolean?: boolean;
  response_json?: any;
  photo_urls?: string[];
  signature_url?: string;
  comments?: string;
  location_lat?: number;
  location_lng?: number;
  location_address?: string;
  response_timestamp: string;
  is_compliant?: boolean;
  requires_followup: boolean;
  followup_notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_status: 'pending' | 'approved' | 'rejected' | 'needs_clarification';
  review_comments?: string;
  created_at: string;
  updated_at: string;
}

// Tipos de turno
export interface Shift {
  id: string;
  user_id: string;
  shift_date: string;
  shift_type: 'morning' | 'afternoon' | 'night' | 'full_day' | 'split' | 'on_call';
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'absent' | 'cancelled' | 'late';
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: Partial<User>;
}

// Tipos de mantenimiento
export interface Maintenance {
  id: string;
  vehicle_id: string;
  mechanic_id?: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  priority: 'low' | 'normal' | 'high' | 'critical';
  title: string;
  description?: string;
  scheduled_date: string;
  completed_at?: string;
  actual_cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  vehicle?: Partial<Vehicle>;
  mechanic?: Partial<User>;
}

// Tipos de documento
export interface Document {
  id: string;
  vehicle_id?: string;
  user_id?: string;
  type: 'insurance' | 'permit' | 'inspection' | 'license' | 'registration' | 'certificate' | 'other';
  title: string;
  file_url: string;
  file_name: string;
  expiry_date?: string;
  status: 'active' | 'expired' | 'expiring_soon' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  vehicle?: Partial<Vehicle>;
  user?: Partial<User>;
}

// Tipos de foto
export interface Photo {
  id: string;
  trip_id?: string;
  maintenance_id?: string;
  vehicle_id?: string;
  taken_by: string;
  type: 'pre_trip' | 'during_trip' | 'post_trip' | 'maintenance' | 'damage' | 'cargo' | 'general';
  title?: string;
  file_url: string;
  file_name: string;
  taken_at: string;
  is_verified: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Tipos de Mantenimiento
export interface Maintenance {
  id: string;
  vehicle_id: string;
  mechanic_id?: string;
  type: 'preventive' | 'corrective' | 'emergency' | 'inspection';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'postponed';
  priority: 'low' | 'normal' | 'high' | 'critical';
  title: string;
  description?: string;
  scheduled_date: string;
  start_date?: string;
  end_date?: string;
  cost?: number;
  parts_cost?: number;
  labor_cost?: number;
  notes?: string;
  vehicle?: Vehicle; // Expanded
  mechanic?: User; // Expanded
  created_at: string;
  updated_at: string;
}

// Tipos de Documento
export interface Document {
  id: string;
  vehicle_id?: string;
  user_id?: string;
  type: 'insurance' | 'permit' | 'inspection' | 'license' | 'registration' | 'certificate' | 'manual' | 'invoice' | 'contract' | 'other';
  category: 'vehicle' | 'driver' | 'company' | 'legal' | 'safety' | 'maintenance';
  title: string;
  description?: string;
  document_number?: string;
  issuing_authority?: string;
  issue_date?: string;
  expiry_date?: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
  status: 'valid' | 'expired' | 'expiring' | 'pending' | 'rejected';
  is_verified: boolean;
  vehicle?: Vehicle;
  user?: User;
  created_at: string;
  updated_at: string;
}

// Tipos de Turno
export interface Shift {
  id: string;
  user_id: string;
  shift_date: string;
  shift_type: 'morning' | 'afternoon' | 'night' | 'full_day' | 'split' | 'on_call';
  scheduled_start: string;
  scheduled_end: string;
  actual_start?: string;
  actual_end?: string;
  break_start?: string;
  break_end?: string;
  status: 'scheduled' | 'active' | 'completed' | 'absent' | 'late' | 'leave';
  notes?: string;
  driver?: User;
  created_at: string;
  updated_at: string;
}

// Tipos de autenticación
export interface LoginCredentials {
  login: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  refreshToken?: string;
}

// Tipos de respuesta de API
export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  details?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_items: number;
    per_page: number;
  };
}

// Tipos de notificación
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Tipos de filtro
export interface FilterOptions {
  search?: string;
  status?: string;
  type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}