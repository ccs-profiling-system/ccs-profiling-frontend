import { Search } from 'lucide-react';

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = 'Dashboard' }: NavbarProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Title */}
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>

          {/* Search Input */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Right Section - User Info Placeholder */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
