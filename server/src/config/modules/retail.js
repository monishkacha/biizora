export const retailModules = [
  { id: 'barcode', title: 'Barcode', icon: 'Barcode', route: '/app/barcode', permission: 'products.read', businessTypes: ['retail', 'stationery'], requiredPlan: 'growth', description: 'Barcode scanning', category: 'retail' },
  { id: 'pos', title: 'POS', icon: 'MonitorSmartphone', route: '/app/pos', permission: 'invoices.write', businessTypes: ['retail', 'stationery'], requiredPlan: 'starter', description: 'Point of sale', category: 'retail' },
  { id: 'returns', title: 'Returns', icon: 'Undo2', route: '/app/returns', permission: 'invoices.write', businessTypes: ['retail'], requiredPlan: 'starter', description: 'Returns and refunds', category: 'retail' },
  { id: 'purchase-orders', title: 'Purchase Orders', icon: 'ClipboardList', route: '/app/purchase-orders', permission: 'products.write', businessTypes: ['retail', 'manufacturing', 'stationery'], requiredPlan: 'growth', description: 'Purchase orders', category: 'procurement' },
  { id: 'discount-rules', title: 'Discount Rules', icon: 'Percent', route: '/app/discount-rules', permission: 'settings.write', businessTypes: ['retail'], requiredPlan: 'growth', description: 'Discount engines', category: 'retail' },
  { id: 'offers', title: 'Offers', icon: 'Tag', route: '/app/offers', permission: 'settings.write', businessTypes: ['retail'], requiredPlan: 'growth', description: 'Promotional offers', category: 'retail' },
  { id: 'gst-billing', title: 'GST Billing', icon: 'Receipt', route: '/app/gst-billing', permission: 'invoices.write', businessTypes: ['retail', 'stationery'], requiredPlan: 'starter', description: 'GST-compliant billing', category: 'finance' },
  { id: 'stock-alerts', title: 'Stock Alerts', icon: 'AlertTriangle', route: '/app/stock-alerts', permission: 'products.read', businessTypes: ['retail', 'stationery'], requiredPlan: 'starter', description: 'Low stock alerts', category: 'retail' },
];
