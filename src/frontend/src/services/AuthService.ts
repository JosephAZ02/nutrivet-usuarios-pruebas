
import type { AuthResponse, LoginRequest } from '../interfaces/Auth';
import api from './Api';

export const AuthService = {

  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
    // redirigir al login 
  }
};