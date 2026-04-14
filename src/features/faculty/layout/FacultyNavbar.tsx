import { Menu, LogOut } from 'lucide-react';
import { useFacultyAuth } from '@/features/faculty/hooks/useFacultyAuth';

interface FacultyNavbarProps {
  title?: string;
  onMenuClick: () => void;
}

export function FacultyNavbar({ title, onMenuClick }: FacultyNavbarProps) {
  const { faculty, logout } = useFacultyAuth();

  const fullName = faculty
    ? `${faculty.firstName} ${faculty.lastName}`
    : '';

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

          {/* Right side - Faculty name + Logout */}
          <div className="flex items-center gap-4">
            {fullName && (
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {fullName}
              </span>
            )}
            <button
              onClick={logout}
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
