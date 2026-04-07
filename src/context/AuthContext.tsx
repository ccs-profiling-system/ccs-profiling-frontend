import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { setLogoutCallback } from '@/services/api/authCallbacks';
import type { AuthUser, LoginResponse } from '@/types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  role: string | null;
  isAuthenticated: boolean;
  login: (response: LoginResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('auth_user');
    if (stored) {
      try { return JSON.parse(stored) as AuthUser; } catch { return null; }
    }
    return null;
  });

  const login = (response: LoginResponse): void => {
    const accessToken = response.tokens.access.token;
    localStorage.setItem('auth_token', accessToken);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    // store refresh token for later use
    localStorage.setItem('auth_refresh_token', response.tokens.refresh.token);
    setToken(accessToken);
    setUser(response.user);
  };

  const logout = (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_refresh_token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    setLogoutCallback(logout);
  }, []);

  const value: AuthContextValue = {
    user,
    token,
    role: user?.role ?? null,
    isAuthenticated: token !== null && user !== null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider.');
  return ctx;
}
