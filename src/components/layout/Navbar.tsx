import { Search, Menu } from 'lucide-react';
import { SearchBar } from '../ui/SearchBar';

interface NavbarProps {
  title?: string;
  onMenuClick: () => void;
}

export function Navbar({ title = 'Dashboard', onMenuClick }: NavbarProps) {
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    // Implement search functionality here
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 lg:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Button + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
              aria-label="Toggle menu"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-800">{title}</h2>
          </div>

          {/* Search Input - Hidden on small screens */}
          <div className="hidden md:flex flex-1 max-w-md">
            <SearchBar 
              placeholder="Search..." 
              onSearch={handleSearch}
              className="w-full"
            />
          </div>

          {/* Right Section - User Info Placeholder */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Mobile Search Icon */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
