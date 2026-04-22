import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui';
export function FacultyProtectedRoute({ children }) {
    const navigate = useNavigate();
    const token = localStorage.getItem('facultyToken');
    useEffect(() => {
        if (!token) {
            navigate('/faculty/login', { replace: true });
        }
    }, [token, navigate]);
    if (!token) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx(Spinner, { size: "lg", text: "Checking authentication..." }) }));
    }
    return _jsx(_Fragment, { children: children });
}
