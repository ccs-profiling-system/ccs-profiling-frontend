import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/api/authService';

export function Login() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect already-authenticated users based on role
  useEffect(() => {
    if (isAuthenticated) {
      const userRole = localStorage.getItem('userRole');
      if (userRole === 'chair') {
        navigate('/chair/dashboard', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      login(response);
      
      // Store user role and department info
      const userRole = response.user?.role || 'admin';
      const departmentId = response.user?.department_id;
      const departmentName = response.user?.department_name;
      
      localStorage.setItem('userRole', userRole);
      if (departmentId) localStorage.setItem('departmentId', departmentId);
      if (departmentName) localStorage.setItem('departmentName', departmentName);
      
      // Role-based redirection
      setTimeout(() => {
        if (userRole === 'chair') {
          navigate('/chair/dashboard', { replace: true });
        } else {
          navigate('/admin/dashboard', { replace: true });
        }
      }, 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/campus.jpg')" }}
      />
      {/* Orange gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(234,88,12,0.85) 0%, rgba(239,68,68,0.75) 100%)' }}
      />

      {/* Left branding */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-12">
        <div>
          <h1 className="text-white text-2xl font-bold">CCS Profiling</h1>
          <p className="text-white/80 text-sm mt-1">Admin Portal</p>
        </div>
        <p className="text-white/60 text-sm">&copy; 2026 CCS System</p>
      </div>

      {/* Login panel - right side */}
      <div className="relative z-10 w-[30rem] bg-white flex items-center justify-center p-10">
        <div className="w-full">
          <div className="p-2">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm mb-6">Sign in to your admin account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ccs.edu.ph"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-primary" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-primary hover:text-primary-dark font-medium">
                  Forgot password?
                </a>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-semibold transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:text-primary-dark font-medium">
                  Create account
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
