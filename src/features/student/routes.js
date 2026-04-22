import { jsx as _jsx } from "react/jsx-runtime";
import { ProfilePage } from './pages/ProfilePage';
import { SchedulePage } from './pages/SchedulePage';
import { AcademicRequirementsPage } from './pages/AcademicRequirementsPage';
import { ParticipationPage } from './pages/ParticipationPage';
import { ResearchPage } from './pages/ResearchPage';
export const studentRoutes = [
    { path: '/student/profile', element: _jsx(ProfilePage, {}) },
    { path: '/student/schedule', element: _jsx(SchedulePage, {}) },
    { path: '/student/requirements', element: _jsx(AcademicRequirementsPage, {}) },
    { path: '/student/participation', element: _jsx(ParticipationPage, {}) },
    { path: '/student/research', element: _jsx(ResearchPage, {}) },
    // Default redirect
    { path: '/student', element: _jsx(ProfilePage, {}) },
    { path: '/student/dashboard', element: _jsx(ProfilePage, {}) },
];
