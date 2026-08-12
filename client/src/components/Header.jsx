import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { useNotifications } from '../context/NotificationContext';
import { useCommandPalette } from '../context/CommandPaletteContext';
import LanguageSwitcher from './LanguageSwitcher';
import { WhatsAppIcon } from './SupportTopBar';
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
  Headphones,
  Phone,
  Monitor,
  Copy,
  Check,
  ExternalLink,
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
  const { t } = useTranslation();
  const { user, logout, business, activeWorkspace } = useAuth();
  const biz = business || activeWorkspace;
  const { metrics, company } = useBusiness();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const { openPalette } = useCommandPalette();
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
          <span className="truncate flex-1 text-left">{t('common.search', 'Search invoices, customers, products...')}</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-white rounded-md border border-stone font-mono text-[10px] text-text-disabled">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>

        {(biz?.isDemoAccount || user?.isDemoAccount) && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-[14px] text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            {t('common.demoWorkspace', 'Demo Workspace')}
          </div>
        )}

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-yellow-champagne/60 border border-yellow-butter/40 rounded-[14px]">
          <Sparkles className="w-3.5 h-3.5 text-green-bottle" strokeWidth={1.75} />
          <span className="text-xs text-warm-gray">
            Health <strong className="text-green-bottle font-semibold">{metrics.healthScore}</strong>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Global Language Switcher */}
        <LanguageSwitcher />

        {biz?.businessType !== 'salon' && (
          <button
            type="button"
            onClick={() => navigate('/app/invoices/new')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-yellow-butter hover:bg-yellow-honey text-charcoal rounded-[14px] text-xs font-semibold shadow-yellow transition-all duration-[220ms]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('common.newInvoice', 'New invoice')}</span>
          </button>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => { setSupportOpen(!supportOpen); setNotificationsOpen(false); setProfileOpen(false); }}
            className="p-2 text-warm-gray hover:text-green-bottle hover:bg-cream rounded-[12px] transition-colors relative flex items-center gap-1.5"
            title="Customer Support & Remote Assistance"
          >
            <Headphones className="w-5 h-5 text-green-bottle" strokeWidth={1.75} />
            <span className="hidden xl:inline text-xs font-semibold text-charcoal">{t('common.helpSupport', 'Support')}</span>
          </button>

          {supportOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-stone rounded-[18px] shadow-elev p-4 z-50 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone">
                <div className="flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-green-bottle" />
                  <h4 className="text-xs font-bold text-charcoal">Support & Remote Help</h4>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#25D366] bg-[#25D366]/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse" /> Online
                </span>
              </div>

              {/* Phone & WhatsApp */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-warm-gray">WhatsApp & Call Lines</p>
                <a
                  href="https://wa.me/919904914513"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-[12px] bg-ivory hover:bg-cream border border-stone text-xs text-charcoal font-mono transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" /> +91 9904914513
                  </span>
                  <span className="text-[10px] font-sans text-green-bottle font-semibold">WhatsApp &rarr;</span>
                </a>
                <a
                  href="https://wa.me/919081051240"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-[12px] bg-ivory hover:bg-cream border border-stone text-xs text-charcoal font-mono transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" /> +91 9081051240
                  </span>
                  <span className="text-[10px] font-sans text-green-bottle font-semibold">WhatsApp &rarr;</span>
                </a>
              </div>

              {/* AnyDesk Remote Assistance */}
              <div className="space-y-1.5 pt-1 border-t border-stone">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-warm-gray flex items-center gap-1">
                    <Monitor className="w-3 h-3 text-terracotta" /> AnyDesk Remote IDs
                  </p>
                </div>

                <div className="flex items-center justify-between p-2 rounded-[12px] bg-ivory border border-stone text-xs font-mono">
                  <span>Desk 1: <strong>1452019780</strong></span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('1452019780', 'hdr_any1')}
                    className="p-1 text-warm-gray hover:text-charcoal"
                    title="Copy Desk ID"
                  >
                    {copiedId === 'hdr_any1' ? <Check className="w-3.5 h-3.5 text-green-forest" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 rounded-[12px] bg-ivory border border-stone text-xs font-mono">
                  <span>Desk 2: <strong>1439051108</strong></span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('1439051108', 'hdr_any2')}
                    className="p-1 text-warm-gray hover:text-charcoal"
                    title="Copy Desk ID"
                  >
                    {copiedId === 'hdr_any2' ? <Check className="w-3.5 h-3.5 text-green-forest" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-stone">
                <button
                  type="button"
                  onClick={() => { setSupportOpen(false); navigate('/app/support'); }}
                  className="w-full py-2 bg-yellow-butter hover:bg-yellow-honey text-charcoal rounded-[12px] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  Open Support Center <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); setSupportOpen(false); }}
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
                <h4 className="text-xs font-semibold text-charcoal">{t('common.notifications', 'Notifications')}</h4>
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
                <User className="w-4 h-4" /> {t('common.profile', 'My Profile')}
              </button>
              <button type="button" onClick={() => { setProfileOpen(false); navigate('/app/billing'); }} className="w-full text-left px-3 py-2 rounded-[12px] text-xs text-warm-gray hover:bg-cream hover:text-charcoal flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> {t('common.companySettings', 'Company Settings')}
              </button>
              <div className="pt-1 border-t border-stone">
                <button type="button" onClick={logout} className="w-full text-left px-3 py-2 rounded-[12px] text-xs text-charcoal hover:bg-cream flex items-center gap-2 font-medium">
                  <LogOut className="w-4 h-4" /> {t('common.signOut', 'Sign Out')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

