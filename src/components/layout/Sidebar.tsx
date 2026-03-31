import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/students', label: 'Students' },
    { to: '/faculty', label: 'Faculty' },
    { to: '/reports', label: 'Reports' },
    { to: '/instructions', label: 'Instructions' },
  ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in" onClick={onClose} />}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 min-h-screen bg-primary text-white shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-primary-dark/30">
          <h1 className="text-xl font-bold">CCS Profiling</h1>
          <p className="text-sm text-white/80 mt-1">Admin Portal</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.to} className="relative">
                <NavLink to={link.to} onClick={onClose} className={({ isActive }) => `sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-primary-dark/30">
          <p className="text-xs text-white/70 text-center">© 2026 CCS System</p>
        </div>
      </aside>
    </>
  );
}
