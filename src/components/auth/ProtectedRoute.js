import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui';
export function ProtectedRoute({ children }) {
    const { isAuthenticated, token } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!isAuthenticated || !token) {
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated, token, navigate]);
    if (!isAuthenticated || !token) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx(Spinner, { size: "lg", text: "Checking authentication..." }) }));
    }
    return _jsx(_Fragment, { children: children });
}
