import {
    AuthResponse,
    Booking,
    CreateBookingRequest,
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
const API_BASE_URL = 'http://10.0.2.2:3000/api';
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
        // Log the actual request being sent
        console.log('Axios Request:', config.method?.toUpperCase(), config.url);
        console.log('Request Body:', JSON.stringify(config.data, null, 2));
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
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting token:', error);
    }
  }

  async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<AuthResponse> {
    console.log('Attempting registration with data:', JSON.stringify(data, null, 2));
    try {
      const response = await this.client.post<AuthResponse>('/auth/register', data);
      console.log('Registration response:', JSON.stringify(response.data, null, 2));
      await this.setToken(response.data.token);
      return response.data;
    } catch (error: any) {
      console.error('Registration error response:', error.response?.data);
      console.error('Registration error status:', error.response?.status);
      throw error;
    }
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    console.log('Attempting login with email:', data.email);
    try {
      const response = await this.client.post<AuthResponse>('/auth/login', data);
      console.log('Login response:', JSON.stringify(response.data, null, 2));
      await this.setToken(response.data.token);
      return response.data;
    } catch (error: any) {
      console.error('Login error response:', error.response?.data);
      console.error('Login error status:', error.response?.status);
      throw error;
    }
  }

  async getProfile(): Promise<User> {
    const response = await this.client.get<User>('/auth/me');
    console.log('Profile response:', JSON.stringify(response.data, null, 2));
    return response.data;
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
    // Handle both nested and flat response formats
    if (Array.isArray(data)) {
      return data;
    }
    return data.services || [];
  }

  // Bookings endpoints
  async getBookings(): Promise<Booking[]> {
    const response = await this.client.get('/bookings');
    const data = response.data;
    // Handle both nested and flat response formats
    if (Array.isArray(data)) {
      return data;
    }
    return data.bookings || [];
  }

  async getBooking(id: string): Promise<Booking> {
    const response = await this.client.get(`/bookings/${id}`);
    const data = response.data;
    // Handle both nested and flat response formats
    return data.booking || data;
  }

  async createBooking(data: CreateBookingRequest): Promise<Booking> {
    console.log('Creating booking with data:', JSON.stringify(data, null, 2));
    try {
      const response = await this.client.post('/bookings', data);
      const responseData = response.data;
      // Handle both nested and flat response formats
      return responseData.booking || responseData;
    } catch (error: any) {
      console.error('Create booking error response:', error.response?.data);
      console.error('Create booking error status:', error.response?.status);
      throw error;
    }
  }

  async cancelBooking(id: string): Promise<{ message: string }> {
    console.log('Canceling booking with ID:', id);
    try {
      const response = await this.client.delete<{ message: string }>(`/bookings/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Cancel booking error response:', error.response?.data);
      console.error('Cancel booking error status:', error.response?.status);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
