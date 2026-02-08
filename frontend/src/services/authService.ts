import { LoginRequest, Token, UserCreate } from '../types/auth';
import api from './api';

const TOKEN_KEY = 'access_token';

const AuthService = {
    login: async (credentials: LoginRequest): Promise<Token> => {
        const form_data = new URLSearchParams();
        form_data.append('username', credentials.username);
        form_data.append('password', credentials.password);

        const response = await api.post<Token>('/auth/token', form_data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        AuthService.setToken(response.data.access_token);
        return response.data;
    },

    signup: async (username: string, email: string, password: string): Promise<any> => {
        const newUser: UserCreate = { username, email, password };
        const response = await api.post('/auth/signup', newUser);
        return response.data;
    },

    logout: () => {
        AuthService.removeToken();
    },

    getToken: (): string | null => {
        return localStorage.getItem(TOKEN_KEY);
    },

    setToken: (token: string) => {
        localStorage.setItem(TOKEN_KEY, token);
    },

    removeToken: () => {
        localStorage.removeItem(TOKEN_KEY);
    },

    isAuthenticated: (): boolean => {
        return !!AuthService.getToken();
    }
};

export default AuthService;

