import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/api/authService';
export function Login() {
    const navigate = useNavigate();
    const { isAuthenticated, login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Redirect already-authenticated users based on role
    useEffect(() => {
        if (isAuthenticated) {
            const userRole = localStorage.getItem('userRole');
            if (userRole === 'chair') {
                navigate('/chair/dashboard', { replace: true });
            }
            else {
                navigate('/admin/dashboard', { replace: true });
            }
        }
    }, [isAuthenticated, navigate]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const response = await authService.login({ email, password });
            login(response);
            // Store user role and department info
            const userRole = response.user?.role || 'admin';
            const departmentId = response.user?.department_id;
            const departmentName = response.user?.department_name;
            localStorage.setItem('userRole', userRole);
            if (departmentId)
                localStorage.setItem('departmentId', departmentId);
            if (departmentName)
                localStorage.setItem('departmentName', departmentName);
            // Role-based redirection
            setTimeout(() => {
                if (userRole === 'chair') {
                    navigate('/chair/dashboard', { replace: true });
                }
                else {
                    navigate('/admin/dashboard', { replace: true });
                }
            }, 0);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen flex relative", children: [_jsx("div", { className: "absolute inset-0 bg-cover bg-center", style: { backgroundImage: "url('/campus.jpg')" } }), _jsx("div", { className: "absolute inset-0", style: { background: 'linear-gradient(135deg, rgba(234,88,12,0.85) 0%, rgba(239,68,68,0.75) 100%)' } }), _jsxs("div", { className: "relative z-10 flex-1 flex flex-col justify-between p-12", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-white text-2xl font-bold", children: "CCS Profiling" }), _jsx("p", { className: "text-white/80 text-sm mt-1", children: "Admin Portal" })] }), _jsx("p", { className: "text-white/60 text-sm", children: "\u00A9 2026 CCS System" })] }), _jsx("div", { className: "relative z-10 w-[30rem] bg-white flex items-center justify-center p-10", children: _jsx("div", { className: "w-full", children: _jsxs("div", { className: "p-2", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-1", children: "Welcome back" }), _jsx("p", { className: "text-gray-500 text-sm mb-6", children: "Sign in to your admin account" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email Address" }), _jsx("input", { id: "email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), placeholder: "admin@ccs.edu.ph", required: true, autoComplete: "email" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }), _jsx("input", { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, autoComplete: "current-password" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", className: "w-4 h-4 accent-primary" }), _jsx("span", { className: "text-sm text-gray-600", children: "Remember me" })] }), _jsx("a", { href: "#", className: "text-sm text-primary hover:text-primary-dark font-medium", children: "Forgot password?" })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg", children: error })), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-semibold transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2", children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), "Signing in..."] })) : ('Sign In') }), _jsxs("p", { className: "text-center text-sm text-gray-600 mt-4", children: ["Don't have an account?", ' ', _jsx(Link, { to: "/register", className: "text-primary hover:text-primary-dark font-medium", children: "Create account" })] })] })] }) }) })] }));
}
