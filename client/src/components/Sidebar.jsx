import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { businessApi, setActiveBusinessId } from "../api/client";

import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Boxes,
  CreditCard,
  BarChart3,
  TrendingUp,
  Sparkles,
  Zap,
  Sliders,
  Settings,
  LogOut,
  ChevronDown,
  Building2,
  Plus,
  UserPlus,
  ScrollText,
  Headphones,
  Database,
} from "lucide-react";

export default function Sidebar({
  collapsed,
  mobileOpen,
  setMobileOpen,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    user,
    logout,
    activeWorkspace,
    workspaces,
    switchWorkspace,
    refreshBusinesses,
  } = useAuth();

  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const navItems = [
    { label: "Overview", path: "/app", icon: LayoutDashboard },
    { label: "Invoices", path: "/app/invoices", icon: FileText },
    { label: "Customers", path: "/app/customers", icon: Users },
    { label: "Products", path: "/app/products", icon: Package },
    { label: "Inventory", path: "/app/inventory", icon: Boxes },
    { label: "Expenses", path: "/app/expenses", icon: CreditCard },
    { label: "Reports", path: "/app/reports", icon: BarChart3 },
    { label: "Analytics", path: "/app/analytics", icon: TrendingUp },
    { label: "AI Suite", path: "/app/ai-suite", icon: Sparkles },
    { label: "Data Migration", path: "/app/migration", icon: Database },
    { label: "Payments", path: "/app/payments", icon: Zap },
    { label: "Team", path: "/app/team", icon: UserPlus },
    { label: "Activity", path: "/app/activity", icon: ScrollText },
    { label: "Billing", path: "/app/billing", icon: Sliders },
    { label: "Settings", path: "/app/settings", icon: Settings },
    { label: "Support", path: "/app/support", icon: Headphones },
  ];


  const createBusiness = async () => {
    setCreating(true);
    try {
      const name = window.prompt('New business name');
      if (!name) return;
      const data = await businessApi.create({ name });
      setActiveBusinessId(data.business.id);
      switchWorkspace(data.business.id);
      await refreshBusinesses();
      navigate('/app/onboarding');
    } finally {
      setCreating(false);
      setWorkspaceMenuOpen(false);
    }
  };

  return (
    <aside
      className={`
        fixed left-0 top-0 bottom-0 z-40 flex flex-col
        bg-cream/90 backdrop-blur-xl border-r border-stone
        transition-all duration-[220ms]
        ${collapsed ? 'w-20' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      <div className="p-4 border-b border-stone">
        {!collapsed ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-[14px] bg-white border border-stone hover:bg-ivory transition-colors duration-[220ms] text-left shadow-subtle"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-[10px] bg-green-soft text-white flex items-center justify-center shrink-0 bg-green-bottle">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-charcoal truncate">{activeWorkspace?.name || 'Biizora'}</p>
                  <p className="text-[10px] text-green-forest">{activeWorkspace?.role || 'Owner'}</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-warm-gray shrink-0" />
            </button>

            {workspaceMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone rounded-[16px] shadow-elev p-2 z-50 space-y-1">
                <p className="text-[10px] font-semibold text-warm-gray uppercase tracking-wider px-2 py-1">Businesses</p>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => {
                      switchWorkspace(ws.id);
                      setWorkspaceMenuOpen(false);
                      window.location.reload();
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-[12px] text-xs transition-colors ${ws.id === activeWorkspace?.id
                      ? 'bg-cream text-charcoal font-semibold'
                      : 'text-warm-gray hover:bg-ivory'
                      }`}
                  >
                    <span className="truncate block">{ws.name}</span>
                  </button>
                ))}
                <div className="pt-1 border-t border-stone">
                  <button
                    type="button"
                    disabled={creating}
                    onClick={createBusiness}
                    className="w-full text-left px-2.5 py-2 rounded-[12px] text-xs text-green-bottle hover:bg-cream flex items-center gap-1.5 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" /> New business
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-10 h-10 mx-auto rounded-[12px] bg-green-bottle text-white flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              onClick={() => setMobileOpen?.(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-[14px] text-[13px] font-medium transition-all duration-[220ms] ${isActive
                ? 'bg-white text-green-bottle shadow-subtle border border-stone'
                : 'text-warm-gray hover:text-charcoal hover:bg-white/70'
                }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-stone space-y-2">
        {!collapsed && user && (
          <div className="p-2 bg-white border border-stone rounded-[14px] flex items-center justify-between shadow-subtle">
            <div className="flex items-center gap-2 min-w-0">
              <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover bg-cream border border-stone" />
              <div className="truncate">
                <p className="text-xs font-medium text-charcoal truncate">{user.name}</p>
                <p className="text-[10px] text-warm-gray truncate">{user.email}</p>
              </div>
            </div>
            <button type="button" onClick={logout} className="p-1.5 text-warm-gray hover:text-charcoal hover:bg-cream rounded-[10px]" title="Sign out">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
