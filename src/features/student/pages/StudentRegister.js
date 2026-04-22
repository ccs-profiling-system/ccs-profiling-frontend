import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/api/authService';
import { BookOpen } from 'lucide-react';
const PROGRAMS = [
    'BS Computer Science',
    'BS Information Technology',
    'BS Information Systems',
    'Associate in Computer Technology',
];
export function StudentRegister() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [form, setForm] = useState({
        name: '',
        email: '',
        studentId: '',
        program: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
    const validate = () => {
        if (!form.name.trim())
            return 'Full name is required';
        if (!form.email.trim())
            return 'Email is required';
        if (!form.studentId.trim())
            return 'Student ID is required';
        if (!form.program)
            return 'Please select a program';
        if (form.password.length < 8)
            return 'Password must be at least 8 characters';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
            return 'Password must contain uppercase, lowercase, and a number';
        if (form.password !== form.confirmPassword)
            return 'Passwords do not match';
        return null;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) {
            setError(err);
            return;
        }
        setError(null);
        setLoading(true);
        try {
            const response = await authService.register({
                name: form.name,
                email: form.email,
                password: form.password,
                role: 'student',
                studentId: form.studentId,
                program: form.program,
            });
            login(response);
            localStorage.setItem('studentToken', response.tokens.access.token);
            setTimeout(() => navigate('/student/profile', { replace: true }), 0);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen flex relative", children: [_jsx("div", { className: "absolute inset-0 bg-cover bg-center", style: { backgroundImage: "url('/campus.jpg')" } }), _jsx("div", { className: "absolute inset-0", style: { background: 'linear-gradient(135deg, rgba(59,130,246,0.85) 0%, rgba(37,99,235,0.75) 100%)' } }), _jsxs("div", { className: "relative z-10 hidden md:flex flex-1 flex-col justify-between p-12", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx(BookOpen, { className: "w-8 h-8 text-white" }), _jsx("h1", { className: "text-white text-2xl font-bold", children: "CCS Profiling" })] }), _jsx("p", { className: "text-white/80 text-sm", children: "Student Portal" })] }), _jsx("p", { className: "text-white/60 text-sm", children: "\u00A9 2026 CCS System" })] }), _jsx("div", { className: "relative z-10 w-full md:w-[30rem] bg-white flex items-center justify-center p-6 sm:p-10 overflow-y-auto", children: _jsxs("div", { className: "w-full max-w-sm md:max-w-none py-4", children: [_jsx("div", { className: "flex items-center gap-3 mb-6 md:hidden", children: _jsx(BookOpen, { className: "w-7 h-7 text-blue-600" }) }), _jsx("h2", { className: "text-xl font-bold text-gray-900 mb-1", children: "Create Student Account" }), _jsx("p", { className: "text-gray-500 text-sm mb-6", children: "Register to access the student portal" }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700 mb-1", children: "Full Name" }), _jsx("input", { id: "name", type: "text", value: form.name, onChange: set('name'), placeholder: "Juan dela Cruz", required: true, autoComplete: "name", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "studentId", className: "block text-sm font-medium text-gray-700 mb-1", children: "Student ID" }), _jsx("input", { id: "studentId", type: "text", value: form.studentId, onChange: set('studentId'), placeholder: "e.g. 2024-00001", required: true, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "Email Address" }), _jsx("input", { id: "email", type: "email", value: form.email, onChange: set('email'), placeholder: "student@ccs.edu.ph", required: true, autoComplete: "email", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "program", className: "block text-sm font-medium text-gray-700 mb-1", children: "Program" }), _jsxs("select", { id: "program", value: form.program, onChange: set('program'), required: true, className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white", children: [_jsx("option", { value: "", children: "Select your program" }), PROGRAMS.map((p) => _jsx("option", { value: p, children: p }, p))] })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1", children: "Password" }), _jsx("input", { id: "password", type: "password", value: form.password, onChange: set('password'), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, autoComplete: "new-password", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Min 8 chars, uppercase, lowercase, and number" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirmPassword", className: "block text-sm font-medium text-gray-700 mb-1", children: "Confirm Password" }), _jsx("input", { id: "confirmPassword", type: "password", value: form.confirmPassword, onChange: set('confirmPassword'), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", required: true, autoComplete: "new-password", className: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base" })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg", children: error })), _jsx("button", { type: "submit", disabled: loading, className: "w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2", children: loading ? (_jsxs(_Fragment, { children: [_jsx("span", { className: "w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" }), "Creating account\u2026"] })) : 'Create Account' }), _jsxs("p", { className: "text-center text-sm text-gray-600 mt-4", children: ["Already have an account?", ' ', _jsx(Link, { to: "/student/login", className: "text-blue-600 hover:text-blue-700 font-medium", children: "Sign in" })] })] })] }) })] }));
}
