import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui';

interface StudentProtectedRouteProps {
  children: ReactNode;
}

export function StudentProtectedRoute({ children }: StudentProtectedRouteProps) {
  const navigate = useNavigate();
  const token = localStorage.getItem('studentToken');

  useEffect(() => {
    if (!token) {
      navigate('/student/login', { replace: true });
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
