import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AppProviders } from './providers';
import { AppRoutes } from './routes';
function App() {
    return (_jsxs(AppProviders, { children: [_jsxs("div", { className: "hidden", children: [_jsx("button", { className: "bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded", children: "Primary Button" }), _jsx("span", { className: "text-secondary", children: "Secondary Text" })] }), _jsx(AppRoutes, {})] }));
}
export default App;
