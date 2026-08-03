// Initial seed data tailored for Indian SMEs, Freelancers, and Agencies

export const defaultCompany = {
  name: "Biizora Technologies Pvt Ltd",
  tradeName: "Biizora Tech",
  gstin: "29ABCDE1234F1Z5",
  pan: "ABCDE1234F",
  email: "adrian.hale@biizora.demo",
  phone: "+91 98765 43210",
  address: "Suite 402, Innovate Tech Park, Koramangala",
  city: "Bengaluru",
  state: "Karnataka",
  pincode: "560095",
  country: "India",
  website: "https://Biizora.in",
  logoUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
  bankDetails: {
    bankName: "HDFC Bank Ltd",
    accountName: "Biizora Technologies Pvt Ltd",
    accountNumber: "50200012345678",
    ifscCode: "HDFC0001234",
    branch: "Koramangala 4th Block",
    upiId: "Biizora@hdfcbank"
  },
  currency: "INR",
  currencySymbol: "₹",
  invoicePrefix: "INV-2026-",
  defaultTaxRate: 18,
  invoiceTheme: "modern"
};

export const defaultCustomers = [
  {
    id: "cust-1",
    name: "Apex Global Solutions",
    contactPerson: "Rahul Verma",
    email: "rahul@apexglobal.com",
    phone: "+91 98111 22334",
    gstin: "27AAACA1234A1Z1",
    pan: "AAACA1234A",
    address: "Plot 42, Bandra Kurla Complex",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400051",
    isIgst: true, // Different state than KA
    outstandingBalance: 45000,
    totalSpent: 380000,
    status: "active",
    category: "Enterprise",
    notes: "Key enterprise client. NET 30 payment terms."
  },
  {
    id: "cust-2",
    name: "Zenith Digital Media",
    contactPerson: "Priya Sharma",
    email: "priya@zenithdigital.in",
    phone: "+91 98222 33445",
    gstin: "29BBBCB5678B1Z2",
    pan: "BBBCB5678B",
    address: "88, MG Road, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    isIgst: false, // Same state (CGST + SGST)
    outstandingBalance: 0,
    totalSpent: 195000,
    status: "active",
    category: "Agency",
    notes: "Monthly retainer for UI/UX consulting."
  },
  {
    id: "cust-3",
    name: "Nova Retail & Logistics",
    contactPerson: "Vikram Malhotra",
    email: "accounts@novaretail.co.in",
    phone: "+91 98333 44556",
    gstin: "36CCCCD9012C1Z3",
    pan: "CCCCD9012C",
    address: "Hitec City Phase II",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "500081",
    isIgst: true,
    outstandingBalance: 112000,
    totalSpent: 540000,
    status: "active",
    category: "Retailer",
    notes: "Overdue payments pending for INV-2026-004."
  },
  {
    id: "cust-4",
    name: "Kaveri Engineering Works",
    contactPerson: "Srinivas Rao",
    email: "srinivas@kaverieng.com",
    phone: "+91 98444 55667",
    gstin: "33DDDDE3456D1Z4",
    pan: "DDDDE3456D",
    address: "Industrial Estate, Guindy",
    city: "Chennai",
    state: "Tamil Nadu",
    pincode: "600032",
    isIgst: true,
    outstandingBalance: 18500,
    totalSpent: 92000,
    status: "active",
    category: "Manufacturer",
    notes: "Supplies custom hardware components."
  }
];

