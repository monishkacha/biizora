import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
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
  Moon,
  Sun,
  ShieldAlert,
  HelpCircle,
  Plus
} from 'lucide-react';

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, activeWorkspace, workspaces, switchWorkspace } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const navItems = [
    { label: 'Executive Overview', path: '/app', icon: LayoutDashboard },
    { label: 'GST Invoices', path: '/app/invoices', icon: FileText, badge: 'GST' },
    { label: 'Customer Directory', path: '/app/customers', icon: Users },
    { label: 'Products & Services', path: '/app/products', icon: Package },
    { label: 'Inventory Control', path: '/app/inventory', icon: Boxes },
    { label: 'Expense Tracker', path: '/app/expenses', icon: CreditCard },
    { label: 'Financial Reports', path: '/app/reports', icon: BarChart3 },
    { label: 'Analytics & Growth', path: '/app/analytics', icon: TrendingUp },
    { label: 'Amexora AI Suite', path: '/app/ai-suite', icon: Sparkles, highlight: true },
    { label: 'Payments & Razorpay', path: '/app/payments', icon: Zap },
    { label: 'SaaS Subscription', path: '/app/billing', icon: Sliders },
    { label: 'Settings & GST Profile', path: '/app/settings', icon: Settings },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-30 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Workspace / Brand Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {!collapsed ? (
          <div className="relative w-full">
            <button
              onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-semibold text-white truncate">{activeWorkspace.name}</p>
                  <p className="text-[10px] text-blue-400 font-medium">{activeWorkspace.plan}</p>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
            </button>

            {/* Workspace Dropdown */}
            {workspaceMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 space-y-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">Workspaces</p>
                {workspaces.map(ws => (
                  <button
                    key={ws.id}
                    onClick={() => { switchWorkspace(ws.id); setWorkspaceMenuOpen(false); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between ${
                      ws.id === activeWorkspace.id ? 'bg-blue-600 text-white font-medium' : 'hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    <span className="text-[10px] opacity-80">{ws.role}</span>
                  </button>
                ))}
                <div className="pt-1 border-t border-slate-700">
                  <button
                    onClick={() => { setWorkspaceMenuOpen(false); navigate('/app/billing'); }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-blue-400 hover:bg-slate-700 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create New Business
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold mx-auto">
            <Sparkles className="w-5 h-5" />
          </div>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                  : item.highlight
                  ? 'bg-slate-800/90 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400'
                  : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400'}`} />
              {!collapsed && (
                <div className="flex items-center justify-between flex-1 truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded font-semibold">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded font-bold animate-pulse">
                      AI
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile & Actions */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs px-2 text-slate-400">
          {!collapsed && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Role: <strong className="text-slate-200">{user?.role}</strong>
            </span>
          )}
          <button onClick={toggleTheme} className="p-1 hover:text-white" title="Toggle theme">
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {!collapsed && user && (
          <div className="p-2 bg-slate-800/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
              <div className="truncate">
                <p className="text-xs font-medium text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
