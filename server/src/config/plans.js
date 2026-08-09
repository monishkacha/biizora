/**
 * Subscription plan catalogue — configuration-driven entitlements.
 * Add or adjust plans here without changing application logic.
 */

export const SUBSCRIPTION_STATUSES = [
  'Pending',
  'Active',
  'Expired',
  'Suspended',
  'Cancelled',
];

export const PLAN_IDS = ['starter', 'growth', 'professional', 'enterprise'];

export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Essential tools for solo operators and micro businesses.',
    priceMonthly: 999,
    currency: 'INR',
    limits: {
      maxUsers: 3,
      maxStorageMb: 1024,
      maxModules: 12,
      aiCredits: 50,
      apiAccess: false,
      customBranding: false,
      exports: ['csv'],
    },
    includedModules: [
      'dashboard',
      'sales',
      'invoices',
      'inventory',
      'customers',
      'suppliers',
      'employees',
      'reports',
      'notifications',
      'profile',
      'settings',
      'search',
    ],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    description: 'More seats, analytics, and industry modules for growing teams.',
    priceMonthly: 2499,
    currency: 'INR',
    limits: {
      maxUsers: 10,
      maxStorageMb: 5120,
      maxModules: 30,
      aiCredits: 250,
      apiAccess: false,
      customBranding: true,
      exports: ['csv', 'excel'],
    },
    includedModules: ['*'],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Full module suite, branding, and higher AI / export limits.',
    priceMonthly: 4999,
    currency: 'INR',
    limits: {
      maxUsers: 50,
      maxStorageMb: 20480,
      maxModules: 100,
      aiCredits: 1000,
      apiAccess: true,
      customBranding: true,
      exports: ['csv', 'excel', 'pdf'],
    },
    includedModules: ['*'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Unlimited scale, custom features, API access, and white-label.',
    priceMonthly: 9999,
    currency: 'INR',
    limits: {
      maxUsers: 500,
      maxStorageMb: 102400,
      maxModules: Infinity,
      aiCredits: 10000,
      apiAccess: true,
      customBranding: true,
      exports: ['csv', 'excel', 'pdf', 'api'],
    },
    includedModules: ['*'],
  },
};

export function getPlan(planId) {
  const key = String(planId || 'starter').toLowerCase();
  return PLANS[key] || PLANS.starter;
}

export function planAllowsModule(planId, moduleId) {
  const plan = getPlan(planId);
  if (!plan.includedModules) return true;
  if (plan.includedModules.includes('*')) return true;
  return plan.includedModules.includes(moduleId);
}

export function isSubscriptionActive(status) {
  return String(status || '').toLowerCase() === 'active';
}