export const defaultProducts = [
  {
    id: "prod-1",
    name: "SaaS Software Subscription (Annual)",
    type: "service",
    sku: "AMX-SAAS-ANN",
    hsnSac: "998314",
    category: "Software",
    sellingPrice: 49999,
    costPrice: 12000,
    gstRate: 18,
    stock: 999,
    minStockLevel: 10,
    unit: "license",
    description: "Cloud ERP & Invoice Management License for 1 Year."
  },
  {
    id: "prod-2",
    name: "AI Automation Consulting",
    type: "service",
    sku: "AMX-CONS-AI",
    hsnSac: "998313",
    category: "Services",
    sellingPrice: 75000,
    costPrice: 25000,
    gstRate: 18,
    stock: 100,
    minStockLevel: 5,
    unit: "project",
    description: "Custom AI Workflow & Integration Implementation."
  },
  {
    id: "prod-3",
    name: "POS Smart Terminal X1",
    type: "product",
    sku: "AMX-HW-POS1",
    hsnSac: "847130",
    category: "Hardware",
    sellingPrice: 16500,
    costPrice: 11000,
    gstRate: 18,
    stock: 14,
    minStockLevel: 15, // Low stock warning trigger!
    unit: "unit",
    description: "Touchscreen Android POS Machine with Thermal Printer."
  },
  {
    id: "prod-4",
    name: "Thermal Receipt Roll (Box of 50)",
    type: "product",
    sku: "AMX-ACC-ROLL50",
    hsnSac: "481190",
    category: "Supplies",
    sellingPrice: 1250,
    costPrice: 750,
    gstRate: 12,
    stock: 4, // Low stock alert
    minStockLevel: 10,
    unit: "box",
    description: "High sensitivity 80mm thermal paper rolls."
  }
];

export const defaultInvoices = [
  {
    id: "inv-101",
    invoiceNumber: "INV-2026-001",
    customerId: "cust-1",
    customerName: "Apex Global Solutions",
    customerGstin: "27AAACA1234A1Z1",
    issueDate: "2026-07-15",
    dueDate: "2026-08-14",
    items: [
      {
        id: "item-1",
        description: "SaaS Software Subscription (Annual)",
        hsnSac: "998314",
        quantity: 2,
        rate: 49999,
        gstRate: 18,
        amount: 99998,
        taxAmount: 17999.64
      }
    ],
    subtotal: 99998,
    discount: 5000,
    taxableAmount: 94998,
    cgst: 0,
    sgst: 0,
    igst: 17099.64,
    totalTax: 17099.64,
    shippingCharge: 0,
    grandTotal: 112097.64,
    status: "paid",
    paidAmount: 112097.64,
    paymentMethod: "Razorpay / UPI",
    notes: "Payment received in full. Thank you for your business!",
    terms: "Goods once sold are non-refundable."
  },
  {
    id: "inv-102",
    invoiceNumber: "INV-2026-002",
    customerId: "cust-2",
    customerName: "Zenith Digital Media",
    customerGstin: "29BBBCB5678B1Z2",
    issueDate: "2026-07-20",
    dueDate: "2026-08-04",
    items: [
      {
        id: "item-2",
        description: "AI Automation Consulting",
        hsnSac: "998313",
        quantity: 1,
        rate: 75000,
        gstRate: 18,
        amount: 75000,
        taxAmount: 13500
      }
    ],
    subtotal: 75000,
    discount: 0,
    taxableAmount: 75000,
    cgst: 6750,
    sgst: 6750,
    igst: 0,
    totalTax: 13500,
    shippingCharge: 0,
    grandTotal: 88500,
    status: "paid",
    paidAmount: 88500,
    paymentMethod: "Bank Transfer (NEFT)",
    notes: "Quarterly retainer payment.",
    terms: "Payment terms 15 days."
  },
  {
    id: "inv-103",
    invoiceNumber: "INV-2026-003",
    customerId: "cust-3",
    customerName: "Nova Retail & Logistics",
    customerGstin: "36CCCCD9012C1Z3",
    issueDate: "2026-07-01",
    dueDate: "2026-07-16",
    items: [
      {
        id: "item-3",
        description: "POS Smart Terminal X1",
        hsnSac: "847130",
        quantity: 5,
        rate: 16500,
        gstRate: 18,
        amount: 82500,
        taxAmount: 14850
      }
    ],
    subtotal: 82500,
    discount: 2500,
    taxableAmount: 80000,
    cgst: 0,
    sgst: 0,
    igst: 14400,
    totalTax: 14400,
    shippingCharge: 500,
    grandTotal: 94900,
    status: "overdue",
    paidAmount: 0,
    paymentMethod: "Pending",
    notes: "Urgent: Payment overdue by 17 days.",
    terms: "18% p.a. interest charged on delayed payments."
  },
  {
    id: "inv-104",
    invoiceNumber: "INV-2026-004",
    customerId: "cust-4",
    customerName: "Kaveri Engineering Works",
    customerGstin: "33DDDDE3456D1Z4",
    issueDate: "2026-07-28",
    dueDate: "2026-08-12",
    items: [
      {
        id: "item-4",
        description: "Thermal Receipt Roll (Box of 50)",
        hsnSac: "481190",
        quantity: 10,
        rate: 1250,
        gstRate: 12,
        amount: 12500,
        taxAmount: 1500
      }
    ],
    subtotal: 12500,
    discount: 0,
    taxableAmount: 12500,
    cgst: 0,
    sgst: 0,
    igst: 1500,
    totalTax: 1500,
    shippingCharge: 350,
    grandTotal: 14350,
    status: "pending",
    paidAmount: 0,
    paymentMethod: "UPI / QR",
    notes: "Delivered via BlueDart Express.",
    terms: "NET 15 payment terms."
  }
];

