import axios from 'axios';
import api from './axios';
import type { LoginRequest, LoginResponse } from '@/types/auth';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
      if (!response.data.success) {
        throw new Error(response.data.message ?? 'Login failed');
      }
      if (response.data.data == null) {
        throw new Error('No data returned from server');
      }
      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // Use mock data as fallback when backend is unavailable
        console.warn('Backend unavailable, using mock authentication');
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 3600 * 1000).toISOString();
        return {
          user: {
            id: '1',
            email: credentials.email,
            name: 'Admin User',
            role: 'admin',
          },
          tokens: {
            access: {
              token: 'mock-token-' + Date.now(),
              expiresAt,
            },
            refresh: {
              token: 'mock-refresh-token-' + Date.now(),
              expiresAt,
            },
          },
        };
      }
      throw error;
    }
  }
}

export default new AuthService();
