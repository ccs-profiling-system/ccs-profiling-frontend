import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Spinner } from './Spinner';
export function LoadingState({ text = 'Loading...' }) {
    return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx(Spinner, { size: "lg", text: text }) }));
}
export function ErrorState({ message = 'Something went wrong. Please try again.', onRetry, }) {
    return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertCircle, { className: "w-12 h-12 text-red-400 mx-auto mb-4" }), _jsx("p", { className: "text-gray-700 font-medium mb-2", children: "Unable to load data" }), _jsx("p", { className: "text-gray-500 text-sm mb-4", children: message }), onRetry && (_jsxs("button", { onClick: onRetry, className: "inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors text-sm", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), "Try Again"] }))] }) }));
}
export function EmptyState({ icon, title, description, action }) {
    return (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "flex justify-center mb-4 text-gray-300", children: icon }), _jsx("p", { className: "text-gray-700 font-medium mb-1", children: title }), description && _jsx("p", { className: "text-gray-500 text-sm mb-4", children: description }), action && _jsx("div", { className: "mt-4", children: action })] }));
}
