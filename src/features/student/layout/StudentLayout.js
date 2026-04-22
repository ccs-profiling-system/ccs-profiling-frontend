import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { StudentSidebar } from './StudentSidebar';
import { StudentNavbar } from './StudentNavbar';
export function StudentLayout({ children, title }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen((prev) => !prev);
    const closeSidebar = () => setSidebarOpen(false);
    // Prevent body scroll when mobile sidebar is open
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [sidebarOpen]);
    return (_jsxs("div", { className: "flex h-screen bg-gray-50", children: [_jsx(StudentSidebar, { isOpen: sidebarOpen, onClose: closeSidebar }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden min-w-0", children: [_jsx(StudentNavbar, { title: title, onMenuClick: toggleSidebar }), _jsx("main", { className: "flex-1 overflow-y-auto", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8", children: children }) })] })] }));
}
