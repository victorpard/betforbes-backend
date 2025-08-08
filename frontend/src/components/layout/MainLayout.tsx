import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from '../BottomNavigation';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white">
      <Outlet />
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
