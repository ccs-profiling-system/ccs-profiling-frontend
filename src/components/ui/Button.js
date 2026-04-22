import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
export const Button = forwardRef(({ children, variant = 'primary', size = 'md', loading = false, disabled = false, icon, iconPosition = 'left', fullWidth = false, className = '', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantStyles = {
        primary: 'bg-primary hover:bg-primary-dark text-white focus:ring-primary shadow-sm hover:shadow-md',
        secondary: 'bg-secondary hover:bg-red-600 text-white focus:ring-secondary shadow-sm hover:shadow-md',
        outline: 'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-primary',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
    };
    const sizeStyles = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-2.5 text-base',
    };
    const widthStyles = fullWidth ? 'w-full' : '';
    const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;
    const renderIcon = () => {
        if (loading) {
            return _jsx(Loader2, { className: "w-4 h-4 animate-spin" });
        }
        return icon;
    };
    return (_jsxs("button", { ref: ref, className: combinedClassName, disabled: disabled || loading, ...props, children: [iconPosition === 'left' && renderIcon(), children, iconPosition === 'right' && !loading && renderIcon()] }));
});
Button.displayName = 'Button';
