import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#0F172A] flex">
      {/* Fixed White Left Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Viewport Content */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 bg-[#FAF8F5] ${
          isCollapsed ? 'md:ml-20' : 'md:ml-64'
        } ml-0`}
      >
        <Header onToggleMobileMenu={() => setIsMobileOpen(!isMobileOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-[#FAF8F5]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
