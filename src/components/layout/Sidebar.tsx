import { NavLink } from 'react-router-dom';

export function Sidebar() {
  const navLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/admin/instructions', label: 'Instructions' },
  ];

  return (
    <aside className="w-64 bg-primary text-white shadow-lg flex flex-col">
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
                className={({ isActive }) =>
                  `block px-4 py-3 rounded-lg transition ${
                    isActive
                      ? 'bg-primary-dark text-white font-semibold'
                      : 'text-white/90 hover:bg-primary-dark hover:text-white'
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
  );
}
