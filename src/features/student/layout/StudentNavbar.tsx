import { Menu, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface StudentNavbarProps {
  title?: string;
  onMenuClick: () => void;
}

export function StudentNavbar({ title, onMenuClick }: StudentNavbarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout(); // clears auth_token, auth_user, auth_refresh_token, studentToken from context + localStorage
    navigate('/student/login', { replace: true });
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Menu and Title */}
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            {title && (
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
            )}
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/student/profile')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Profile"
            >
              <User className="w-6 h-6 text-gray-600" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-red-600"
              aria-label="Logout"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
