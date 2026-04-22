import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from 'react';
export class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs("div", { style: {
                    padding: '40px',
                    textAlign: 'center',
                    fontFamily: 'system-ui, sans-serif',
                    maxWidth: '600px',
                    margin: '100px auto'
                }, children: [_jsx("h1", { style: { color: '#dc2626', marginBottom: '16px' }, children: "Something went wrong" }), _jsx("p", { style: { color: '#6b7280', marginBottom: '24px' }, children: "The application encountered an error. Please refresh the page or contact support if the problem persists." }), _jsxs("details", { style: {
                            textAlign: 'left',
                            background: '#f3f4f6',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '24px'
                        }, children: [_jsx("summary", { style: { cursor: 'pointer', fontWeight: 600, marginBottom: '8px' }, children: "Error Details" }), _jsxs("pre", { style: {
                                    fontSize: '12px',
                                    overflow: 'auto',
                                    color: '#dc2626'
                                }, children: [this.state.error?.toString(), '\n\n', this.state.error?.stack] })] }), _jsx("button", { onClick: () => window.location.reload(), style: {
                            background: '#ea580c',
                            color: 'white',
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            fontWeight: 600
                        }, children: "Reload Page" })] }));
        }
        return this.props.children;
    }
}
