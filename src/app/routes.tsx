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
        <Route path="/scheduling" element={<SchedulingPage />} />
        <Route path="/research" element={<Research />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<Navigate to="/dashboard" replace />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
