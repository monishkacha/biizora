import { Business } from '../models/Business.js';
import { normalizeBusinessType, resolveDefaultModules } from '../config/businessTypes.js';

/**
 * Backfill SaaS fields on existing businesses so upgrades are non-breaking.
 * Existing tenants without subscriptionStatus become Active (grandfathered).
 */
export async function ensureTenantDefaults() {
  const businesses = await Business.find({});
  let updated = 0;

  for (const b of businesses) {
    let dirty = false;

    if (!b.subscriptionStatus) {
      b.subscriptionStatus = 'Active';
      b.isActive = true;
      if (!b.subscriptionActivatedAt) b.subscriptionActivatedAt = b.createdAt || new Date();
      dirty = true;
    }

    if (!b.subscriptionPlan) {
      b.subscriptionPlan = 'professional';
      dirty = true;
    }

    if (!b.businessType) {
      b.businessType = normalizeBusinessType(b.industry || 'general');
      dirty = true;
    }

    if (!b.enabledModules || b.enabledModules.length === 0) {
      b.enabledModules = resolveDefaultModules(b.businessType);
      dirty = true;
    }

    if (!b.ownerName && b.createdBy) {
      // leave empty; optional
    }

    if (!b.currency && b.taxSettings?.currency) {
      b.currency = b.taxSettings.currency;
      dirty = true;
    }

    if (!b.invoicePrefix && b.taxSettings?.invoicePrefix) {
      b.invoicePrefix = b.taxSettings.invoicePrefix;
      dirty = true;
    }

    if (!b.themeColor && b.branding?.brandColor) {
      b.themeColor = b.branding.brandColor;
      dirty = true;
    }

    if (b.customFeatures == null) {
      b.customFeatures = [];
      dirty = true;
    }

    if (dirty) {
      await b.save();
      updated += 1;
    }
  }

  if (updated > 0) {
    console.log(`✓ Tenant defaults backfilled for ${updated} business(es)`);
  }
}
