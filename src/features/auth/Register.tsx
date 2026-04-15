import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/api/authService';

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = (): string | null => {
    if (!form.name.trim()) return 'Full name is required';
    if (!form.email.trim()) return 'Email is required';
    if (form.password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password))
      return 'Password must contain uppercase, lowercase, and a number';
    if (form.password !== form.confirmPassword) return 'Passwords do not match';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setError(null);
    setLoading(true);
    try {
      const response = await authService.register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'admin',
      });
      login(response);
      setTimeout(() => navigate('/admin/dashboard', { replace: true }), 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/campus.jpg')" }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(234,88,12,0.85) 0%, rgba(239,68,68,0.75) 100%)' }} />

      {/* Left branding */}
      <div className="relative z-10 flex-1 hidden md:flex flex-col justify-between p-12">
        <div>
          <h1 className="text-white text-2xl font-bold">CCS Profiling</h1>
          <p className="text-white/80 text-sm mt-1">Admin Portal</p>
        </div>
        <p className="text-white/60 text-sm">© 2026 CCS System</p>
      </div>

      {/* Register panel */}
      <div className="relative z-10 w-full md:w-[30rem] bg-white flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm md:max-w-none">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Create Admin Account</h2>
          <p className="text-gray-500 text-sm mb-6">Register a new admin account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                id="name" type="text" value={form.name} onChange={set('name')}
                placeholder="Juan dela Cruz" required autoComplete="name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                id="email" type="email" value={form.email} onChange={set('email')}
                placeholder="admin@ccs.edu.ph" required autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password" type="password" value={form.password} onChange={set('password')}
                placeholder="••••••••" required autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
              <p className="text-xs text-gray-500 mt-1">Min 8 chars, uppercase, lowercase, and number</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                id="confirmPassword" type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                placeholder="••••••••" required autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-semibold transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account…</>
              ) : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-dark font-medium">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
