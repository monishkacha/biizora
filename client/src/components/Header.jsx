import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { useNotifications } from '../context/NotificationContext';
import { useCommandPalette } from '../context/CommandPaletteContext';
import {
  Search,
  Plus,
  Bell,
  Sparkles,
  Command,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
  Menu,
} from 'lucide-react';

function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Header({ setMobileOpen }) {
  const { user, logout } = useAuth();
  const { metrics, company } = useBusiness();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { openPalette } = useCommandPalette();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-stone px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          className="lg:hidden p-2 rounded-[12px] border border-stone text-warm-gray hover:bg-cream transition-colors"
          onClick={() => setMobileOpen?.(true)}
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={openPalette}
          className="flex items-center gap-3 px-3.5 py-2 bg-ivory hover:bg-cream text-warm-gray rounded-[14px] border border-stone text-xs transition-all duration-[220ms] w-40 sm:w-72"
        >
          <Search className="w-4 h-4 text-text-disabled shrink-0" strokeWidth={1.75} />
          <span className="truncate flex-1 text-left">Search…</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white rounded-md border border-stone font-mono text-[10px] text-text-disabled">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-yellow-champagne/60 border border-yellow-butter/40 rounded-[14px]">
          <Sparkles className="w-3.5 h-3.5 text-green-bottle" strokeWidth={1.75} />
          <span className="text-xs text-warm-gray">
            Health <strong className="text-green-bottle font-semibold">{metrics.healthScore}</strong>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/app/invoices/new')}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-yellow-butter hover:bg-yellow-honey text-charcoal rounded-[14px] text-xs font-semibold shadow-yellow transition-all duration-[220ms]"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New invoice</span>
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
            className="p-2 text-warm-gray hover:text-charcoal hover:bg-cream rounded-[12px] transition-colors relative"
          >
            <Bell className="w-5 h-5" strokeWidth={1.75} />
            {unreadCount > 0 ? (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-bottle rounded-full ring-2 ring-white" />
            ) : null}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-stone rounded-[18px] shadow-elev p-3 z-50">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone">
                <h4 className="text-xs font-semibold text-charcoal">Notifications</h4>
                <button type="button" onClick={markAllRead} className="text-[10px] text-warm-gray hover:text-green-bottle">
                  Mark all read
                </button>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-warm-gray p-4 text-center">You&apos;re all caught up</p>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => markRead(n.id)}
                      className={`w-full text-left p-2.5 rounded-[14px] border transition-colors ${
                        n.read ? 'bg-white border-stone' : 'bg-cream/80 border-stone'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-charcoal">{n.title}</span>
                        <span className="text-[10px] text-text-disabled whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                      </div>
                      <p className="text-xs text-warm-gray mt-0.5 leading-relaxed">{n.message}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
            className="flex items-center gap-2.5 p-1 rounded-[14px] hover:bg-cream transition-colors"
          >
            <img src={user?.avatar} alt="" className="w-8 h-8 rounded-full object-cover border border-stone bg-cream" />
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-charcoal leading-tight">{user?.name}</p>
              <p className="text-[10px] text-warm-gray leading-tight">{user?.subscriptionPlan}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-text-disabled hidden md:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-stone rounded-[18px] shadow-elev p-2 z-50 space-y-1">
              <div className="px-3 py-2 border-b border-stone">
                <p className="text-xs font-semibold text-charcoal truncate">{company?.name}</p>
                <p className="text-[10px] text-warm-gray">GSTIN: {company?.gstin || '—'}</p>
              </div>
              <button type="button" onClick={() => { setProfileOpen(false); navigate('/app/settings'); }} className="w-full text-left px-3 py-2 rounded-[12px] text-xs text-warm-gray hover:bg-cream hover:text-charcoal flex items-center gap-2">
                <User className="w-4 h-4" /> Settings
              </button>
              <button type="button" onClick={() => { setProfileOpen(false); navigate('/app/billing'); }} className="w-full text-left px-3 py-2 rounded-[12px] text-xs text-warm-gray hover:bg-cream hover:text-charcoal flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Billing
              </button>
              <div className="pt-1 border-t border-stone">
                <button type="button" onClick={logout} className="w-full text-left px-3 py-2 rounded-[12px] text-xs text-charcoal hover:bg-cream flex items-center gap-2 font-medium">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
