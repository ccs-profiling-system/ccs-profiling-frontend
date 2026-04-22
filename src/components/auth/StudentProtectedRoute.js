import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui';
/**
 * Guards student routes. Requires an authenticated user with role === 'student'.
 * - Unauthenticated users → /student/login
 * - Authenticated admins → /admin/dashboard
 */
export function StudentProtectedRoute({ children }) {
    const { isAuthenticated, token, role } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!isAuthenticated || !token) {
            navigate('/student/login', { replace: true });
        }
        else if (role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAuthenticated, token, role, navigate]);
    if (!isAuthenticated || !token || role === 'admin') {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx(Spinner, { size: "lg", text: "Checking authentication..." }) }));
    }
    return _jsx(_Fragment, { children: children });
}
