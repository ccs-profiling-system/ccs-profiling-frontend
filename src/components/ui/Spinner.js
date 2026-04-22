import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Spinner({ size = 'md', color = 'primary', text }) {
    const sizeClasses = {
        sm: 'w-8 h-8 border-2',
        md: 'w-16 h-16 border-4',
        lg: 'w-24 h-24 border-4',
    };
    const colorClasses = {
        primary: 'border-primary border-t-transparent',
        secondary: 'border-secondary border-t-transparent',
        white: 'border-white border-t-transparent',
    };
    return (_jsx("div", { className: "flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: `${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin mx-auto mb-4` }), text && _jsx("p", { className: "text-gray-600", children: text })] }) }));
}
