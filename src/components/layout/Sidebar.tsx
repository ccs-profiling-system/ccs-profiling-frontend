import { NavLink } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/reports', label: 'Reports' },
    { to: '/instructions', label: 'Instructions' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 bg-primary text-white shadow-lg flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-primary-dark">
          <h1 className="text-2xl font-bold">CCS Profiling</h1>
          <p className="text-sm text-white/80 mt-1">Admin Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-dark text-white font-semibold shadow-md border-l-4 border-white'
                        : 'text-white/90 hover:bg-primary-dark hover:text-white hover:shadow-sm hover:translate-x-1'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-primary-dark">
          <p className="text-xs text-white/70 text-center">© 2024 CCS System</p>
        </div>
      </aside>
    </>
  );
}
