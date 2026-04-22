import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Search, Menu, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { SearchModal } from '../search/SearchModal';
import { useAuth } from '@/context/AuthContext';
function getInitials(name) {
    return name
        .split(' ')
        .map((part) => part[0] ?? '')
        .slice(0, 2)
        .join('')
        .toUpperCase();
}
export function Navbar({ title = 'Dashboard', onMenuClick }) {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const dropdownRef = useRef(null);
    const handleSearch = () => {
        setSearchOpen(true);
    };
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Keyboard shortcut for search (Cmd+K / Ctrl+K)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setSearchOpen(true);
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);
    const initials = user ? getInitials(user.name ?? user.email) : 'A';
    const displayName = user?.name ?? user?.email ?? '';
    const displayEmail = user?.email ?? '';
    return (_jsxs("header", { className: "bg-white shadow-sm border-b border-gray-200", children: [_jsx("div", { className: "px-4 sm:px-6 lg:px-8 py-4", children: _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { onClick: onMenuClick, className: "lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors", "aria-label": "Toggle menu", type: "button", children: _jsx(Menu, { className: "w-6 h-6 text-gray-700" }) }), _jsx("h2", { className: "text-lg lg:text-xl font-semibold text-gray-900", children: title })] }), _jsx("div", { className: "hidden md:flex flex-1 max-w-md", children: _jsxs("button", { onClick: handleSearch, className: "w-full flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left", children: [_jsx(Search, { className: "w-5 h-5 text-gray-400" }), _jsx("span", { className: "text-gray-500", children: "Search..." }), _jsx("kbd", { className: "ml-auto px-2 py-1 text-xs text-gray-400 bg-white border border-gray-200 rounded", children: "\u2318K" })] }) }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { type: "button", onClick: handleSearch, className: "md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors", children: _jsx(Search, { className: "w-5 h-5 text-gray-600" }) }), _jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsxs("button", { type: "button", onClick: () => setDropdownOpen((prev) => !prev), className: "flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors", "aria-label": "User menu", children: [_jsx("div", { className: "w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0", children: initials }), displayName && (_jsx("span", { className: "hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate", children: displayName })), _jsx(ChevronDown, { className: "w-4 h-4 text-gray-500 hidden sm:block" })] }), dropdownOpen && (_jsxs("div", { className: "absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-scale-in", children: [_jsxs("div", { className: "px-4 py-3 border-b border-gray-100", children: [_jsx("p", { className: "text-sm font-semibold text-gray-900 truncate", children: displayName }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: displayEmail })] }), _jsx("div", { className: "p-1", children: _jsxs("button", { type: "button", onClick: () => {
                                                            setDropdownOpen(false);
                                                            logout();
                                                        }, className: "w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors", children: [_jsx(LogOut, { className: "w-4 h-4" }), "Logout"] }) })] }))] })] })] }) }), _jsx(SearchModal, { isOpen: searchOpen, onClose: () => setSearchOpen(false) })] }));
}