export const defaultExpenses = [
  {
    id: "exp-1",
    title: "AWS & Cloud Server Hosting",
    category: "Office & Tech",
    amount: 24500,
    date: "2026-07-05",
    paymentMode: "Corporate Card",
    vendor: "Amazon Web Services",
    gstClaimable: true,
    gstAmount: 3737,
    status: "paid",
    receiptUrl: "https://via.placeholder.com/150",
    notes: "Monthly production compute clusters."
  },
  {
    id: "exp-2",
    title: "Koramangala Office Rent",
    category: "Rent",
    amount: 65000,
    date: "2026-07-01",
    paymentMode: "Bank Transfer",
    vendor: "Innovate Park Developers",
    gstClaimable: true,
    gstAmount: 9915,
    status: "paid",
    receiptUrl: "https://via.placeholder.com/150",
    notes: "Monthly office lease."
  },
  {
    id: "exp-3",
    title: "Google Workspace & Software Tools",
    category: "Office & Tech",
    amount: 12800,
    date: "2026-07-10",
    paymentMode: "Corporate Card",
    vendor: "Google India",
    gstClaimable: true,
    gstAmount: 1952,
    status: "paid",
    receiptUrl: "",
    notes: "25 Workspace accounts."
  },
  {
    id: "exp-4",
    title: "Team Performance Bonus & Stipends",
    category: "Salary",
    amount: 145000,
    date: "2026-07-31",
    paymentMode: "Bank Transfer",
    vendor: "Internal Payroll",
    gstClaimable: false,
    gstAmount: 0,
    status: "paid",
    receiptUrl: "",
    notes: "July payroll disbursement."
  },
  {
    id: "exp-5",
    title: "Digital Marketing & LinkedIn Ads",
    category: "Marketing",
    amount: 32000,
    date: "2026-07-22",
    paymentMode: "Corporate Card",
    vendor: "LinkedIn Ireland",
    gstClaimable: true,
    gstAmount: 4881,
    status: "paid",
    receiptUrl: "",
    notes: "B2B SaaS lead acquisition campaign."
  }
];

export const defaultAIInsights = [
  {
    id: "ai-1",
    type: "recommendation",
    title: "Optimize Overdue Receivables",
    impact: "High",
    confidence: "94%",
    message: "Nova Retail & Logistics has an overdue payment of ₹94,900 (INV-2026-003). Send an automated WhatsApp reminder with a 2% early payment discount offer to accelerate collection.",
    action: "Send AI Reminder"
  },
  {
    id: "ai-2",
    type: "inventory",
    title: "Reorder Thermal Receipt Rolls",
    impact: "Medium",
    confidence: "98%",
    message: "Thermal Receipt Rolls stock is down to 4 units (below min threshold of 10). Lead time is 4 days. Reorder 20 boxes to prevent stockouts.",
    action: "Generate PO"
  },
  {
    id: "ai-3",
    type: "cashflow",
    title: "Strong 30-Day Cash Reserve",
    impact: "Positive",
    confidence: "89%",
    message: "Based on recurring client retainers and projected invoices, your August 2026 cash balance is predicted to reach ₹4,85,000 (+14.2% MoM growth).",
    action: "View Projection"
  }
];

export const defaultWorkspaces = [
  { id: "ws-1", name: "Biizora Tech HQ", plan: "Pro Tier", role: "Owner", membersCount: 5 },
  { id: "ws-2", name: "Apex Retail Outlet", plan: "Starter Tier", role: "Manager", membersCount: 2 }
];
