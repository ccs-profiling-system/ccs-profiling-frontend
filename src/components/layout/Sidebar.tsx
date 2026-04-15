import { NavLink } from 'react-router-dom';
import {
<<<<<<< HEAD
  LayoutDashboard, GraduationCap, Users, FileText, BookOpen,
  Calendar, Briefcase, FlaskConical,
=======
  LayoutDashboard, GraduationCap, Users, Calendar, FileText, BookOpen, Clock, FlaskConical,
>>>>>>> origin/main
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'admin' | 'chair';
}

export function Sidebar({ isOpen, onClose, variant = 'admin' }: SidebarProps) {
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students', icon: GraduationCap },
    { to: '/admin/faculty', label: 'Faculty', icon: Users },
    { to: '/admin/events', label: 'Events', icon: Calendar },
    // { to: '/admin/scheduling', label: 'Scheduling', icon: Clock }, // Disabled - data type issues
    { to: '/admin/research', label: 'Research', icon: FlaskConical },
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
    { to: '/chair/reports', label: 'Reports', icon: FileText },
  ];

  const navLinks = variant === 'chair' ? chairLinks : adminLinks;
  const portalName = variant === 'chair' ? 'Chair Portal' : 'Admin Portal';

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
<<<<<<< HEAD
        <div className="p-6 border-b border-primary-dark/30">
          <h1 className="text-xl font-bold">CCS Profiling</h1>
          <p className="text-sm text-white/80 mt-1">{portalName}</p>
=======
        <div className="p-4 sm:p-6 border-b border-primary-dark/30 bg-gradient-to-br from-primary to-primary-dark">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30 hover:bg-white/20 transition-colors">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold tracking-tight truncate">CCS Profiling</h1>
              <p className="text-xs text-white/70 truncate">Admin Portal</p>
            </div>
          </div>
>>>>>>> origin/main
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
              <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-white truncate">Admin User</p>
              <p className="text-xs text-white/60 truncate">Administrator</p>
            </div>
          </div>
          <p className="text-xs text-white/50 text-center mt-3 sm:mt-4 font-medium">© 2026 CCS System</p>
        </div>
      </aside>
    </>
  );
}