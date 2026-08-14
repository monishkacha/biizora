import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Toast from '../components/Toast';
import CommandPalette from '../components/CommandPalette';
import FloatingAIChat from '../components/FloatingAIChat';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '../components/ui/Badge';

import { isStationeryWorkspace } from '../config/workspaceFeatures';

import BiizoraPageLoader from '../components/ui/BiizoraPageLoader';

const MEMBERSHIP_PATHS = ['/app/membership', '/app/pending', '/app/billing'];

export default function AppLayout() {
  const { user, loading, business, activeWorkspace } = useAuth();
  const biz = business || activeWorkspace;
  const isStationery = isStationeryWorkspace(biz);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (loading) {
    return <BiizoraPageLoader message="Initializing Biizora Engine..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isDemo = Boolean(biz?.isDemoAccount || user?.isDemoAccount);
  const subStatus = biz?.subscriptionStatus;
  const isActive = isDemo || subStatus === 'Active';
  const onMembershipRoute = MEMBERSHIP_PATHS.some((p) => location.pathname.startsWith(p));

  // Inactive subscription → Membership page only (no dashboard)
  if (biz && !isActive && !onMembershipRoute && location.pathname !== '/app/support') {
    return <Navigate to="/app/membership" replace />;
  }

  if (location.pathname === '/app/pending') {
    return <Navigate to="/app/membership" replace />;
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

      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-[220ms] ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <Header setMobileOpen={setMobileOpen} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {isActive && (
        <>
          <CommandPalette />
          <FloatingAIChat />
        </>
      )}
      <Toast />
    </div>
  );
}
