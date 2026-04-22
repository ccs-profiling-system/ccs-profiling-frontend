import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { UserRound, CalendarDays, BookOpen, Users, Beaker, GraduationCap, } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
function getInitials(name) {
    return name
        .split(' ')
        .map((part) => part[0] ?? '')
        .slice(0, 2)
        .join('')
        .toUpperCase();
}
export function StudentSidebar({ isOpen, onClose }) {
    const { user } = useAuth();
    const displayName = user?.name ?? user?.email ?? 'Student';
    const displayEmail = user?.email ?? '';
    const initials = getInitials(displayName);
    const navLinks = [
        { to: '/student/profile', label: 'My Profile', icon: UserRound },
        { to: '/student/schedule', label: 'Schedule', icon: CalendarDays },
        { to: '/student/requirements', label: 'Academic Requirements', icon: BookOpen },
        { to: '/student/participation', label: 'Participation', icon: Users },
        { to: '/student/research', label: 'Research', icon: Beaker },
    ];
    return (_jsxs(_Fragment, { children: [isOpen && (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in", onClick: onClose })), _jsxs("aside", { className: `
          fixed lg:static inset-y-0 left-0 z-50
          w-56 sm:w-64 bg-primary text-white shadow-2xl flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `, children: [_jsx("div", { className: "p-4 sm:p-6 border-b border-primary-dark/30 bg-gradient-to-br from-primary to-primary-dark", children: _jsxs("div", { className: "flex items-center gap-2 sm:gap-3", children: [_jsx("div", { className: "w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30", children: _jsx(GraduationCap, { className: "w-5 h-5 sm:w-6 sm:h-6 text-white" }) }), _jsxs("div", { className: "min-w-0", children: [_jsx("h1", { className: "text-base sm:text-lg font-bold tracking-tight truncate", children: "CCS Student" }), _jsx("p", { className: "text-xs text-white/70 truncate", children: "Portal" })] })] }) }), _jsx("nav", { className: "flex-1 p-4 overflow-y-auto scrollbar-hide", children: _jsx("ul", { className: "space-y-2", children: navLinks.map((link) => (_jsx("li", { children: _jsxs(NavLink, { to: link.to, onClick: onClose, className: ({ isActive }) => `sidebar-nav-item flex items-center gap-3 transition-all duration-200 min-h-[44px] ${isActive
                                        ? 'sidebar-nav-item-active'
                                        : 'text-white/80 hover:text-white hover:bg-white/10'}`, children: [_jsx(link.icon, { className: "w-5 h-5 flex-shrink-0" }), _jsx("span", { className: "font-medium text-sm", children: link.label })] }) }, link.to))) }) }), _jsxs("div", { className: "p-3 sm:p-4 border-t border-primary-dark/30 bg-gradient-to-t from-primary-dark/20 to-transparent", children: [_jsxs("div", { className: "flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors", children: [_jsx("div", { className: "w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/20 flex items-center justify-center border border-white/30 flex-shrink-0 text-white font-semibold text-xs", children: initials }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "text-xs sm:text-sm font-semibold text-white truncate", children: displayName }), _jsx("p", { className: "text-xs text-white/60 truncate", children: displayEmail || 'Student Portal' })] })] }), _jsx("p", { className: "text-xs text-white/50 text-center mt-3 sm:mt-4 font-medium", children: "\u00A9 2026 CCS" })] })] })] }));
}
