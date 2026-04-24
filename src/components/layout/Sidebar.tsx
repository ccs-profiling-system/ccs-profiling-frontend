import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, GraduationCap, Users, FileText, BookOpen, Clock, FlaskConical,
  Calendar, Briefcase, CheckCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'admin' | 'chair' | 'secretary';
}

export function Sidebar({ isOpen, onClose, variant = 'admin' }: SidebarProps) {
  const { user } = useAuth();
  
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: GraduationCap },
    { to: '/admin/faculty', label: 'Faculty', icon: Users },
    { to: '/admin/events', label: 'Events', icon: Calendar },
    { to: '/admin/scheduling', label: 'Scheduling', icon: Clock },
    { to: '/admin/research', label: 'Research', icon: FlaskConical },
    { to: '/admin/approvals', label: 'Approvals', icon: CheckCircle },
    { to: '/admin/reports', label: 'Reports', icon: FileText },
    { to: '/admin/instructions', label: 'Instructions', icon: BookOpen },
  ];

  const chairLinks = [
    { to: '/chair/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/chair/students', label: 'Students', icon: GraduationCap },
    { to: '/chair/faculty', label: 'Faculty', icon: Users },
    { to: '/chair/schedules', label: 'Schedules', icon: Calendar },
    { to: '/chair/events', label: 'Events', icon: Briefcase },
    { to: '/chair/research', label: 'Research', icon: FlaskConical },
    { to: '/chair/approvals', label: 'Approvals', icon: CheckCircle },
    { to: '/chair/reports', label: 'Reports', icon: FileText },
  ];

  const secretaryLinks = [
    { to: '/secretary/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/secretary/students', label: 'Student Records', icon: GraduationCap },
    { to: '/secretary/faculty', label: 'Faculty Records', icon: Users },
    { to: '/secretary/schedules', label: 'Schedules', icon: Calendar },
    { to: '/secretary/events', label: 'Events', icon: Briefcase },
    { to: '/secretary/research', label: 'Research', icon: FlaskConical },
    { to: '/secretary/documents', label: 'Documents', icon: FileText },
    { to: '/secretary/reports', label: 'Reports', icon: BookOpen },
    { to: '/secretary/pending-changes', label: 'Pendings', icon: Clock },
  ];

  const navLinks = variant === 'secretary' ? secretaryLinks : variant === 'chair' ? chairLinks : adminLinks;
  const portalName = variant === 'secretary' ? 'Secretary Portal' : variant === 'chair' ? 'Chair Portal' : 'Admin Portal';
  
  // Get user display info
  const displayName = user?.name ?? user?.email ?? 'User';
  const roleLabel = variant === 'secretary' ? 'Secretary' : variant === 'chair' ? 'Department Chair' : 'Administrator';
  
  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part) => part[0] ?? '')
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  const initials = getInitials(displayName);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-56 sm:w-64 bg-primary text-white shadow-2xl flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-primary-dark/30">
          <h1 className="text-xl font-bold">CCS Profiling</h1>
          <p className="text-sm text-white/80 mt-1">{portalName}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto scrollbar-hide">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `sidebar-nav-item flex items-center gap-3 transition-all duration-200 ${
                      isActive
                        ? 'sidebar-nav-item-active'
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  <link.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium text-sm">{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-primary-dark/30 bg-gradient-to-t from-primary-dark/20 to-transparent">
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 flex-shrink-0">
              <span className="text-xs sm:text-sm font-bold text-white">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-white truncate">{displayName}</p>
              <p className="text-xs text-white/60 truncate">{roleLabel}</p>
            </div>
          </div>
          <p className="text-xs text-white/50 text-center mt-3 sm:mt-4 font-medium">© 2026 CCS System</p>
        </div>
      </aside>
    </>
  );
}