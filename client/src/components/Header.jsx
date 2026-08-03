import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { useTheme } from '../context/ThemeContext';
import { useCommandPalette } from '../context/CommandPaletteContext';
import {
  Search,
  Plus,
  Bell,
  Sparkles,
  Command,
  ChevronDown,
  AlertTriangle,
  FileText,
  User,
  LogOut,
  ShieldCheck,
  Building2,
  Palette,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ collapsed, setCollapsed }) {
  const { user, logout } = useAuth();
  const { metrics, company, showToast } = useBusiness();
  const { bgStyle, setBgStyle, darkMode, toggleTheme } = useTheme();
  const { openPalette } = useCommandPalette();
  const navigate = useNavigate();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [bgMenuOpen, setBgMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'Invoice Overdue', desc: 'Nova Retail (₹94,900) is 17 days past due.', type: 'alert', time: '10m ago' },
    { id: 2, title: 'Low Inventory Alert', desc: 'Thermal Receipt Rolls down to 4 units.', type: 'warning', time: '1h ago' },
    { id: 3, title: 'AI Cash Flow Forecast', desc: 'Predicted +14.2% MoM revenue growth for August.', type: 'ai', time: '3h ago' }
  ];

  const bgThemes = [
    { id: 'corporate-slate', name: 'Corporate Slate', desc: 'Clean Light Slate / Deep Slate Dark', color: '#F1F5F9' },
    { id: 'banking-navy', name: 'Deep Banking Navy', desc: 'Authoritative Deep Navy (#0A1128)', color: '#0A1128' },
    { id: 'warm-ivory', name: 'Executive Warm Ivory', desc: 'Warm Ivory Light (#F5F3EF)', color: '#F5F3EF' },
    { id: 'emerald-dark', name: 'Corporate Emerald', desc: 'Executive Dark Emerald (#0B1A17)', color: '#0B1A17' }
  ];

  const handleSelectBg = (styleId, name) => {
    setBgStyle(styleId);
    setBgMenuOpen(false);
    showToast(`Background theme changed to "${name}"!`);
  };

  return (
    <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between transition-colors">
      
      {/* Left Search / Command Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={openPalette}
          className="flex items-center gap-3 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs transition-colors w-48 sm:w-72"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate flex-1 text-left">Search invoices, customers, AI...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-700 font-mono text-[10px] text-slate-500">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>

        {/* Financial Health Score Pill */}
        <button
          onClick={() => navigate('/app/ai-power-suite')}
          title="Click to view full Financial Health Score AI Diagnostic"
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800/60 rounded-xl transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Health Score: <strong className="text-blue-600 dark:text-blue-400">{metrics.healthScore}/100</strong>
          </span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        
        {/* Quick New Invoice CTA */}
        <button
          onClick={() => navigate('/app/invoices/new')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New GST Invoice</span>
        </button>

        {/* Background Color Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setBgMenuOpen(!bgMenuOpen)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
            title="Change Business Background Color"
          >
            <Palette className="w-5 h-5" />
          </button>

          {bgMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2.5 z-50 space-y-1">
              <div className="pb-2 border-b border-slate-100 dark:border-slate-800 px-2">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Business Background Colors</p>
                <p className="text-[10px] text-slate-400">Select background for executive feel</p>
              </div>

              <div className="space-y-1 pt-1">
                {bgThemes.map(t => {
                  const isSelected = bgStyle === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleSelectBg(t.id, t.name)}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 font-bold border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <p className="font-bold leading-tight">{t.name}</p>
                        <p className="text-[9px] text-slate-400 leading-tight mt-0.5">{t.desc}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </button>

          {/* Notifications Modal */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">Business Alerts</h4>
                <span className="text-[10px] px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 font-semibold rounded-full">3 New</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-100">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img src={user?.avatar} alt={user?.name} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{user?.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{company.name}</p>
                <p className="text-[10px] text-slate-400">GSTIN: {company.gstin}</p>
              </div>
              <button
                onClick={() => { setProfileOpen(false); navigate('/app/settings'); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <User className="w-4 h-4 text-slate-400" /> My Account & Company
              </button>
              <button
                onClick={() => { setProfileOpen(false); navigate('/app/billing'); }}
                className="w-full text-left px-3 py-2 rounded-xl text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-slate-400" /> Billing & Plan ({user?.subscriptionPlan})
              </button>
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={logout}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
