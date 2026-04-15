import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from '@/features/admin/dashboard';
import { Login } from '@/features/auth/Login';
import { EventsPage } from '@/features/admin/events';
import { Students } from '@/features/admin/students';
import { Faculty } from '@/features/admin/faculty';
import { Reports } from '@/features/admin/reports';
import { Instructions } from '@/features/admin/instructions';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

// Chair Portal Imports
import { ChairDashboard } from '@/features/chair/dashboard';
import { ChairStudents } from '@/features/chair/students';
import { ChairFaculty } from '@/features/chair/faculty';
import { ChairSchedules } from '@/features/chair/schedules';
import { ChairEvents } from '@/features/chair/events';
import { ChairResearch } from '@/features/chair/research';
import { ChairReports } from '@/features/chair/reports';

export function AppRoutes() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <Routes>
        <Route path="/login" element={<Login />} />
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
              <EventsPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        
        {/* Chair Portal Routes - Protected with Authentication */}
        <Route
          path="/chair/dashboard"
          element={
            <ProtectedRoute>
              <ChairDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chair/students"
          element={
            <ProtectedRoute>
              <ChairStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chair/faculty"
          element={
            <ProtectedRoute>
              <ChairFaculty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chair/schedules"
          element={
            <ProtectedRoute>
              <ChairSchedules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chair/events"
          element={
            <ProtectedRoute>
              <ChairEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chair/research"
          element={
            <ProtectedRoute>
              <ChairResearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chair/reports"
          element={
            <ProtectedRoute>
              <ChairReports />
            </ProtectedRoute>
          }
        />
        <Route path="/chair" element={<Navigate to="/chair/dashboard" replace />} />
        
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
