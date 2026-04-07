import { Search, Menu, LogOut, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { SearchModal } from '../search/SearchModal';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  title?: string;
  onMenuClick: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Navbar({ title = 'Dashboard', onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = (): void => {
    setSearchOpen(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const initials = user ? getInitials(user.name ?? user.email) : 'A';
  const displayName = user?.name ?? user?.email ?? '';
  const displayEmail = user?.email ?? '';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Button + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
              type="button"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">{title}</h2>
          </div>

          {/* Search Input - Hidden on small screens */}
          <div className="hidden md:flex flex-1 max-w-md">
            <button
              onClick={handleSearch}
              className="w-full flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
            >
              <Search className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500">Search...</span>
              <kbd className="ml-auto px-2 py-1 text-xs text-gray-400 bg-white border border-gray-200 rounded">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Section — User Info + Dropdown */}
          <div className="flex items-center gap-3">
            {/* Mobile Search Icon */}
            <button
              type="button"
              onClick={handleSearch}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Search className="w-5 h-5 text-gray-600" />
            </button>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                  {initials}
                </div>
                {displayName && (
                  <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {displayName}
                  </span>
                )}
                <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-lg z-50 animate-scale-in">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                    <p className="text-xs text-gray-500 truncate">{displayEmail}</p>
                  </div>
                  <div className="p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
