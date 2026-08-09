import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { modulesApi } from '../api/client';
import {
  FALLBACK_NAV,
  filterModulesForWorkspace,
  modulesToNavItems,
  resolveIcon,
} from '../modules/registry';
import { PoweredByBizora } from './ui/PoweredByBizora';
import { LogOut, Building2, Shield, BadgeCheck, Headphones } from 'lucide-react';

export default function Sidebar({ collapsed, mobileOpen }) {
  const location = useLocation();
  const { user, logout, business, activeWorkspace } = useAuth();
  const biz = business || activeWorkspace;

  const [navItems, setNavItems] = useState(() => modulesToNavItems(FALLBACK_NAV));

  useEffect(() => {
    let cancelled = false;

    async function loadNav() {
      if (!biz?.id) {
        setNavItems(modulesToNavItems(FALLBACK_NAV));
        return;
      }

      if (biz?.businessType === 'salon') {
        const salonModules = [
          { id: 'dashboard', title: 'Dashboard', route: '/app', icon: 'LayoutDashboard' },
          { id: 'calendar', title: 'Calendar', route: '/app/calendar', icon: 'Calendar' },
          { id: 'appointments', title: 'Appointments', route: '/app/appointments', icon: 'Clock' },
          { id: 'customers', title: 'Customers', route: '/app/customers', icon: 'Users' },
          { id: 'stylists', title: 'Stylists', route: '/app/stylists', icon: 'Sparkles' },
          { id: 'services', title: 'Services', route: '/app/services', icon: 'Scissors' },
          { id: 'billing', title: 'Billing', route: '/app/billing', icon: 'Receipt' },
          { id: 'memberships', title: 'Memberships', route: '/app/memberships', icon: 'Shield' },
          { id: 'reviews', title: 'Reviews', route: '/app/reviews', icon: 'Star' },
          { id: 'reports', title: 'Reports', route: '/app/reports', icon: 'BarChart3' },
          { id: 'settings', title: 'Settings', route: '/app/settings', icon: 'Settings' },
        ];
        setNavItems(modulesToNavItems(salonModules));
        return;
      }

      if (biz.subscriptionStatus && biz.subscriptionStatus !== 'Active') {
        setNavItems(
          modulesToNavItems([
            {
              id: 'membership',
              title: 'Membership',
              route: '/app/membership',
              icon: 'BadgeCheck',
              category: 'admin',
            },
            {
              id: 'support',
              title: 'Support',
              route: '/app/support',
              icon: 'Headphones',
              category: 'core',
            },
          ])
        );
        return;
      }

      try {
        const data = await modulesApi.me();
        if (cancelled) return;
        const sidebar = data.sidebar?.length
          ? data.sidebar
          : filterModulesForWorkspace(FALLBACK_NAV, { ...biz, ...data.business });
        setNavItems(modulesToNavItems(sidebar));
      } catch {
        if (cancelled) return;
        const filtered = filterModulesForWorkspace(FALLBACK_NAV, biz);
        setNavItems(modulesToNavItems(filtered.length ? filtered : FALLBACK_NAV));
      }
    }

    loadNav();
    return () => {
      cancelled = true;
    };
  }, [biz?.id, biz?.subscriptionStatus, biz?.businessType]);

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
          <div className="flex items-center gap-2.5 p-2.5 rounded-[14px] bg-white border border-stone shadow-subtle">
            <div
              className="w-8 h-8 rounded-[10px] text-white flex items-center justify-center shrink-0 bg-green-bottle"
              style={biz?.themeColor ? { backgroundColor: biz.themeColor } : undefined}
            >
              <Building2 className="w-4 h-4" />
            </div>
            <div className="truncate min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <p className="text-xs font-semibold text-charcoal truncate">{biz?.name || 'Biizora'}</p>
                {(biz?.isDemoAccount || user?.isDemoAccount) && (
                  <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-900 px-1.5 py-0.2 rounded-md border border-amber-500/30">
                    Demo
                  </span>
                )}
              </div>
              <p className="text-[10px] text-green-forest capitalize truncate">
                {biz?.businessType || 'business'}
                {biz?.subscriptionStatus ? ` · ${biz.subscriptionStatus}` : ''}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-[12px] bg-green-bottle text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            item.path === '/app'
              ? location.pathname === '/app'
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.id || item.path}
              to={item.path}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm transition-colors duration-[220ms]
                ${active ? 'bg-green-bottle text-white shadow-subtle' : 'text-charcoal/80 hover:bg-white'}
                ${collapsed ? 'justify-center' : ''}
              `}
              title={item.label}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate font-medium">{item.label}</span>}
            </Link>
          );
        })}

        {!navItems.some((n) => n.path === '/app/membership') && biz?.businessType !== 'salon' && (
          <Link
            to="/app/membership"
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm
              ${location.pathname.startsWith('/app/membership') ? 'bg-green-bottle text-white' : 'text-charcoal/80 hover:bg-white'}
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <BadgeCheck className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="font-medium">Membership</span>}
          </Link>
        )}

        {user?.isSuperAdmin && (
          <Link
            to="/app/admin"
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm mt-2
              ${location.pathname.startsWith('/app/admin') ? 'bg-charcoal text-white' : 'text-charcoal/80 hover:bg-white'}
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <Shield className="w-4 h-4 shrink-0" />
            {!collapsed && <span className="font-medium">Super Admin</span>}
          </Link>
        )}
      </nav>

      <div className="p-3 border-t border-stone space-y-1">
        <Link
          to="/app/support"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm text-warm-gray hover:bg-white hover:text-charcoal ${collapsed ? 'justify-center' : ''}`}
        >
          <Headphones className="w-4 h-4" />
          {!collapsed && <span>Help & Support</span>}
        </Link>
        <button
          type="button"
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm text-warm-gray hover:bg-white hover:text-charcoal ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign out</span>}
        </button>
        {!collapsed && <PoweredByBizora className="pt-2 border-t border-stone/30" />}
      </div>
    </aside>
  );
}
