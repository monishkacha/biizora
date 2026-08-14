export function isManufacturingWorkspace(workspace) {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    if (
      path.includes('/smart-production-planner') ||
      path.includes('/raw-materials') ||
      path.includes('/production-orders') ||
      path.includes('/machines') ||
      path.includes('/warehouse') ||
      path.includes('/qc')
    ) {
      return true;
    }
  }
  if (!workspace) return false;
  if (typeof workspace === 'string') return workspace.toLowerCase() === 'manufacturing';
  return (
    workspace.category === 'manufacturing' ||
    workspace.businessType === 'manufacturing' ||
    workspace.slug === 'manufacturing-demo' ||
    workspace.email === 'manufacturing-demo@biizora.com' ||
    (workspace.name && workspace.name.toLowerCase().includes('manufactur')) ||
    (workspace.businessName && workspace.businessName.toLowerCase().includes('manufactur')) ||
    (workspace.type && workspace.type.toLowerCase().includes('manufactur'))
  );
}

export function isSalonWorkspace(workspace) {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/salon') || path.includes('/glow')) return true;
  }
  if (!workspace) return false;
  if (typeof workspace === 'string') return workspace.toLowerCase() === 'salon';
  const name = (workspace.name || workspace.businessName || '').toLowerCase();
  const slug = (workspace.slug || '').toLowerCase();
  const email = (workspace.email || '').toLowerCase();
  const type = (workspace.businessType || workspace.category || '').toLowerCase();
  return (
    type === 'salon' ||
    slug === 'salon-demo' ||
    slug === 'glow-salon-studio' ||
    email === 'salon-demo@biizora.com' ||
    name.includes('salon') ||
    name.includes('glow')
  );
}

export function isRestaurantWorkspace(workspace) {
  if (!workspace) return false;
  if (typeof workspace === 'string') return workspace.toLowerCase() === 'restaurant';
  return (
    workspace.category === 'restaurant' ||
    workspace.businessType === 'restaurant' ||
    workspace.slug === 'restaurant-demo' ||
    workspace.email === 'restaurant-demo@biizora.com' ||
    (workspace.name && (workspace.name.toLowerCase().includes('restaurant') || workspace.name.toLowerCase().includes('table') || workspace.name.toLowerCase().includes('olive')))
  );
}

export function isStationeryWorkspace(workspace) {
  if (!workspace) return false;
  if (typeof workspace === 'string') return workspace.toLowerCase() === 'stationery';
  return (
    workspace.category === 'stationery' ||
    workspace.slug === 'stationery-demo' ||
    workspace.businessType === 'stationery' ||
    workspace.email === 'stationery-demo@biizora.com' ||
    (workspace.name && (workspace.name.toLowerCase().includes('stationery') || workspace.name.toLowerCase().includes('xerox')))
  );
}

export function getIndustryCapabilities(workspaceOrType) {
  let type = 'retail';
  if (typeof workspaceOrType === 'string') {
    type = workspaceOrType.toLowerCase();
  } else if (workspaceOrType && typeof workspaceOrType === 'object') {
    if (isManufacturingWorkspace(workspaceOrType)) type = 'manufacturing';
    else if (isSalonWorkspace(workspaceOrType)) type = 'salon';
    else if (isRestaurantWorkspace(workspaceOrType)) type = 'restaurant';
    else if (isStationeryWorkspace(workspaceOrType)) type = 'stationery';
    else type = (workspaceOrType.businessType || workspaceOrType.category || 'retail').toLowerCase();
  }

  const isSalon = type === 'salon';
  const isRestaurant = type === 'restaurant';
  const isRetail = type === 'retail';
  const isManufacturing = type === 'manufacturing';
  const isStationery = type === 'stationery';

  return {
    businessType: type,
    osName: isSalon ? 'Salon OS' : isRestaurant ? 'Restaurant OS' : isManufacturing ? 'Manufacturing OS' : isStationery ? 'Stationery OS' : 'Retail OS',
    isSalon,
    isRestaurant,
    isRetail,
    isManufacturing,
    isStationery,

    // Capability Flags
    showAppointments: isSalon,
    showCalendar: isSalon,
    showServices: isSalon,
    showStylists: isSalon,
    showOnlineBooking: isSalon,

    showTables: isRestaurant,
    showKitchen: isRestaurant,
    showMenu: isRestaurant,
    showDeliveryIntegrations: isRestaurant, // Swiggy/Zomato ONLY on Restaurant

    showProductionOrders: isManufacturing,
    showRawMaterials: isManufacturing,
    showSmartPlanner: isManufacturing,
    showQuotations: isManufacturing,

    showSchoolOrders: isStationery,
    showPrintXerox: isStationery,
    showPickupCodes: isStationery || isRestaurant,

    showBarcode: isRetail || isStationery || isRestaurant,
    showDataMigration: isRetail || isManufacturing || isStationery,
    showSuppliers: isRetail || isManufacturing || isStationery,
  };
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
