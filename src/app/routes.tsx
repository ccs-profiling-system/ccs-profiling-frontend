import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from '@/features/admin/dashboard';
import { Login } from '@/features/auth/Login';
import { Faculty } from '@/features/admin/faculty';
import { FacultyProfile } from '@/features/admin/faculty/FacultyProfile';
import { FacultyForm } from '@/features/admin/faculty/FacultyForm';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
