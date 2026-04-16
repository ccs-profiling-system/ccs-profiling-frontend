import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui';

interface FacultyProtectedRouteProps {
  children: ReactNode;
}

export function FacultyProtectedRoute({ children }: FacultyProtectedRouteProps) {
  const navigate = useNavigate();
  const token = localStorage.getItem('facultyToken');

  useEffect(() => {
    if (!token) {
      navigate('/faculty/login', { replace: true });
    }
  }, [token, navigate]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  return <>{children}</>;
}
