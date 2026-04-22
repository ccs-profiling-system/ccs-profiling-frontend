import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Badge({ children, variant = 'gray', size = 'md', dot = false, icon, className = '', ...props }) {
    const baseStyles = 'inline-flex items-center gap-1.5 font-medium rounded-full';
    const variantStyles = {
        primary: 'bg-primary/10 text-primary',
        secondary: 'bg-secondary/10 text-secondary',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        info: 'bg-blue-100 text-blue-800',
        gray: 'bg-gray-100 text-gray-800',
    };
    const sizeStyles = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
    };
    const dotColors = {
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        success: 'bg-green-600',
        warning: 'bg-yellow-600',
        info: 'bg-blue-600',
        gray: 'bg-gray-600',
    };
    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
    return (_jsxs("span", { className: combinedClassName, ...props, children: [dot && _jsx("span", { className: `w-2 h-2 rounded-full ${dotColors[variant]}` }), icon && _jsx("span", { className: "flex-shrink-0", children: icon }), children] }));
}
