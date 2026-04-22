import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Users, ClipboardList, FlaskConical, CalendarDays, UserCircle, FolderOpen, } from 'lucide-react';
export function FacultySidebar({ isOpen, onClose }) {
    const navLinks = [
        { to: '/faculty/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/faculty/courses', label: 'My Courses', icon: BookOpen },
        { to: '/faculty/students', label: 'Students', icon: Users },
        { to: '/faculty/attendance', label: 'Attendance', icon: ClipboardList },
        { to: '/faculty/research', label: 'Research', icon: FlaskConical },
        { to: '/faculty/events', label: 'Events', icon: CalendarDays },
        { to: '/faculty/profile', label: 'Profile', icon: UserCircle },
        { to: '/faculty/materials', label: 'Materials', icon: FolderOpen },
    ];
    return (_jsxs(_Fragment, { children: [isOpen && (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in", onClick: onClose })), _jsxs("aside", { className: `
          fixed lg:static inset-y-0 left-0 z-50
          w-56 sm:w-64 bg-primary text-white shadow-2xl flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `, children: [_jsx("div", { className: "p-4 sm:p-6 border-b border-orange-900/30 bg-gradient-to-br from-orange-600 to-orange-700", children: _jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [_jsx("div", { className: "w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30", children: _jsx(BookOpen, { className: "w-5 h-5 sm:w-6 sm:h-6 text-white" }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("h1", { className: "text-base sm:text-lg font-bold tracking-tight truncate", children: "CCS Faculty" }), _jsx("p", { className: "text-xs text-white/70 truncate", children: "Portal" })] })] }) }), _jsx("nav", { className: "flex-1 p-4 overflow-y-auto scrollbar-hide", children: _jsx("ul", { className: "space-y-2", children: navLinks.map((link) => (_jsx("li", { children: _jsxs(NavLink, { to: link.to, onClick: onClose, className: ({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isActive
                                        ? 'bg-white/20 text-white font-semibold shadow-sm'
                                        : 'text-white/80 hover:text-white hover:bg-orange-500/20'}`, children: [_jsx(link.icon, { className: "w-5 h-5 flex-shrink-0" }), _jsx("span", { className: "font-medium text-sm", children: link.label })] }) }, link.to))) }) }), _jsxs("div", { className: "p-3 sm:p-4 border-t border-orange-900/30 bg-gradient-to-t from-orange-700/20 to-transparent", children: [_jsxs("div", { className: "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors", children: [_jsx("div", { className: "w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 flex-shrink-0", children: _jsx("svg", { className: "w-3 h-3 sm:w-4 sm:h-4 text-white", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z", clipRule: "evenodd" }) }) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs sm:text-sm font-semibold text-white truncate", children: "Faculty" }), _jsx("p", { className: "text-xs text-white/60 truncate", children: "Portal User" })] })] }), _jsx("p", { className: "text-xs text-white/50 text-center mt-3 sm:mt-4 font-medium", children: "\u00A9 2026 CCS" })] })] })] }));
}
