import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import authService from '@/services/api/authService';
import { BookOpen } from 'lucide-react';

const PROGRAMS = [
  'BS Computer Science',
  'BS Information Technology',
  'BS Information Systems',
  'Associate in Computer Technology',
];

export function StudentRegister() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    studentId: '',
    program: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const validate = (): string | null => {
    if (!form.name.trim()) return 'Full name is required';
    if (!form.email.trim()) return 'Email is required';
    if (!form.studentId.trim()) return 'Student ID is required';
    if (!form.program) return 'Please select a program';
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
        role: 'student',
        studentId: form.studentId,
        program: form.program,
      });
      login(response);
      localStorage.setItem('studentToken', response.tokens.access.token);
      setTimeout(() => navigate('/student/profile', { replace: true }), 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative">
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/campus.jpg')" }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.85) 0%, rgba(37,99,235,0.75) 100%)' }} />

      {/* Left branding */}
      <div className="relative z-10 hidden md:flex flex-1 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-white" />
            <h1 className="text-white text-2xl font-bold">CCS Profiling</h1>
          </div>
          <p className="text-white/80 text-sm">Student Portal</p>
        </div>
        <p className="text-white/60 text-sm">© 2026 CCS System</p>
      </div>

      {/* Register panel */}
      <div className="relative z-10 w-full md:w-[30rem] bg-white flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-sm md:max-w-none py-4">
          {/* Mobile branding */}
          <div className="flex items-center gap-3 mb-6 md:hidden">
            <BookOpen className="w-7 h-7 text-blue-600" />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-1">Create Student Account</h2>
          <p className="text-gray-500 text-sm mb-6">Register to access the student portal</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                id="name" type="text" value={form.name} onChange={set('name')}
                placeholder="Juan dela Cruz" required autoComplete="name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>

            <div>
              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <input
                id="studentId" type="text" value={form.studentId} onChange={set('studentId')}
                placeholder="e.g. 2024-00001" required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                id="email" type="email" value={form.email} onChange={set('email')}
                placeholder="student@ccs.edu.ph" required autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>

            <div>
              <label htmlFor="program" className="block text-sm font-medium text-gray-700 mb-1">Program</label>
              <select
                id="program" value={form.program} onChange={set('program')} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base bg-white"
              >
                <option value="">Select your program</option>
                {PROGRAMS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password" type="password" value={form.password} onChange={set('password')}
                placeholder="••••••••" required autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
              <p className="text-xs text-gray-500 mt-1">Min 8 chars, uppercase, lowercase, and number</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                id="confirmPassword" type="password" value={form.confirmPassword} onChange={set('confirmPassword')}
                placeholder="••••••••" required autoComplete="new-password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account…</>
              ) : 'Create Account'}
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <Link to="/student/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
