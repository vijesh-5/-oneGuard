import { LoginRequest, Token } from '../types/auth';
// import api from './api'; // We will uncomment this when the backend is ready

const MOCK_TOKEN: Token = {
    access_token: "fake-jwt-token-123",
    token_type: "bearer"
};

const AuthService = {
    login: async (credentials: LoginRequest): Promise<Token> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Mock Validation
        if (credentials.username && credentials.password) {
            return MOCK_TOKEN;
        }
        throw new Error("Invalid credentials");

        // REAL IMPLEMENTATION (Future):
        // const response = await api.post<Token>('/login', credentials);
        // return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    }
};

export default AuthService;
