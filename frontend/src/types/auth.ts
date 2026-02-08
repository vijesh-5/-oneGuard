export interface User {
  email: string;
  id: number;
  is_active: boolean;
  mode: 'business' | 'personal' | 'client';
}

export interface LoginRequest {
  username: string; // This will map to email in our case
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginResponse extends Token {
  message?: string;
}
