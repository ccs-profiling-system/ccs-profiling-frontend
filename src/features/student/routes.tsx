import { RouteObject } from 'react-router-dom';
import { ProfilePage } from './pages/ProfilePage';
import { SchedulePage } from './pages/SchedulePage';
import { AcademicRequirementsPage } from './pages/AcademicRequirementsPage';
import { ParticipationPage } from './pages/ParticipationPage';
import { ResearchPage } from './pages/ResearchPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { CoursesPage } from './pages/CoursesPage';
import { GradesPage } from './pages/GradesPage';
import { EventsPage } from './pages/EventsPage';
import { NotificationsPage } from './pages/NotificationsPage';

export const studentRoutes: RouteObject[] = [
  { path: '/student', element: <StudentDashboard /> },
  { path: '/student/dashboard', element: <StudentDashboard /> },
  { path: '/student/profile', element: <ProfilePage /> },
  { path: '/student/courses', element: <CoursesPage /> },
  { path: '/student/schedule', element: <SchedulePage /> },
  { path: '/student/grades', element: <GradesPage /> },
  { path: '/student/research', element: <ResearchPage /> },
  { path: '/student/events', element: <EventsPage /> },
  { path: '/student/notifications', element: <NotificationsPage /> },
  { path: '/student/requirements', element: <AcademicRequirementsPage /> },
  { path: '/student/participation', element: <ParticipationPage /> },
];
