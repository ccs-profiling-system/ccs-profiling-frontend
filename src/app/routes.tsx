import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '@/features/auth/Login';
import { Faculty } from '@/features/admin/faculty';
import { FacultyProfile } from '@/features/admin/faculty/FacultyProfile';
import { FacultyForm } from '@/features/admin/faculty/FacultyForm';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/faculty" element={<Faculty />} />
        <Route path="/faculty/new" element={<FacultyForm />} />
        <Route path="/faculty/:id" element={<FacultyProfile />} />
        <Route path="/faculty/:id/edit" element={<FacultyForm />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
