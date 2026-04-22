import { jsx as _jsx } from "react/jsx-runtime";
import { AppProviders } from './providers';
import { AppRoutes } from './routes';
import { Suspense } from 'react';
import { LoadingFallback } from './LoadingFallback';
function App() {
    return (_jsx(AppProviders, { children: _jsx(Suspense, { fallback: _jsx(LoadingFallback, {}), children: _jsx(AppRoutes, {}) }) }));
}
export default App;
