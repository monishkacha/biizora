/**
 * Master Data Configuration for Biizora Smart Production Planner
 * Comprehensive Manufacturing Sectors & Industrial Measurement Units
 */

export const MANUFACTURING_CATEGORIES = [
  {
    label: 'Plastic & Polymer',
    options: [
      'HDPE & Plastic Pipe',
      'PVC Products',
      'Injection Molding',
      'Blow Molding',
      'Plastic Packaging',
      'Polymer Compounding',
      'Masterbatch Manufacturing',
      'Flexible Plastic Products',
      'Rigid Plastic Products',
      'Plastic Recycling',
    ],
  },
  {
    label: 'Textile & Apparel',
    options: [
      'Textiles & Garment',
      'Spinning',
      'Weaving',
      'Knitting',
      'Dyeing & Printing',
      'Garment Manufacturing',
      'Technical Textiles',
      'Home Furnishing Textiles',
      'Yarn Manufacturing',
      'Fabric Processing',
    ],
  },
  {
    label: 'Food & Beverage',
    options: [
      'Food Processing',
      'Beverage Manufacturing',
      'Dairy Products',
      'Bakery & Confectionery',
      'Snacks & Namkeen',
      'Frozen Foods',
      'Spice Processing',
      'Edible Oil Production',
      'Fruit & Vegetable Processing',
      'Packaged Foods',
    ],
  },
  {
    label: 'Metal & Engineering',
    options: [
      'Metal Fabrication',
      'Sheet Metal Manufacturing',
      'Steel Products',
      'Aluminium Products',
      'CNC Machining',
      'Casting & Foundry',
      'Forging',
      'Welding & Fabrication',
      'Precision Engineering',
      'Industrial Components',
    ],
  },
  {
    label: 'Packaging & Printing',
    options: [
      'Packaging Materials',
      'Corrugated Box Manufacturing',
      'Flexible Packaging',
      'Paper Packaging',
      'Printing & Packaging',
      'Label Manufacturing',
      'Carton Manufacturing',
      'Lamination & Coating',
    ],
  },
  {
    label: 'Chemical & Process',
    options: [
      'Chemical Manufacturing',
      'Specialty Chemicals',
      'Paints & Coatings',
      'Adhesives & Sealants',
      'Detergents & Cleaning Products',
      'Fertilizers',
      'Industrial Chemicals',
      'Resins & Polymers',
    ],
  },
  {
    label: 'Pharmaceutical & Healthcare',
    options: [
      'Pharmaceutical Manufacturing',
      'API Manufacturing',
      'Medical Devices',
      'Healthcare Consumables',
      'Nutraceuticals',
      'Cosmetics & Personal Care',
      'Herbal & Ayurvedic Products',
    ],
  },
  {
    label: 'Electrical & Electronics',
    options: [
      'Electronics Assembly',
      'PCB Manufacturing',
      'Electrical Equipment',
      'Cable & Wire Manufacturing',
      'Consumer Electronics',
      'Industrial Electronics',
      'Battery & Energy Storage',
    ],
  },
  {
    label: 'Construction Materials',
    options: [
      'Cement Products',
      'Concrete Products',
      'Tiles & Ceramics',
      'Glass Manufacturing',
      'Building Materials',
      'Stone Processing',
      'Plywood & Laminates',
    ],
  },
  {
    label: 'Wood & Furniture',
    options: [
      'Furniture Manufacturing',
      'Wood Processing',
      'Modular Furniture',
      'Plywood Manufacturing',
      'Interior Products',
      'Wooden Packaging',
    ],
  },
  {
    label: 'Automotive & Transport',
    options: [
      'Automotive Components',
      'Auto Parts Manufacturing',
      'Tyre & Rubber Products',
      'Vehicle Assembly',
      'Industrial Rubber Products',
    ],
  },
  {
    label: 'Other Industries',
    options: [
      'Paper & Pulp',
      'Leather Products',
      'Jewellery Manufacturing',
      'Sports Goods',
      'Toys & Consumer Products',
      'Agricultural Equipment',
      'Custom / Other Category',
    ],
  },
];

