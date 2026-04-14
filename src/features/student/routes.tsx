import { RouteObject } from 'react-router-dom';
import { StudentDashboard } from './pages/StudentDashboard';
import { CoursesPage } from './pages/CoursesPage';
import { GradesPage } from './pages/GradesPage';
import { TranscriptPage } from './pages/TranscriptPage';
import { ResearchPage } from './pages/ResearchPage';
import { EventsPage } from './pages/EventsPage';
import { AdvisorPage } from './pages/AdvisorPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProgressPage } from './pages/ProgressPage';
import { FinancialPage } from './pages/FinancialPage';

export const studentRoutes: RouteObject[] = [
  { path: '/student/dashboard', element: <StudentDashboard /> },
  { path: '/student/courses', element: <CoursesPage /> },
  { path: '/student/grades', element: <GradesPage /> },
  { path: '/student/transcript', element: <TranscriptPage /> },
  { path: '/student/progress', element: <ProgressPage /> },
  { path: '/student/research', element: <ResearchPage /> },
  { path: '/student/events', element: <EventsPage /> },
  { path: '/student/advisor', element: <AdvisorPage /> },
  { path: '/student/notifications', element: <NotificationsPage /> },
  { path: '/student/profile', element: <ProfilePage /> },
  { path: '/student/financial', element: <FinancialPage /> },
];
