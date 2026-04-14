import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import facultyPortalService from '@/services/api/facultyPortalService';

export function FacultyLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await facultyPortalService.login(email, password);
      localStorage.setItem('facultyToken', result.token);
      navigate('/faculty/dashboard', { replace: true });
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
      {/* Green gradient overlay for faculty portal */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(234,88,12,0.85) 0%, rgba(194,65,12,0.75) 100%)' }}
      />

      {/* Left branding */}
      <div className="relative z-10 flex-1 flex flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-8 h-8 text-white" />
            <h1 className="text-white text-2xl font-bold">CCS Profiling</h1>
          </div>
          <p className="text-white/80 text-sm">Faculty Portal</p>
        </div>
        <p className="text-white/60 text-sm">© 2026 CCS System</p>
      </div>

      {/* Login panel - right side */}
      <div className="relative z-10 w-[30rem] bg-white flex items-center justify-center p-10">
        <div className="w-full">
          <div className="p-2">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome, Faculty</h2>
            <p className="text-gray-500 text-sm mb-6">Sign in to your faculty account</p>

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
                  placeholder="faculty@ccs.edu.ph"
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-orange-500" />
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
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="text-center text-sm text-gray-600 mt-6">
                Not a faculty member?{' '}
                <a href="/login" className="text-primary hover:text-primary-dark font-medium">
                  Admin Login
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


