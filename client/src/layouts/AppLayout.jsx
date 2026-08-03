import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Toast from '../components/Toast';
import CommandPalette from '../components/CommandPalette';
import FloatingAIChat from '../components/FloatingAIChat';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/ui/Badge';

export default function AppLayout() {
  const { user, loading, activeWorkspace } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-11 h-11 mx-auto rounded-[14px] bg-green-bottle text-white flex items-center justify-center font-display font-semibold text-lg shadow-card">
            B
          </div>
          <p className="text-sm text-warm-gray">Loading Biizora…</p>
          <Skeleton className="h-1.5 w-36 mx-auto" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
    activeWorkspace &&
    activeWorkspace.onboardingCompleted === false &&
    location.pathname !== '/app/onboarding'
  ) {
    return <Navigate to="/app/onboarding" replace />;
  }

  return (
    <div className="min-h-screen font-sans flex bg-ivory text-charcoal">
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-charcoal/20 backdrop-blur-[1px] lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-[220ms] ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Header setMobileOpen={setMobileOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <CommandPalette />
      <FloatingAIChat />
      <Toast />
    </div>
  );
}
