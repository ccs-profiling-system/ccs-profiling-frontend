import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui';

interface StudentProtectedRouteProps {
  children: ReactNode;
}

/**
 * Guards student routes. Requires an authenticated user with role === 'student'.
 * - Unauthenticated users → /student/login
 * - Authenticated admins → /admin/dashboard
 */
export function StudentProtectedRoute({ children }: StudentProtectedRouteProps) {
  const { isAuthenticated, token, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      navigate('/student/login', { replace: true });
    } else if (role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, token, role, navigate]);

  if (!isAuthenticated || !token || role === 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  return <>{children}</>;
}
