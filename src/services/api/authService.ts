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
        const msg = (error.response?.data as { message?: string })?.message ?? 'Network error — please check your connection';
        throw new Error(msg);
      }
      throw error;
    }
  }
}

export default new AuthService();