export const INDUSTRIAL_UNITS = [
  {
    label: 'Weight',
    options: ['mg', 'g', 'kg', 'quintal', 'ton', 'metric ton', 'lb', 'oz'],
  },
  {
    label: 'Length',
    options: ['mm', 'cm', 'm', 'meter', 'km', 'inch', 'ft', 'yard'],
  },
  {
    label: 'Area',
    options: ['sq mm', 'sq cm', 'sq m', 'sq ft', 'sq yard', 'acre'],
  },
  {
    label: 'Volume',
    options: ['ml', 'l', 'liter', 'cubic cm', 'cubic meter', 'gallon'],
  },
  {
    label: 'Count',
    options: [
      'piece',
      'pcs',
      'unit',
      'set',
      'box',
      'carton',
      'bundle',
      'packet',
      'bag',
      'roll',
      'sheet',
      'coil',
      'reel',
      'pallet',
      'drum',
      'container',
    ],
  },
  {
    label: 'Textile Specific',
    options: ['meter fabric', 'yard fabric', 'kg yarn', 'cone', 'bale', 'spindle'],
  },
  {
    label: 'Pipe & Extrusion',
    options: ['meter pipe', 'foot pipe', 'coil pipe', 'bundle pipe'],
  },
  {
    label: 'Chemical Specific',
    options: ['kg powder', 'liter liquid', 'drum 200L', 'IBC tank', 'barrel'],
  },
  {
    label: 'Packaging Specific',
    options: ['roll', 'sheet', 'ream', 'carton box', 'corrugated sheet'],
  },
  {
    label: 'Specialized & Custom',
    options: [
      'sack',
      'tray',
      'mold',
      'batch',
      'lot',
      'spool',
      'cartridge',
      'capsule',
      'tablet',
      'Custom / Other Unit',
    ],
  },
];

export const SMART_UNIT_SUGGESTIONS = {
  'HDPE & Plastic Pipe': ['kg', 'ton', 'meter pipe', 'coil pipe'],
  'PVC Products': ['kg', 'ton', 'meter pipe', 'piece'],
  'Plastic Packaging': ['kg', 'roll', 'sheet', 'pcs'],
  'Textiles & Garment': ['meter fabric', 'kg', 'bale', 'pcs'],
  Spinning: ['kg yarn', 'cone', 'bale', 'spindle'],
  Weaving: ['meter fabric', 'yard fabric', 'roll'],
  'Garment Manufacturing': ['pcs', 'piece', 'box', 'carton'],
  'Food Processing': ['kg', 'liter', 'packet', 'carton', 'bag'],
  'Beverage Manufacturing': ['liter', 'ml', 'carton', 'container'],
  'Dairy Products': ['liter', 'kg', 'packet', 'drum'],
  'Metal Fabrication': ['kg', 'ton', 'piece', 'sheet', 'sq ft'],
  'Steel Products': ['kg', 'ton', 'meter', 'piece'],
  'Packaging Materials': ['roll', 'sheet', 'carton', 'pcs', 'ream'],
  'Corrugated Box Manufacturing': ['carton box', 'corrugated sheet', 'bundle', 'pcs'],
  'Chemical Manufacturing': ['kg', 'liter', 'drum 200L', 'IBC tank', 'barrel'],
  'Specialty Chemicals': ['kg powder', 'liter liquid', 'drum 200L', 'container'],
  'Pharmaceutical Manufacturing': ['kg', 'liter', 'batch', 'capsule', 'tablet', 'box'],
  'Electronics Assembly': ['pcs', 'unit', 'set', 'board', 'box'],
  'Cement Products': ['kg', 'bag', 'ton', 'cubic meter'],
  'Furniture Manufacturing': ['piece', 'set', 'sq ft', 'box'],
  'Auto Parts Manufacturing': ['pcs', 'set', 'kg', 'box'],
};

/**
 * Returns smart suggested units for a given category name
 */
export function getSuggestedUnits(category) {
  if (!category) return ['kg', 'ton', 'piece', 'meter'];
  if (SMART_UNIT_SUGGESTIONS[category]) {
    return SMART_UNIT_SUGGESTIONS[category];
  }
  // Generic fallback by broad domain keyword
  const catLower = category.toLowerCase();
  if (catLower.includes('pipe') || catLower.includes('plastic') || catLower.includes('polymer')) {
    return ['kg', 'ton', 'meter pipe', 'piece'];
  }
  if (catLower.includes('textile') || catLower.includes('garment') || catLower.includes('fabric')) {
    return ['meter fabric', 'kg', 'bale', 'pcs'];
  }
  if (catLower.includes('food') || catLower.includes('beverage') || catLower.includes('dairy')) {
    return ['kg', 'liter', 'packet', 'carton'];
  }
  if (catLower.includes('metal') || catLower.includes('steel') || catLower.includes('engineering')) {
    return ['kg', 'ton', 'piece', 'sheet'];
  }
  if (catLower.includes('packaging') || catLower.includes('paper') || catLower.includes('box')) {
    return ['roll', 'sheet', 'carton', 'pcs'];
  }
  if (catLower.includes('chemical') || catLower.includes('paint') || catLower.includes('pharma')) {
    return ['kg', 'liter', 'drum 200L', 'IBC tank'];
  }
  return ['kg', 'ton', 'piece', 'unit', 'box'];
}
