import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from '@/features/admin/dashboard';
import { Login } from '@/features/auth/Login';
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
// import { SchedulingPage } from '@/features/admin/scheduling'; // Disabled - data type issues
import { ResearchPage, ResearchDetailPage } from '@/features/admin/research';
import { studentRoutes } from '@/features/student/routes';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/student/login" element={<StudentLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute>
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students/:id"
          element={
            <ProtectedRoute>
              <StudentDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/faculty"
          element={
            <ProtectedRoute>
              <Faculty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/instructions"
          element={
            <ProtectedRoute>
              <Instructions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute>
              <EventsErrorBoundary>
                <EventsPage />
              </EventsErrorBoundary>
            </ProtectedRoute>
          }
        />
        {/* Scheduling route disabled due to data type issues - will be fixed */}
        {/* <Route
          path="/admin/scheduling"
          element={
            <ProtectedRoute>
              <SchedulingPage />
            </ProtectedRoute>
          }
        /> */}
        <Route
          path="/admin/research"
          element={
            <ProtectedRoute>
              <ResearchPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/research/:id"
          element={
            <ProtectedRoute>
              <ResearchDetailPage />
            </ProtectedRoute>
          }
        />
        {/* Student Portal Routes - wrapped with StudentProtectedRoute */}
        {studentRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <StudentProtectedRoute>
                {route.element}
              </StudentProtectedRoute>
            }
          />
        ))}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}