/**
 * Module Registry — drop-in plugin architecture.
 *
 * To add a future plugin:
 * 1. Create /config/modules/<plugin>.js exporting an array of module defs
 * 2. Import and registerModules(...) below
 * No other application code needs to change.
 */

import { commonModules } from './common.js';
import { salonModules } from './salon.js';
import { restaurantModules } from './restaurant.js';
import { retailModules } from './retail.js';
import { manufacturingModules } from './manufacturing.js';
import { stationeryModules } from './stationery.js';
import { customModules } from './custom.js';
import { getPlan, planAllowsModule } from '../plans.js';
import { hasFeature } from '../features.js';
import { normalizeBusinessType } from '../businessTypes.js';

const registry = new Map();

export function registerModules(modules = []) {
  for (const mod of modules) {
    if (!mod?.id) continue;
    registry.set(mod.id, { sidebar: true, ...mod });
  }
}

// Built-in registrations
registerModules(commonModules);
registerModules(salonModules);
registerModules(restaurantModules);
registerModules(retailModules);
registerModules(manufacturingModules);
registerModules(stationeryModules);
registerModules(customModules);

export function getAllModules() {
  return Array.from(registry.values());
}

export function getModule(id) {
  return registry.get(id) || null;
}

function matchesBusinessType(mod, businessType) {
  const types = mod.businessTypes || ['*'];
  if (types.includes('*')) return true;
  return types.includes(businessType);
}

function matchesPlan(mod, planId) {
  if (!mod.requiredPlan) return true;
  const planOrder = ['starter', 'growth', 'professional', 'enterprise'];
  const need = planOrder.indexOf(String(mod.requiredPlan).toLowerCase());
  const have = planOrder.indexOf(String(planId || 'starter').toLowerCase());
  if (need < 0) return true;
  return have >= need;
}

/**
 * Resolve modules visible for a tenant.
 * Priority: enabledModules on business → else defaults by type.
 * Always intersects with plan + feature flags + business type.
 */
export function resolveModulesForBusiness(business) {
  const businessType = normalizeBusinessType(business?.businessType || business?.industry);
  const planId = business?.subscriptionPlan || 'starter';
  const enabled = Array.isArray(business?.enabledModules) ? business.enabledModules : null;
  const all = getAllModules();

  return all.filter((mod) => {
    if (!matchesBusinessType(mod, businessType)) return false;
    if (!matchesPlan(mod, planId)) return false;
    if (!planAllowsModule(planId, mod.id) && !(getPlan(planId).includedModules || []).includes('*')) {
      return false;
    }
    if (mod.requiredFeature && !hasFeature(business, mod.requiredFeature)) return false;
    if (enabled && enabled.length > 0 && !enabled.includes(mod.id) && !mod.requiredFeature) {
      // Feature modules still appear when flag is on even if not in enabledModules
      return false;
    }
    if (mod.requiredFeature && hasFeature(business, mod.requiredFeature)) return true;
    return true;
  });
}

export function resolveSidebarModules(business) {
  return resolveModulesForBusiness(business).filter((m) => m.sidebar !== false);
}
