import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from '@/features/admin/dashboard';
import { Login } from '@/features/auth/Login';
import { EventsPage } from '@/features/admin/events';
import { EventsErrorBoundary } from '@/features/admin/events/EventsErrorBoundary';
import { Students } from '@/features/admin/students';
import { Faculty } from '@/features/admin/faculty';
import { Reports } from '@/features/admin/reports';
import { Instructions } from '@/features/admin/instructions';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SchedulingPage } from '@/features/admin/scheduling';
import { ResearchPage, ResearchDetailPage } from '@/features/admin/research';
export function AppRoutes() {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/admin/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(AdminDashboard, {}) }) }), _jsx(Route, { path: "/admin/students", element: _jsx(ProtectedRoute, { children: _jsx(Students, {}) }) }), _jsx(Route, { path: "/admin/faculty", element: _jsx(ProtectedRoute, { children: _jsx(Faculty, {}) }) }), _jsx(Route, { path: "/admin/reports", element: _jsx(ProtectedRoute, { children: _jsx(Reports, {}) }) }), _jsx(Route, { path: "/admin/instructions", element: _jsx(ProtectedRoute, { children: _jsx(Instructions, {}) }) }), _jsx(Route, { path: "/admin/events", element: _jsx(ProtectedRoute, { children: _jsx(EventsErrorBoundary, { children: _jsx(EventsPage, {}) }) }) }), _jsx(Route, { path: "/admin/scheduling", element: _jsx(ProtectedRoute, { children: _jsx(SchedulingPage, {}) }) }), _jsx(Route, { path: "/admin/research", element: _jsx(ProtectedRoute, { children: _jsx(ResearchPage, {}) }) }), _jsx(Route, { path: "/admin/research/:id", element: _jsx(ProtectedRoute, { children: _jsx(ResearchDetailPage, {}) }) }), _jsx(Route, { path: "/admin", element: _jsx(Navigate, { to: "/admin/dashboard", replace: true }) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/admin/dashboard", replace: true }) })] }) }));
}
