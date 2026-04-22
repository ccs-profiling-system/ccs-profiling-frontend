import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from '@/features/admin/dashboard';
import { Login } from '@/features/auth/Login';
import { Register } from '@/features/auth/Register';
import { StudentLogin } from '@/features/student/pages/StudentLogin';
import { EventsPage } from '@/features/admin/events';
import { EventsErrorBoundary } from '@/features/admin/events/EventsErrorBoundary';
import { Students } from '@/features/admin/students';
import { StudentDetailPage } from '@/features/admin/students/StudentDetailPage';
import { Faculty } from '@/features/admin/faculty';
import { Reports } from '@/features/admin/reports';
import { Instructions } from '@/features/admin/instructions';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StudentProtectedRoute } from '@/components/auth/StudentProtectedRoute';
import { FacultyLogin } from '@/features/faculty/pages/FacultyLogin';
import { FacultyProtectedRoute } from '@/components/auth/FacultyProtectedRoute';
import { facultyRoutes } from '@/features/faculty/routes';
// import { SchedulingPage } from '@/features/admin/scheduling'; // Disabled - data type issues
import { ResearchPage, ResearchDetailPage } from '@/features/admin/research';
import { studentRoutes } from '@/features/student/routes';
// Chair Portal Imports
import { ChairDashboard } from '@/features/chair/dashboard';
import { ChairStudents } from '@/features/chair/students';
import { ChairFaculty } from '@/features/chair/faculty';
import { ChairSchedules } from '@/features/chair/schedules';
import { ChairEvents } from '@/features/chair/events';
import { ChairResearch } from '@/features/chair/research';
import { ChairReports } from '@/features/chair/reports';
import { ChairApprovals } from '@/features/chair/approvals';
// Secretary Portal Imports
import { SecretaryDashboard } from '@/features/secretary/dashboard';
import { SecretaryStudents } from '@/features/secretary/students';
import { StudentProfileView } from '@/features/secretary/students/StudentProfileView';
import { SecretaryFaculty } from '@/features/secretary/faculty/index';
import { FacultyProfileView } from '@/features/secretary/faculty/FacultyProfileView';
import { SecretarySchedules } from '@/features/secretary/schedules';
import { SecretaryEvents } from '@/features/secretary/events';
import { SecretaryDocuments } from '@/features/secretary/documents';
import { SecretaryReports } from '@/features/secretary/reports';
import { SecretaryPendingChanges } from '@/features/secretary/pending-changes';
import { SecretaryResearch } from '@/features/secretary/research';
export function AppRoutes() {
    return (_jsx(BrowserRouter, { future: {
            v7_startTransition: true,
            v7_relativeSplatPath: true,
        }, children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/student/login", element: _jsx(StudentLogin, {}) }), _jsx(Route, { path: "/faculty/login", element: _jsx(FacultyLogin, {}) }), _jsx(Route, { path: "/admin/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(AdminDashboard, {}) }) }), _jsx(Route, { path: "/admin/students", element: _jsx(ProtectedRoute, { children: _jsx(Students, {}) }) }), _jsx(Route, { path: "/admin/students/:id", element: _jsx(ProtectedRoute, { children: _jsx(StudentDetailPage, {}) }) }), _jsx(Route, { path: "/admin/faculty", element: _jsx(ProtectedRoute, { children: _jsx(Faculty, {}) }) }), _jsx(Route, { path: "/admin/reports", element: _jsx(ProtectedRoute, { children: _jsx(Reports, {}) }) }), _jsx(Route, { path: "/admin/instructions", element: _jsx(ProtectedRoute, { children: _jsx(Instructions, {}) }) }), _jsx(Route, { path: "/admin/events", element: _jsx(ProtectedRoute, { children: _jsx(EventsErrorBoundary, { children: _jsx(EventsPage, {}) }) }) }), _jsx(Route, { path: "/admin/research", element: _jsx(ProtectedRoute, { children: _jsx(ResearchPage, {}) }) }), _jsx(Route, { path: "/admin/research/:id", element: _jsx(ProtectedRoute, { children: _jsx(ResearchDetailPage, {}) }) }), studentRoutes.map((route) => (_jsx(Route, { path: route.path, element: _jsx(StudentProtectedRoute, { children: route.element }) }, route.path))), facultyRoutes.map((route) => (_jsx(Route, { path: route.path, element: _jsx(FacultyProtectedRoute, { children: route.element }) }, route.path))), _jsx(Route, { path: "/admin", element: _jsx(Navigate, { to: "/admin/dashboard", replace: true }) }), _jsx(Route, { path: "/chair/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(ChairDashboard, {}) }) }), _jsx(Route, { path: "/chair/students", element: _jsx(ProtectedRoute, { children: _jsx(ChairStudents, {}) }) }), _jsx(Route, { path: "/chair/faculty", element: _jsx(ProtectedRoute, { children: _jsx(ChairFaculty, {}) }) }), _jsx(Route, { path: "/chair/schedules", element: _jsx(ProtectedRoute, { children: _jsx(ChairSchedules, {}) }) }), _jsx(Route, { path: "/chair/events", element: _jsx(ProtectedRoute, { children: _jsx(ChairEvents, {}) }) }), _jsx(Route, { path: "/chair/research", element: _jsx(ProtectedRoute, { children: _jsx(ChairResearch, {}) }) }), _jsx(Route, { path: "/chair/reports", element: _jsx(ProtectedRoute, { children: _jsx(ChairReports, {}) }) }), _jsx(Route, { path: "/chair/approvals", element: _jsx(ProtectedRoute, { children: _jsx(ChairApprovals, {}) }) }), _jsx(Route, { path: "/chair", element: _jsx(Navigate, { to: "/chair/dashboard", replace: true }) }), _jsx(Route, { path: "/secretary/dashboard", element: _jsx(SecretaryDashboard, {}) }), _jsx(Route, { path: "/secretary/students", element: _jsx(SecretaryStudents, {}) }), _jsx(Route, { path: "/secretary/students/:id", element: _jsx(StudentProfileView, {}) }), _jsx(Route, { path: "/secretary/faculty", element: _jsx(SecretaryFaculty, {}) }), _jsx(Route, { path: "/secretary/faculty/:id", element: _jsx(FacultyProfileView, {}) }), _jsx(Route, { path: "/secretary/schedules", element: _jsx(SecretarySchedules, {}) }), _jsx(Route, { path: "/secretary/events", element: _jsx(SecretaryEvents, {}) }), _jsx(Route, { path: "/secretary/documents", element: _jsx(SecretaryDocuments, {}) }), _jsx(Route, { path: "/secretary/reports", element: _jsx(SecretaryReports, {}) }), _jsx(Route, { path: "/secretary/research", element: _jsx(SecretaryResearch, {}) }), _jsx(Route, { path: "/secretary/pending-changes", element: _jsx(SecretaryPendingChanges, {}) }), _jsx(Route, { path: "/secretary", element: _jsx(Navigate, { to: "/secretary/dashboard", replace: true }) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/admin/dashboard", replace: true }) })] }) }));
}
