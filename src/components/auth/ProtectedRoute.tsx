import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Guards admin routes. Requires an authenticated user with role === 'admin'.
 * - Unauthenticated users → /login
 * - Authenticated students → /student/profile
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, token, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/login', { replace: true });
    } else if (role === 'student') {
      navigate('/student/profile', { replace: true });
    }
  }, [isAuthenticated, token, role, navigate]);

  if (!isAuthenticated || !token || role === 'student') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  return <>{children}</>;
}
