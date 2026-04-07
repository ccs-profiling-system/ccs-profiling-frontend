import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AdminDashboard } from '@/features/admin/dashboard';
import { Reports } from '@/features/admin/reports';
import { Instructions } from '@/features/admin/instructions';
import { Login } from '@/features/auth/Login';
import { Faculty } from '@/features/admin/faculty';
import { useAuth } from '@/context/AuthContext';

function AuthGuard() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AuthGuard />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/reports" element={<Reports />} />
          <Route path="/admin/instructions" element={<Instructions />} />
          <Route path="/admin/faculty" element={<Faculty />} />
          {/* collaborators add routes here — one per line */}
        </Route>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
