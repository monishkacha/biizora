/**
 * Custom feature flags — client-specific capabilities.
 * Never hardcode business IDs; gate via Business.customFeatures[].
 */

export const CUSTOM_FEATURES = {
  vehicleTracking: {
    id: 'vehicleTracking',
    title: 'Vehicle Tracking',
    description: 'Track fleet / delivery vehicles in real time.',
    category: 'operations',
    moduleId: 'vehicle-tracking',
  },
  repairCenter: {
    id: 'repairCenter',
    title: 'Repair Center',
    description: 'Job cards, spare parts, and repair workflows.',
    category: 'operations',
    moduleId: 'repair-center',
  },
  medicineExpiry: {
    id: 'medicineExpiry',
    title: 'Medicine Expiry',
    description: 'Batch expiry alerts for pharmacies and clinics.',
    category: 'compliance',
    moduleId: 'medicine-expiry',
  },
  purchaseApproval: {
    id: 'purchaseApproval',
    title: 'Purchase Approval',
    description: 'Multi-step purchase order approval workflows.',
    category: 'finance',
    moduleId: 'purchase-approval',
  },
  AIForecasting: {
    id: 'AIForecasting',
    title: 'AI Forecasting',
    description: 'Demand and revenue forecasting with AI.',
    category: 'ai',
    moduleId: 'ai-forecasting',
  },
  AIHairRecommendation: {
    id: 'AIHairRecommendation',
    title: 'AI Hair Recommendation',
    description: 'Salon-specific AI look recommendations.',
    category: 'ai',
    moduleId: 'ai-hair-recommendation',
    businessTypes: ['salon'],
  },
  TableReservationAI: {
    id: 'TableReservationAI',
    title: 'Table Reservation AI',
    description: 'AI-assisted restaurant table reservations.',
    category: 'ai',
    moduleId: 'table-reservation-ai',
    businessTypes: ['restaurant', 'cafe'],
  },
  AmazonSync: {
    id: 'AmazonSync',
    title: 'Amazon Sync',
    description: 'Sync catalogue and orders with Amazon.',
    category: 'integrations',
    moduleId: 'amazon-sync',
    businessTypes: ['retail'],
  },
};

export function hasFeature(business, featureId) {
  const flags = business?.customFeatures || [];
  return flags.includes(featureId);
}

export function listFeatureDefs(ids = []) {
  return ids.map((id) => CUSTOM_FEATURES[id]).filter(Boolean);
}
