import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { X } from 'lucide-react';
import { useEffect } from 'react';
export function Modal({ isOpen, onClose, title, children, size = 'md', footer, showCloseButton = true, closeOnBackdropClick = true, closeOnEscape = true, className = '' }) {
    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-7xl mx-4',
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
    useEffect(() => {
        if (!isOpen || !closeOnEscape)
            return;
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeOnEscape, onClose]);
    if (!isOpen)
        return null;
    const handleBackdropClick = () => {
        if (closeOnBackdropClick) {
            onClose();
        }
    };
    return (_jsxs("div", { className: "fixed inset-0 z-[60] overflow-y-auto", children: [_jsx("div", { className: "fixed inset-0 bg-black/50 transition-opacity duration-200 animate-fade-in", onClick: handleBackdropClick }), _jsx("div", { className: "flex min-h-full items-center justify-center p-4", children: _jsxs("div", { className: `relative bg-white rounded-xl shadow-lg w-full ${sizeClasses[size]} transform transition-all duration-200 animate-scale-in ${className}`, onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "flex items-center justify-between p-6 border-b border-gray-100", children: [_jsx("h3", { className: "text-xl font-semibold text-gray-900", children: title }), showCloseButton && (_jsx("button", { onClick: onClose, className: "text-gray-400 hover:text-gray-600 transition p-1.5 hover:bg-gray-100 rounded-lg", "aria-label": "Close modal", children: _jsx(X, { className: "w-5 h-5" }) }))] }), _jsx("div", { className: "p-6", children: children }), footer && (_jsx("div", { className: "flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl", children: footer }))] }) })] }));
}
