import { Search, Menu } from 'lucide-react';

interface NavbarProps {
  title?: string;
  onMenuClick: () => void;
}

export function Navbar({ title = 'Dashboard', onMenuClick }: NavbarProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <h2 className="text-lg lg:text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Search className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-semibold text-sm">A</div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
