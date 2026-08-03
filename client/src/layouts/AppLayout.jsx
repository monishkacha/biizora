import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Toast from '../components/Toast';
import CommandPalette from '../components/CommandPalette';
import FloatingAIChat from '../components/FloatingAIChat';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function AppLayout() {
  const { user } = useAuth();
  const { darkMode, bgStyle } = useTheme();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Dynamic Executive Background Color Classes
  const getBgClass = () => {
    if (bgStyle === 'banking-navy') {
      return 'bg-[#0A1128] text-slate-100';
    }
    if (bgStyle === 'warm-ivory') {
      return darkMode ? 'bg-[#0F172A] text-slate-100' : 'bg-[#F5F3EF] text-slate-900';
    }
    if (bgStyle === 'emerald-dark') {
      return 'bg-[#0B1A17] text-slate-100';
    }
    // Default 'corporate-slate'
    return darkMode ? 'bg-[#0B132B] text-slate-100' : 'bg-[#F1F5F9] text-slate-900';
  };

  return (
    <div className={`min-h-screen font-sans flex transition-colors duration-300 ${getBgClass()}`}>
      {/* Executive Sidebar */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* Main Content Viewport */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        <Header collapsed={collapsed} setCollapsed={setCollapsed} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Persistent SaaS Floating Widgets */}
      <CommandPalette />
      <FloatingAIChat />
      <Toast />
    </div>
  );
}
