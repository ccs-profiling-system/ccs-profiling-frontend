import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function Card({ children, className = '', title, accent = false, hover = true }) {
    return (_jsxs("div", { className: `
        bg-white rounded-xl border border-gray-200 transition-all duration-200
        ${accent ? 'border-l-4 border-l-primary' : ''}
        ${hover ? 'hover:shadow-md hover:-translate-y-1' : 'shadow-sm'}
        ${className}
      `, children: [title && (_jsx("div", { className: "px-6 py-4 border-b border-gray-100", children: _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: title }) })), _jsx("div", { className: title ? 'p-6' : 'p-6', children: children })] }));
}
