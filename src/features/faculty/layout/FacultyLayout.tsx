import { ReactNode, useState } from 'react';
import { FacultySidebar } from './FacultySidebar';
import { FacultyNavbar } from './FacultyNavbar';

interface FacultyLayoutProps {
  children: ReactNode;
  title?: string;
}

export function FacultyLayout({ children, title }: FacultyLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <FacultySidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
        {/* Navbar */}
        <FacultyNavbar title={title} onMenuClick={toggleSidebar} />

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
