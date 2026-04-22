import { jsx as _jsx } from "react/jsx-runtime";
import { AuthProvider } from '@/context/AuthContext';
export function AppProviders({ children }) {
    return _jsx(AuthProvider, { children: children });
}
