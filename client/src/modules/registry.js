/**
 * Client-side module registry — mirrors server catalogue for offline sidebar
 * and is refreshed from GET /api/modules/me when authenticated.
 */

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
  UserPlus,
  ScrollText,
  Headphones,
  Database,
  Truck,
  Bell,
  Search,
  Calendar,
  Scissors,
  Heart,
  Monitor,
  ClipboardList,
  Receipt,
  Factory,
  Store,
  GraduationCap,
  BadgeCheck,
} from 'lucide-react';

const ICON_MAP = {
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
  UserPlus,
  ScrollText,
  Headphones,
  Database,
  Truck,
  Bell,
  Search,
  Calendar,
  Scissors,
  Heart,
  Monitor,
  ClipboardList,
  Receipt,
  Factory,
  Store,
  GraduationCap,
  BadgeCheck,
};

/** Fallback nav when modules API is unavailable — preserves existing Biizora nav */
export const FALLBACK_NAV = [
  { id: 'dashboard', title: 'Overview', route: '/app', icon: 'LayoutDashboard', category: 'core' },
  { id: 'invoices', title: 'Invoices', route: '/app/invoices', icon: 'FileText', category: 'core' },
  { id: 'customers', title: 'Customers', route: '/app/customers', icon: 'Users', category: 'core' },
  { id: 'products', title: 'Products', route: '/app/products', icon: 'Package', category: 'core' },
  { id: 'inventory', title: 'Inventory', route: '/app/inventory', icon: 'Boxes', category: 'core' },
  { id: 'expenses', title: 'Expenses', route: '/app/expenses', icon: 'CreditCard', category: 'finance' },
  { id: 'reports', title: 'Reports', route: '/app/reports', icon: 'BarChart3', category: 'insights' },
  { id: 'analytics', title: 'Analytics', route: '/app/analytics', icon: 'TrendingUp', category: 'insights' },
  { id: 'ai-suite', title: 'AI Suite', route: '/app/ai-suite', icon: 'Sparkles', category: 'ai' },
  { id: 'migration', title: 'Data Migration', route: '/app/migration', icon: 'Database', category: 'admin' },
  { id: 'payments', title: 'Payments', route: '/app/payments', icon: 'Zap', category: 'finance' },
  { id: 'team', title: 'Team', route: '/app/team', icon: 'UserPlus', category: 'core' },
  { id: 'activity', title: 'Activity', route: '/app/activity', icon: 'ScrollText', category: 'core' },
  { id: 'billing', title: 'Billing', route: '/app/billing', icon: 'Sliders', category: 'admin' },
  { id: 'membership', title: 'Membership', route: '/app/membership', icon: 'BadgeCheck', category: 'admin' },
  { id: 'settings', title: 'Settings', route: '/app/settings', icon: 'Settings', category: 'core' },
  { id: 'support', title: 'Support', route: '/app/support', icon: 'Headphones', category: 'core' },
];

export function resolveIcon(name) {
  return ICON_MAP[name] || LayoutDashboard;
}

/**
 * Filter modules for a workspace using local rules (feature flags + type).
 * Prefer server /modules/me when available.
 */
export function filterModulesForWorkspace(modules, workspace) {
  if (!workspace) return FALLBACK_NAV;
  const type = (workspace.businessType || 'general').toLowerCase();
  const features = workspace.customFeatures || [];
  const enabled = workspace.enabledModules || [];
  const status = workspace.subscriptionStatus;

  if (status && status !== 'Active') return [];

  return (modules || FALLBACK_NAV).filter((mod) => {
    if (mod.sidebar === false) return false;
    const types = mod.businessTypes || ['*'];
    if (!types.includes('*') && !types.includes(type)) return false;
    if (mod.requiredFeature && !features.includes(mod.requiredFeature)) return false;
    if (enabled.length > 0 && !enabled.includes(mod.id) && !mod.requiredFeature) return false;
    return true;
  });
}

export function modulesToNavItems(modules) {
  const seen = new Set();
  return modules
    .filter((m) => {
      if (!m.route || seen.has(m.route)) return false;
      seen.add(m.route);
      return m.sidebar !== false;
    })
    .map((m) => ({
      id: m.id,
      label: m.title,
      path: m.route,
      icon: resolveIcon(m.icon),
      category: m.category,
      requiredFeature: m.requiredFeature,
    }));
}
