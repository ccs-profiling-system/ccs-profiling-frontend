import { useState, useEffect, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/api/authService';
import { BookOpen } from 'lucide-react';

export function StudentLogin() {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  const [studentNumber, setStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect already-authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/student/profile', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await authService.login({ email: studentNumber, password, role: 'student' });

      // Role is already 'student' from the service call
      login(response);

      // Store student token separately for backward compatibility
      localStorage.setItem('studentToken', response.tokens.access.token);

      setTimeout(() => {
        navigate('/student/profile', { replace: true });
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
      {/* Blue gradient overlay for student portal */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.85) 0%, rgba(37,99,235,0.75) 100%)' }}
      />

      {/* Left branding - hidden on mobile */}
      <div className="relative z-10 hidden md:flex flex-1 flex-col justify-between p-12" aria-hidden="true">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-white" />
            <h1 className="text-white text-2xl font-bold">CCS Profiling</h1>
          </div>
          <p className="text-white/80 text-sm">Student Portal</p>
        </div>
        <p className="text-white/60 text-sm">© 2026 CCS System</p>
      </div>

      {/* Login panel - full width on mobile, fixed width on desktop */}
      <div className="relative z-10 w-full md:w-[30rem] bg-white flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm md:max-w-none">
          {/* Mobile branding */}
          <div className="flex items-center gap-3 mb-6 md:hidden">
            <BookOpen className="w-7 h-7 text-blue-600" />
          </div>

          <div className="p-2">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome, Student</h2>
            <p className="text-gray-500 text-sm mb-6">Sign in to your student account</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="studentNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Student Number
                </label>
                <input
                  id="studentNumber"
                  type="text"
                  value={studentNumber}
                  onChange={(e) => setStudentNumber(e.target.value)}
                  placeholder="e.g. 2201671"
                  required
                  autoComplete="username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
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
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="text-center text-sm text-gray-600 mt-6">
                Not a student?{' '}
                <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Admin Login
                </a>
              </div>
              <div className="text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/student/register" className="text-blue-600 hover:text-blue-700 font-medium">
                  Register
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
