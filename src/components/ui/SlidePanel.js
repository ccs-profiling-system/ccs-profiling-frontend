import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { X } from 'lucide-react';
import { useEffect } from 'react';
export function SlidePanel({ isOpen, onClose, title, children, size = 'md' }) {
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-2xl',
        lg: 'max-w-4xl',
    };
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);
    if (!isOpen)
        return null;
    return (_jsxs(_Fragment, { children: [_jsx("div", { className: "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 animate-fade-in", onClick: onClose }), _jsxs("div", { className: `fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out animate-slide-in-right ${isOpen ? 'translate-x-0' : 'translate-x-full'} ${sizeClasses[size]} w-full`, children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50", children: [_jsx("h2", { className: "text-xl font-bold text-gray-800", children: title }), _jsx("button", { onClick: onClose, className: "p-2 hover:bg-gray-200 rounded-lg transition", "aria-label": "Close panel", children: _jsx(X, { className: "w-5 h-5 text-gray-600" }) })] }), _jsx("div", { className: "overflow-y-auto h-[calc(100%-80px)] p-6", children: children })] })] }));
}
