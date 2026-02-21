export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number; // in ZAR
  duration_hours: number; // in hours
  active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  service_id: string;
  booking_date: string; // YYYY-MM-DD
  booking_time: string; // HH:MM
  address: string;
  special_instructions?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  total_price: number; // in ZAR
  created_at: string;
  service?: Service; // populated on GET requests
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface CreateBookingRequest {
  serviceId: string;
  scheduledAt: string; // ISO 8601 date string
  locationAddress: string;
  locationLat: number;
  locationLng: number;
  notes?: string;
  asap?: boolean;
}

export interface FindCleanersRequest {
  serviceId: string;
  locationLat: number;
  locationLng: number;
  scheduledAt?: string;
}

export interface CleanerScoreBreakdown {
  proximity: number;
  experience: number;
  retention: number;
  reliability: number;
}

export interface CleanerMatch {
  id: string;
  distance_meters: number;
  rating: number;
  vehicle_type: string;
  score: number;
  score_breakdown: CleanerScoreBreakdown;
  has_previous_bookings: boolean;
  cancellation_rate: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  reviews_count?: number;
}

export interface FindCleanersResponse {
  recommended: CleanerMatch[];
  others: CleanerMatch[];
  metadata: {
    total_cleaners_found: number;
    search_radius_km: number;
    customer_location: {
      lat: number;
      lng: number;
    };
  };
}

export interface AssignCleanerRequest {
  bookingId: string;
  cleanerId: string;
}
