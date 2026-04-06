import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminDashboard } from '@/features/admin/dashboard';
import { Reports } from '@/features/admin/reports';
import { Instructions } from '@/features/admin/instructions';
import { Login } from '@/features/auth/Login';
import { ResearchPage, ResearchDetailPage } from '@/features/admin/research';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin/research/:id" element={<ResearchDetailPage />} />
        <Route path="/admin/research" element={<ResearchPage />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
