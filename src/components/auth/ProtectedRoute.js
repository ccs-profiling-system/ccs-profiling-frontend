import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui';
/**
 * Guards admin routes. Requires an authenticated user with role === 'admin'.
 * - Unauthenticated users → /login
 * - Authenticated students → /student/profile
 */
export function ProtectedRoute({ children }) {
    const { isAuthenticated, token, role } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!isAuthenticated || !token) {
            navigate('/login', { replace: true });
        }
        else if (role === 'student') {
            navigate('/student/profile', { replace: true });
        }
    }, [isAuthenticated, token, role, navigate]);
    if (!isAuthenticated || !token || role === 'student') {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx(Spinner, { size: "lg", text: "Checking authentication..." }) }));
    }
    return _jsx(_Fragment, { children: children });
}
