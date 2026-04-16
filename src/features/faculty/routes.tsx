import { RouteObject } from 'react-router-dom';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { CoursesPage } from './pages/CoursesPage';
import { StudentsPage } from './pages/StudentsPage';
import { AttendancePage } from './pages/AttendancePage';
import { ResearchPage } from './pages/ResearchPage';
import { EventsPage } from './pages/EventsPage';
import { ProfilePage } from './pages/ProfilePage';
import { MaterialsPage } from './pages/MaterialsPage';

export const facultyRoutes: RouteObject[] = [
  { path: '/faculty/dashboard', element: <FacultyDashboard /> },
  { path: '/faculty/courses',   element: <CoursesPage /> },
  { path: '/faculty/students',  element: <StudentsPage /> },
  { path: '/faculty/attendance',element: <AttendancePage /> },
  { path: '/faculty/research',  element: <ResearchPage /> },
  { path: '/faculty/events',    element: <EventsPage /> },
  { path: '/faculty/profile',   element: <ProfilePage /> },   // Requirement 11
  { path: '/faculty/materials', element: <MaterialsPage /> }, // Requirement 12
];
