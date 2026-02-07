export interface User {
  id: number;
  email: string;
  full_name?: string;
}

export interface LoginRequest {
  username: string; // OAuth2 password flow usually expects 'username' even if it's an email
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}
