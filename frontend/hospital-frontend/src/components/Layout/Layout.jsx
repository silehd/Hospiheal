import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

const Layout = () => {
  const [isDesktopOpen, setIsDesktopOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleDesktopSidebar = () => setIsDesktopOpen(!isDesktopOpen);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={isDesktopOpen}
        setIsOpen={setIsDesktopOpen}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav
          toggleMobileSidebar={toggleMobileSidebar}
          toggleDesktopSidebar={toggleDesktopSidebar}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;