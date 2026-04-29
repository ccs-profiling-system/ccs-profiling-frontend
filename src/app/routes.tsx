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
import { SchedulingPage } from '@/features/admin/scheduling';
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
import { ChairCurriculum } from '@/features/chair/curriculum';

// Admin Approvals
import { AdminApprovals } from '@/features/admin/approvals';

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
import { SecretaryCurriculum } from '@/features/secretary/curriculum';

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
        <Route path="/register" element={<Register />} />
        <Route path="/student/login" element={<Navigate to="/login" replace />} />
        <Route path="/faculty/login" element={<Navigate to="/login" replace />} />
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
        <Route
          path="/admin/scheduling"
          element={
            <ProtectedRoute>
              <SchedulingPage />
            </ProtectedRoute>
          }
        />
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
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute>
              <AdminApprovals />
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
        {/* Faculty Portal Routes - wrapped with FacultyProtectedRoute */}
        {facultyRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <FacultyProtectedRoute>
                {route.element}
              </FacultyProtectedRoute>
            }
          />
        ))}
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
        <Route
          path="/chair/approvals"
          element={
            <ProtectedRoute>
              <ChairApprovals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chair/instructions"
          element={
            <ProtectedRoute>
              <ChairCurriculum />
            </ProtectedRoute>
          }
        />
        <Route path="/chair" element={<Navigate to="/chair/dashboard" replace />} />
        
        {/* Secretary Portal Routes - Protected with Authentication */}
        <Route
          path="/secretary/dashboard"
          element={
            <ProtectedRoute>
              <SecretaryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secretary/students"
          element={
            <ProtectedRoute>
              <SecretaryStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secretary/students/:id"
          element={
            <ProtectedRoute>
              <StudentProfileView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secretary/faculty"
          element={
            <ProtectedRoute>
              <SecretaryFaculty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secretary/faculty/:id"
          element={
            <ProtectedRoute>
              <FacultyProfileView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secretary/schedules"
          element={
            <ProtectedRoute>
              <SecretarySchedules />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secretary/events"
          element={
            <ProtectedRoute>
              <SecretaryEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secretary/curriculum"
          element={
            <ProtectedRoute>
              <SecretaryCurriculum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secretary/documents"
          element={
            <ProtectedRoute>
              <SecretaryDocuments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secretary/reports"
          element={
            <ProtectedRoute>
              <SecretaryReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secretary/research"
          element={
            <ProtectedRoute>
              <SecretaryResearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/secretary/pending-changes"
          element={
            <ProtectedRoute>
              <SecretaryPendingChanges />
            </ProtectedRoute>
          }
        />
        <Route path="/secretary" element={<Navigate to="/secretary/dashboard" replace />} />
        
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}