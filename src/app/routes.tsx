import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from '@/features/admin/dashboard';
import { Reports } from '@/features/admin/reports';
import { Instructions } from '@/features/admin/instructions';
import { Login } from '@/features/auth/Login';
import { SchedulingPage } from '@/features/admin/scheduling';
import { Research } from '@/features/admin/research';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/scheduling" element={<SchedulingPage />} />
        <Route path="/admin/research" element={<Research />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/instructions" element={<Instructions />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
