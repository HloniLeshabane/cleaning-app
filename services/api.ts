import {
    AssignCleanerRequest,
    AuthResponse,
    Booking,
    CleanerTrackingInfo,
    CreateBookingRequest,
    FindCleanersRequest,
    FindCleanersResponse,
    LoginRequest,
    RegisterRequest,
    Service,
    UpdateBookingRequest,
    UpdateProfileRequest,
    User,
} from '@/types/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosError, AxiosInstance } from 'axios';
import Constants from 'expo-constants';

// Dynamically resolve the backend URL:
// 1. In dev (Expo Go), derive from hostUri so any machine's IP works automatically.
// 2. In EAS / production builds, use the EXPO_PUBLIC_API_URL env variable.
// 3. Last resort: Android emulator alias (10.0.2.2) for local emulator testing.
function getApiBaseUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0]; // strip Expo's port
    return `http://${host}:3000/api`;
  }
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  return 'http://10.0.2.2:3000/api'; // Android emulator fallback
}

const API_BASE_URL = getApiBaseUrl();
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

  async getBookingTracking(bookingId: string): Promise<CleanerTrackingInfo> {
    const response = await this.client.get<CleanerTrackingInfo>(`/bookings/${bookingId}/tracking`);
    return response.data;
  }

  async updateBooking(id: string, data: UpdateBookingRequest): Promise<Booking> {
    const response = await this.client.patch<Booking>(`/bookings/${id}`, data);
    return response.data;
  }

  async registerPushToken(token: string): Promise<void> {
    await this.client.post('/notifications/push-token', { token });
  }
}

export const apiClient = new ApiClient();
