import { axiosInstance } from './axios.config';
import type { AuthResponse, LoginRequest, RefreshTokenRequest, RegisterRequest } from '../types/auth.types';

export const authApi = {
  // User login - matches POST /auth/login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },

  // User registration - matches POST /auth/create
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/create', userData);
    return response.data;
  },

  // Refresh JWT token - matches POST /auth/refresh-token
  refreshToken: async (request: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post('/auth/refresh-token', request);
    return response.data;
  },

  // User logout - matches GET /auth/logout
  logout: async (): Promise<string> => {
    const response = await axiosInstance.get('/auth/logout');
    return response.data;
  },

  // Delete user account - matches DELETE /auth/delete
  deleteAccount: async (email: string): Promise<string> => {
    const response = await axiosInstance.delete(`/auth/delete?email=${email}`);
    return response.data;
  },
};