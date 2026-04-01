import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        <Navbar title={title} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        {/* Navbar */}
        <Navbar title={title} onMenuClick={toggleSidebar} />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
