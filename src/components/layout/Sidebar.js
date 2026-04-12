import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, GraduationCap, Users, Calendar, FileText, BookOpen, Clock, FlaskConical, } from 'lucide-react';
export function Sidebar({ isOpen, onClose }) {
    const navLinks = [
        { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/students', label: 'Students', icon: GraduationCap },
        { to: '/admin/faculty', label: 'Faculty', icon: Users },
        { to: '/admin/events', label: 'Events', icon: Calendar },
        { to: '/admin/scheduling', label: 'Scheduling', icon: Clock },
        { to: '/admin/research', label: 'Research', icon: FlaskConical },
        { to: '/admin/reports', label: 'Reports', icon: FileText },
        { to: '/admin/instructions', label: 'Instructions', icon: BookOpen },
    ];
    return (_jsxs(_Fragment, { children: [isOpen && (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in", onClick: onClose })), _jsxs("aside", { className: `
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-primary text-white shadow-2xl flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `, children: [_jsx("div", { className: "p-6 border-b border-primary-dark/30", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/20", children: _jsx("svg", { className: "w-6 h-6 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" }) }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-lg font-bold", children: "CCS Profiling" }), _jsx("p", { className: "text-xs text-white/70", children: "Admin Portal" })] })] }) }), _jsx("nav", { className: "flex-1 p-4 overflow-y-auto", children: _jsx("ul", { className: "space-y-1", children: navLinks.map((link) => (_jsx("li", { children: _jsxs(NavLink, { to: link.to, onClick: onClose, className: ({ isActive }) => `sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`, children: [_jsx(link.icon, { className: "w-4 h-4 flex-shrink-0" }), link.label] }) }, link.to))) }) }), _jsxs("div", { className: "p-4 border-t border-primary-dark/30", children: [_jsxs("div", { className: "flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20", children: _jsx("svg", { className: "w-4 h-4 text-white/80", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-white", children: "Admin User" }), _jsx("p", { className: "text-xs text-white/60", children: "Administrator" })] })] }), _jsx("p", { className: "text-xs text-white/50 text-center mt-4", children: "\u00A9 2026 CCS System" })] })] })] }));
}
