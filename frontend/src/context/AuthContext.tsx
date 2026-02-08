import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LoginRequest, RegisterRequest, User } from '../types/auth'; // Ensure these types exist
import AuthService from '../services/authService';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
    toggleMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Validate token on load (optional: fetch user profile)
        if (token) {
            // Decrypt token to get user info or call /me endpoint
            AuthService.getMe()
                .then(user => {
                    setUser(user);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                    // logout(); // Optional: logout if token invalid
                });
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = async (credentials: LoginRequest) => {
        const data = await AuthService.login(credentials);
        setToken(data.access_token);
        localStorage.setItem('token', data.access_token);
        // User will be fetched by effect
    };

    const register = async (data: RegisterRequest) => {
        await AuthService.register(data);
        // Optionally auto-login
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        navigate('/login');
    };

    const toggleMode = async () => {
        if (!user) return;
        const newMode: User['mode'] = user.mode === 'business' ? 'personal' : 'business';
        // Optimize: Optimistic update
        const updatedUser = { ...user, mode: newMode };
        setUser(updatedUser);

        try {
            await AuthService.updateMode(newMode);
        } catch (error) {
            console.error("Failed to update mode", error);
            // Revert on failure?
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            login,
            register,
            logout,
            isAuthenticated: !!token,
            loading,
            toggleMode // Expose toggleMode
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
