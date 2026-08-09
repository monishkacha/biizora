export const stationeryModules = [
  { id: 'retail-billing', title: 'Retail Billing', icon: 'Receipt', route: '/app/retail-billing', permission: 'invoices.write', businessTypes: ['stationery'], requiredPlan: 'starter', description: 'Counter billing', category: 'stationery' },
  { id: 'wholesale', title: 'Wholesale', icon: 'Store', route: '/app/wholesale', permission: 'invoices.write', businessTypes: ['stationery'], requiredPlan: 'growth', description: 'Wholesale orders', category: 'stationery' },
  { id: 'school-orders', title: 'School Orders', icon: 'GraduationCap', route: '/app/school-orders', permission: 'invoices.write', businessTypes: ['stationery'], requiredPlan: 'growth', description: 'School supply orders', category: 'stationery' },
  { id: 'bulk-pricing', title: 'Bulk Pricing', icon: 'Layers', route: '/app/bulk-pricing', permission: 'products.write', businessTypes: ['stationery'], requiredPlan: 'growth', description: 'Tiered bulk pricing', category: 'stationery' },
  { id: 'sales-reports', title: 'Sales Reports', icon: 'BarChart3', route: '/app/sales-reports', permission: 'reports.read', businessTypes: ['stationery'], requiredPlan: 'starter', description: 'Sales reporting', category: 'stationery' },
];
