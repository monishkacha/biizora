/** Client mirror of server plan catalogue for Membership UI */
export const PLANS = {
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'Essential tools for solo operators.',
    priceMonthly: 999,
    limits: { maxUsers: 3, maxStorageMb: 1024, maxModules: 12, aiCredits: 50 },
    features: ['Core modules', 'GST invoicing', 'Email support', 'CSV exports'],
  },
  growth: {
    id: 'growth',
    name: 'Growth',
    description: 'More seats and industry modules.',
    priceMonthly: 2499,
    limits: { maxUsers: 10, maxStorageMb: 5120, maxModules: 30, aiCredits: 250 },
    features: ['Industry modules', 'Analytics', 'Custom branding', 'Excel exports'],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Full suite with higher limits.',
    priceMonthly: 4999,
    limits: { maxUsers: 50, maxStorageMb: 20480, maxModules: 100, aiCredits: 1000 },
    features: ['All modules', 'API access', 'PDF exports', 'Priority support'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Unlimited scale and custom features.',
    priceMonthly: 9999,
    limits: { maxUsers: 500, maxStorageMb: 102400, maxModules: Infinity, aiCredits: 10000 },
    features: ['Custom features', 'White label', 'API export', 'Dedicated support'],
  },
};

export function getPlan(planId) {
  const key = String(planId || 'starter').toLowerCase();
  return PLANS[key] || PLANS.starter;
}
