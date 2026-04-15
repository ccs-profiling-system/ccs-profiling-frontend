import { RouteObject } from 'react-router-dom';
import { ProfilePage } from './pages/ProfilePage';
import { SchedulePage } from './pages/SchedulePage';
import { AcademicRequirementsPage } from './pages/AcademicRequirementsPage';
import { ParticipationPage } from './pages/ParticipationPage';
import { ResearchPage } from './pages/ResearchPage';

export const studentRoutes: RouteObject[] = [
  { path: '/student/profile', element: <ProfilePage /> },
  { path: '/student/schedule', element: <SchedulePage /> },
  { path: '/student/requirements', element: <AcademicRequirementsPage /> },
  { path: '/student/participation', element: <ParticipationPage /> },
  { path: '/student/research', element: <ResearchPage /> },
  // Default redirect
  { path: '/student', element: <ProfilePage /> },
  { path: '/student/dashboard', element: <ProfilePage /> },
];
