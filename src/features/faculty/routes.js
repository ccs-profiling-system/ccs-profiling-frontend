import { jsx as _jsx } from "react/jsx-runtime";
import { FacultyDashboard } from './pages/FacultyDashboard';
import { CoursesPage } from './pages/CoursesPage';
import { StudentsPage } from './pages/StudentsPage';
import { AttendancePage } from './pages/AttendancePage';
import { ResearchPage } from './pages/ResearchPage';
import { EventsPage } from './pages/EventsPage';
import { ProfilePage } from './pages/ProfilePage';
import { MaterialsPage } from './pages/MaterialsPage';
export const facultyRoutes = [
    { path: '/faculty/dashboard', element: _jsx(FacultyDashboard, {}) },
    { path: '/faculty/courses', element: _jsx(CoursesPage, {}) },
    { path: '/faculty/students', element: _jsx(StudentsPage, {}) },
    { path: '/faculty/attendance', element: _jsx(AttendancePage, {}) },
    { path: '/faculty/research', element: _jsx(ResearchPage, {}) },
    { path: '/faculty/events', element: _jsx(EventsPage, {}) },
    { path: '/faculty/profile', element: _jsx(ProfilePage, {}) }, // Requirement 11
    { path: '/faculty/materials', element: _jsx(MaterialsPage, {}) }, // Requirement 12
];
