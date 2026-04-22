import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
import { AlertCircle } from 'lucide-react';
export class EventsErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('EventsPage Error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-8 max-w-md w-full", children: [_jsx("div", { className: "flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4", children: _jsx(AlertCircle, { className: "w-6 h-6 text-red-600" }) }), _jsx("h1", { className: "text-2xl font-bold text-gray-900 text-center mb-2", children: "Error Loading Events" }), _jsx("p", { className: "text-gray-600 text-center mb-4", children: "Something went wrong while loading the events page." }), _jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4 mb-6", children: _jsx("p", { className: "text-sm text-red-700 font-mono break-words", children: this.state.error?.message || 'Unknown error' }) }), _jsx("button", { onClick: () => window.location.reload(), className: "w-full bg-primary hover:bg-primary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors", children: "Reload Page" })] }) }));
        }
        return this.props.children;
    }
}
