import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui';

interface FacultyProtectedRouteProps {
  children: ReactNode;
}

export function FacultyProtectedRoute({ children }: FacultyProtectedRouteProps) {
  const { isAuthenticated, token, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login', { replace: true });
    } else if (role !== 'faculty' && role !== 'department_chair') {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, token, role, navigate]);

  if (!isAuthenticated || !token || (role !== 'faculty' && role !== 'department_chair')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  return <>{children}</>;
}
