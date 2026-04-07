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
        <Route path="/research/:id" element={<ResearchDetailPage />} />
        <Route path="/research" element={<ResearchPage />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/scheduling" element={<div className="p-6"><h1 className="text-2xl font-bold">Scheduling - Coming Soon</h1></div>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
