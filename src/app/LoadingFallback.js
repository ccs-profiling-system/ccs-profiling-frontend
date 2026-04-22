import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function LoadingFallback() {
    return (_jsxs("div", { style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#f9fafb'
        }, children: [_jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: {
                            width: '48px',
                            height: '48px',
                            border: '4px solid #ea580c',
                            borderTopColor: 'transparent',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 16px'
                        } }), _jsx("p", { style: { color: '#6b7280', fontSize: '14px' }, children: "Loading..." })] }), _jsx("style", { children: `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      ` })] }));
}
