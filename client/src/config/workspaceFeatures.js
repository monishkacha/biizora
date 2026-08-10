export function isStationeryWorkspace(workspace) {
  if (!workspace) return false;
  return (
    workspace.category === 'stationery' ||
    workspace.slug === 'stationery-demo' ||
    workspace.businessType === 'stationery' ||
    workspace.email === 'stationery-demo@biizora.com'
  );
}

export const STATIONERY_CATEGORIES = [
  'Notebooks',
  'Pens',
  'Pencils',
  'Erasers',
  'Sharpeners',
  'Geometry Box',
  'School Bags',
  'Files & Folders',
  'Art & Craft',
  'Printing Paper',
  'Xerox Paper',
  'Markers',
  'Highlighters',
  'Office Supplies',
  'Greeting Cards',
  'Gift Items',
];

export const PRINT_SERVICES = [
  { name: 'Black & White Xerox', defaultRate: 2, unit: 'page', serviceType: 'bw_xerox' },
  { name: 'Color Xerox', defaultRate: 10, unit: 'page', serviceType: 'color_xerox' },
  { name: 'Printout B/W', defaultRate: 5, unit: 'page', serviceType: 'bw_printout' },
  { name: 'Printout Color', defaultRate: 15, unit: 'page', serviceType: 'color_printout' },
  { name: 'Lamination A4', defaultRate: 30, unit: 'sheet', serviceType: 'lamination_a4' },
  { name: 'Lamination ID Card', defaultRate: 20, unit: 'card', serviceType: 'lamination_id' },
  { name: 'Spiral Binding', defaultRate: 40, unit: 'book', serviceType: 'spiral_binding' },
  { name: 'Project Binding', defaultRate: 100, unit: 'book', serviceType: 'project_binding' },
  { name: 'Photo Copy', defaultRate: 3, unit: 'page', serviceType: 'photo_copy' },
];

export const workspaceFeatures = {
  stationery: {
    sidebar: [
      { id: 'dashboard', label: 'Dashboard', path: '/app', icon: 'LayoutDashboard' },
      { id: 'new-bill', label: 'New Bill', path: '/app/stationery/billing', icon: 'Receipt' },
      { id: 'bills', label: 'Bills', path: '/app/stationery/bills', icon: 'FileText' },
      { id: 'products', label: 'Products', path: '/app/stationery/products', icon: 'Package' },
      { id: 'inventory', label: 'Inventory', path: '/app/stationery/inventory', icon: 'Boxes' },
      { id: 'customers', label: 'Customers', path: '/app/stationery/customers', icon: 'Users' },
      { id: 'vendors', label: 'Vendors', path: '/app/stationery/vendors', icon: 'Store' },
      { id: 'school-orders', label: 'School Orders', path: '/app/stationery/school-orders', icon: 'GraduationCap' },
      { id: 'print-xerox', label: 'Print & Xerox', path: '/app/stationery/print-xerox', icon: 'Printer' },
      { id: 'reports', label: 'Reports', path: '/app/stationery/reports', icon: 'BarChart3' },
      { id: 'settings', label: 'Settings', path: '/app/stationery/settings', icon: 'Settings' },
    ],
    dashboardCards: [
      'todaySales',
      'billsToday',
      'lowStockItems',
      'pendingSchoolOrders',
      'xeroxRevenue',
    ],
    billing: {
      printServices: true,
      schoolKits: true,
      barcodeSupport: true,
      thermalPrinting: true,
      whatsappPdfShare: true,
    },
  },
};
