import {
    AssignCleanerRequest,
    AuthResponse,
    Booking,
    CreateBookingRequest,
    FindCleanersRequest,
    FindCleanersResponse,
    LoginRequest,
    RegisterRequest,
    Service,
    UpdateProfileRequest,
    User,
} from '@/types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance } from 'axios';

// For Android Emulator, use 10.0.2.2 instead of localhost
// For iOS Simulator, use localhost
// For physical device, use your computer's IP address (e.g., http://192.168.1.100:3000/api)
const API_BASE_URL = 'http://192.168.8.63:3000/api';
const TOKEN_KEY = 'auth_token';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to inject token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - clear it
          await this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch {
      // Silently fail — token will not persist
    }
  }

  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch {
      // Silently fail
    }
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.client.post<AuthResponse>('/auth/register', data);
      await this.setToken(response.data.token);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.client.post<AuthResponse>('/auth/login', data);
      await this.setToken(response.data.token);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async getProfile(): Promise<User> {
    const response = await this.client.get<{ user: User }>('/auth/me');
    return response.data.user;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await this.client.put<User>('/auth/profile', data);
    return response.data;
  }

  async logout(): Promise<void> {
    await this.clearToken();
  }

  // Services endpoints
  async getServices(): Promise<Service[]> {
    const response = await this.client.get('/services');
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    return data.services || [];
  }

  // Bookings endpoints
  async getBookings(): Promise<Booking[]> {
    const response = await this.client.get('/bookings');
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    return data.bookings || [];
  }

  async getBooking(id: string): Promise<Booking> {
    const response = await this.client.get(`/bookings/${id}`);
    const data = response.data;
    return data.booking || data;
  }

  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    try {
      const response = await this.client.post('/bookings', data);
      const responseData = response.data;
      return responseData.booking || responseData;
    } catch (error: any) {
      throw error;
    }
  }

  async cancelBooking(id: string): Promise<{ message: string }> {
    try {
      const response = await this.client.post<{ message: string }>(`/bookings/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  // Cleaner matching endpoints
  async findCleaners(data: FindCleanersRequest): Promise<FindCleanersResponse> {
    try {
      const response = await this.client.post<FindCleanersResponse>('/bookings/find-cleaners', data);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }

  async assignCleaner(data: AssignCleanerRequest): Promise<Booking> {
    try {
      const response = await this.client.post<Booking>(`/bookings/${data.bookingId}/assign-cleaner`, {
        cleanerId: data.cleanerId,
      });
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
