import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { setLogoutCallback } from '@/services/api/authCallbacks';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('auth_token'));
    const [user, setUser] = useState(() => {
        const stored = localStorage.getItem('auth_user');
        if (stored) {
            try {
                return JSON.parse(stored);
            }
            catch {
                return null;
            }
        }
        return null;
    });
    const login = (response) => {
        const accessToken = response.tokens.access.token;
        localStorage.setItem('auth_token', accessToken);
        localStorage.setItem('auth_user', JSON.stringify(response.user));
        // store refresh token for later use
        localStorage.setItem('auth_refresh_token', response.tokens.refresh.token);
        setToken(accessToken);
        setUser(response.user);
    };
    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_refresh_token');
        setToken(null);
        setUser(null);
    };
    useEffect(() => {
        setLogoutCallback(logout);
    }, []);
    const value = {
        user,
        token,
        role: user?.role ?? null,
        isAuthenticated: token !== null && user !== null,
        login,
        logout,
    };
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx)
        throw new Error('useAuth must be used within an AuthProvider.');
    return ctx;
}
