import { LoginRequest, RegisterRequest, Token, User } from '../types/auth'; // Ensure types
import api from './api';

const AuthService = {
    login: async (credentials: LoginRequest): Promise<Token> => {
        // Use URLSearchParams for OAuth2PasswordRequestForm
        const formData = new URLSearchParams();
        formData.append('username', credentials.username);
        formData.append('password', credentials.password);

        const response = await api.post<Token>('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data;
    },

    register: async (data: RegisterRequest): Promise<User> => {
        const response = await api.post<User>('/auth/register', data);
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    updateMode: async (mode: 'business' | 'personal' | 'client'): Promise<User> => {
        const response = await api.put<User>('/users/me/mode', { mode });
        return response.data;
    },

    getMe: async (): Promise<User> => {
        const response = await api.get<User>('/users/me');
        return response.data;
    }
};

export default AuthService;
