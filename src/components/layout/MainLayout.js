import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
export function MainLayout({ children, title, variant = 'admin' }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
    const closeSidebar = () => setSidebarOpen(false);
    return (_jsxs("div", { className: "flex h-screen bg-gray-50", children: [_jsx(Sidebar, { isOpen: sidebarOpen, onClose: closeSidebar, variant: variant }), _jsxs("div", { className: "flex-1 flex flex-col overflow-hidden w-full lg:w-auto", children: [_jsx(Navbar, { title: title, onMenuClick: toggleSidebar }), _jsx("main", { className: "flex-1 overflow-y-auto", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8", children: children }) })] })] }));
}
