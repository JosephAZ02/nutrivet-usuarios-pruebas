
import type { AuthResponse, LoginRequest, RecoverPasswordRequest } from '../interfaces/Auth';
import api from './Api';

export const AuthService = {

    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');

    },


    recoverPassword: async (data: RecoverPasswordRequest): Promise<string> => {
        const response = await api.post('/auth/recover-password', data);
        return response.data;
    },
};