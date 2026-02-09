export interface User {
  id: string;
  email: string;
  fullName: string;
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
  fullName: string;
  phone: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
}

export interface CreateBookingRequest {
  serviceId: string;
  bookingDate: string; // YYYY-MM-DD
  bookingTime: string; // HH:MM
  address: string;
  specialInstructions?: string;
}
