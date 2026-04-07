export interface AuthUser {
  id: string;
  email: string;
  role: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expiresAt: string;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: {
    access: AuthToken;
    refresh: AuthToken;
  };
}
