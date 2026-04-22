import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Menu, LogOut, ChevronDown, UserRound } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFacultyAuth } from '@/features/faculty/hooks/useFacultyAuth';
function getInitials(name) {
    return name
        .split(' ')
        .map((part) => part[0] ?? '')
        .slice(0, 2)
        .join('')
        .toUpperCase();
}
export function FacultyNavbar({ title, onMenuClick }) {
    const navigate = useNavigate();
    const { faculty, logout } = useFacultyAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const handleLogout = () => {
        setDropdownOpen(false);
        logout();
    };
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const displayName = faculty ? `${faculty.firstName} ${faculty.lastName}` : 'Faculty';
    const displayEmail = faculty?.email ?? '';
    const initials = faculty ? getInitials(displayName) : 'F';
    return (_jsx("nav", { className: "bg-white border-b border-gray-200 shadow-sm", children: _jsx("div", { className: "px-4 sm:px-6 lg:px-8 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: onMenuClick, className: "lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors", "aria-label": "Toggle menu", type: "button", children: _jsx(Menu, { className: "w-6 h-6 text-gray-700" }) }), title && (_jsx("h2", { className: "text-lg lg:text-xl font-semibold text-gray-900", children: title }))] }), _jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsxs("button", { type: "button", onClick: () => setDropdownOpen((prev) => !prev), className: "flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors", "aria-label": "User menu", children: [_jsx("div", { className: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0", children: initials }), _jsx("span", { className: "hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate", children: displayName }), _jsx(ChevronDown, { className: "w-4 h-4 text-gray-500 hidden sm:block" })] }), dropdownOpen && (_jsxs("div", { className: "absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50", children: [_jsxs("div", { className: "px-4 py-3 border-b border-gray-100", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900 truncate", children: displayName }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: displayEmail })] }), _jsxs("div", { className: "p-1", children: [_jsxs("button", { type: "button", onClick: () => {
                                                    setDropdownOpen(false);
                                                    navigate('/faculty/profile');
                                                }, className: "w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors", children: [_jsx(UserRound, { className: "w-4 h-4" }), "My Profile"] }), _jsxs("button", { type: "button", onClick: handleLogout, className: "w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors", "aria-label": "Logout", children: [_jsx(LogOut, { className: "w-4 h-4" }), "Logout"] })] })] }))] })] }) }) }));
}
