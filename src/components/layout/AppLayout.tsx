import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-white text-[#171417] flex">
      {/* Sidebar Shell */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Viewport Content */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 bg-white ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Header />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
