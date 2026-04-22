import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/api/authService';
import { BookOpen } from 'lucide-react';
export function StudentLogin() {
    const navigate = useNavigate();
    const { isAuthenticated, login } = useAuth();
    const [studentNumber, setStudentNumber] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Redirect already-authenticated users
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/student/profile', { replace: true });
        }
    }, [isAuthenticated, navigate]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const response = await authService.login({ email: studentNumber, password, role: 'student' });
            // Role is already 'student' from the service call
            login(response);
            // Store student token separately for backward compatibility
            localStorage.setItem('studentToken', response.tokens.access.token);
            setTimeout(() => {
                navigate('/student/profile', { replace: true });
            }, 0);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen flex relative", children: [_jsx("div", { className: "absolute inset-0 bg-cover bg-center", style: { backgroundImage: "url('/campus.jpg')" } }), _jsx("div", { className: "absolute inset-0", style: { background: 'linear-gradient(135deg, rgba(59,130,246,0.85) 0%, rgba(37,99,235,0.75) 100%)' } }), _jsxs("div", { className: "relative z-10 hidden md:flex flex-1 flex-col justify-between p-12", "aria-hidden": "true", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(BookOpen, { className: "w-8 h-8 text-white" }), _jsx("h1", { className: "text-white text-2xl font-bold", children: "CCS Profiling" })] }), _jsx("p", { className: "text-white/80 text-sm", children: "Student Portal" })] }), _jsx("p", { className: "text-white/60 text-sm", children: "\u00A9 2026 CCS System" })] }), _jsx("div", { className: "relative z-10 w-full md:w-[30rem] bg-white flex items-center justify-center p-6 sm:p-10", children: _jsxs("div", { className: "w-full max-w-sm md:max-w-none", children: [_jsx("div", { className: "flex items-center gap-3 mb-6 md:hidden", children: _jsx(BookOpen, { className: "w-7 h-7 text-blue-600" }) }), _jsxs("div", { className: "p-2", children: [_jsx("h2", { className: "text-xl font-bold text-gray-900 mb-1", children: "Welcome, Student" }), _jsx("p", { className: "text-gray-500 text-sm mb-6", children: "Sign in to your student account" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "studentNumber", className: "block text-sm font-medium text-gray-700 mb-1", children: "Student Number" }), _jsx("input", { id: "studentNumber", type: "text", value: studentNumber, onChange: (e) => setStudentNumber(e.target.value), placeholder: "e.g. 2201671", required: true, autoComplete: "username", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }), _jsx("input", { id: "password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, autoComplete: "current-password", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("label", { className: "flex items-center gap-2 cursor-pointer", children: [_jsx("input", { type: "checkbox", className: "w-4 h-4 accent-blue-500" }), _jsx("span", { className: "text-sm text-gray-600", children: "Remember me" })] }), _jsx("a", { href: "#", className: "text-sm text-blue-600 hover:text-blue-700 font-medium", children: "Forgot password?" })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg", children: error })), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2", children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), "Signing in\u2026"] })) : ('Sign In') }), _jsxs("div", { className: "text-center text-sm text-gray-600 mt-6", children: ["Not a student?", ' ', _jsx("a", { href: "/login", className: "text-blue-600 hover:text-blue-700 font-medium", children: "Admin Login" })] }), _jsxs("div", { className: "text-center text-sm text-gray-600", children: ["Don't have an account?", ' ', _jsx("a", { href: "/student/register", className: "text-blue-600 hover:text-blue-700 font-medium", children: "Register" })] })] })] })] }) })] }));
}
