import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';
import {
  STATIONERY_CATEGORIES,
  PRINT_SERVICES,
} from '../../config/workspaceFeatures';
import PrintableInvoice from '../../components/stationery/PrintableInvoice';
import {
  Search,
  Barcode,
  Plus,
  Trash2,
  Printer,
  Download,
  Share2,
  CheckCircle2,
  X,
  CreditCard,
  User,
  ShoppingBag,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Receipt,
  FileText,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function StationeryPOSBillingPage() {
  const {
    products,
    customers,
    addCustomer,
    createPosBill,
    stationeryCombos,
    company,
    stationerySettings,
    showToast,
  } = useBusiness();
  const navigate = useNavigate();

  // Tab & Search states
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'combos' | 'services'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');

  // Customer State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');
  const [newCustSchool, setNewCustSchool] = useState('');

  // Invoice Items State
  const [cartItems, setCartItems] = useState([]);
  const [billDiscount, setBillDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' | 'percent'
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Cash, UPI, Card, Credit, Split
  const [splitCashAmount, setSplitCashAmount] = useState(0);
  const [splitUpiAmount, setSplitUpiAmount] = useState(0);
  const [amountReceived, setAmountReceived] = useState(0);
  const [printFormat, setPrintFormat] = useState('a4'); // 'a4' | 'thermal'
  const [notes, setNotes] = useState('');

  // Print & Service Custom Entry State
  const [customPageCount, setCustomPageCount] = useState(1);

  // Completed Bill Modal
  const [completedBill, setCompletedBill] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const barcodeInputRef = useRef(null);

  // Focus barcode input on mount
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  // Handle Barcode Submission
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const match = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === barcodeInput.trim().toLowerCase()) ||
        (p.sku && p.sku.toLowerCase() === barcodeInput.trim().toLowerCase())
    );

    if (match) {
      addProductToCart(match);
      setBarcodeInput('');
      showToast(`Added: ${match.name}`);
    } else {
      showToast(`No product found with barcode: ${barcodeInput}`, 'error');
    }
  };

  // Add Product to Cart
  const addProductToCart = (product) => {
    if ((product.stock || 0) <= 0) {
      showToast(`Warning: ${product.name} is out of stock!`, 'warning');
    }
    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.productId === (product.id || product._id) && i.itemType === 'product');
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.id || product._id,
          itemType: 'product',
          description: product.name,
          quantity: 1,
          rate: Number(product.sellingPrice || product.price || 0),
          gstRate: Number(product.gstRate || 12),
          discount: 0,
          discountType: 'fixed',
          maxStock: product.stock,
        },
      ];
    });
  };

  // Add Combo / School Kit to Cart
  const addComboToCart = (combo) => {
    setCartItems((prev) => [
      ...prev,
      {
        comboId: combo.id || combo._id,
        itemType: 'combo',
        description: `[KIT] ${combo.name}`,
        quantity: 1,
        rate: Number(combo.sellingPrice || combo.price || 0),
        gstRate: Number(combo.gstRate || 12),
        discount: 0,
        discountType: 'fixed',
      },
    ]);
    showToast(`Added School Kit: ${combo.name}`);
  };

  // Add Service / Xerox to Cart
  const addServiceToCart = (service, pages = customPageCount) => {
    const qty = Number(pages) || 1;
    setCartItems((prev) => [
      ...prev,
      {
        itemType: 'service',
        serviceType: service.serviceType,
        description: service.name,
        quantity: qty,
        rate: Number(service.defaultRate),
        gstRate: 18,
        discount: 0,
        discountType: 'fixed',
      },
    ]);
    showToast(`Added Service: ${service.name} (${qty} ${service.unit}s)`);
  };

  // Quantity Change
  const updateQuantity = (idx, delta) => {
    setCartItems((prev) => {
      const next = [...prev];
      const newQty = next[idx].quantity + delta;
      if (newQty <= 0) {
        return next.filter((_, i) => i !== idx);
      }
      next[idx] = { ...next[idx], quantity: newQty };
      return next;
    });
  };

  // Line Rate Change
  const updateRate = (idx, newRate) => {
    setCartItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], rate: Math.max(0, Number(newRate)) };
      return next;
    });
  };

  // Line Discount Change
  const updateLineDiscount = (idx, newDisc) => {
    setCartItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], discount: Math.max(0, Number(newDisc)) };
      return next;
    });
  };

  // Remove Item
  const removeItem = (idx) => {
    setCartItems((prev) => prev.filter((_, i) => i !== idx));
  };

  // Calculations
  const calculateCart = () => {
    let subtotal = 0;
    let totalTax = 0;

    const processedItems = cartItems.map((item) => {
      const qty = Number(item.quantity) || 1;
      const rate = Number(item.rate) || 0;
      const disc = Number(item.discount) || 0;
      const lineBase = qty * rate;
      const taxable = Math.max(0, lineBase - disc);
      const gstRate = Number(item.gstRate) || 0;
      const taxAmt = (taxable * gstRate) / 100;
      const amount = taxable + taxAmt;

      subtotal += lineBase;
      totalTax += taxAmt;

      return {
        ...item,
        taxableValue: taxable,
        taxAmount: taxAmt,
        amount,
      };
    });

    const discVal = Number(billDiscount) || 0;
    const finalSubtotal = Math.max(0, subtotal - discVal);
    const cgst = totalTax / 2;
    const sgst = totalTax / 2;
    const grandTotal = Math.max(0, finalSubtotal + totalTax);

    return { processedItems, subtotal, finalSubtotal, totalTax, cgst, sgst, grandTotal };
  };

  const { processedItems, subtotal, totalTax, cgst, sgst, grandTotal } = calculateCart();

  // Handle Add Inline Customer
  const handleCreateCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      showToast('Customer name required', 'error');
      return;
    }
    try {
      const created = await addCustomer({
        name: newCustName.trim(),
        phone: newCustPhone.trim(),
        mobile: newCustPhone.trim(),
        gstin: newCustGstin.trim(),
        schoolOrCollege: newCustSchool.trim(),
      });
      setSelectedCustomer(created);
      setShowAddCustomerModal(false);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustGstin('');
      setNewCustSchool('');
    } catch (err) {
      showToast(err.message || 'Failed to create customer', 'error');
    }
  };

  // Process Bill Checkout
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      showToast('Please add items to cart before creating bill', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const billPayload = {
        customerId: selectedCustomer?.id || selectedCustomer?._id,
        customerName: selectedCustomer?.name || 'Walk-in Customer',
        customerPhone: selectedCustomer?.phone || selectedCustomer?.mobile || '',
        customerGstin: selectedCustomer?.gstin || selectedCustomer?.GSTNumber || '',
        items: cartItems.filter((i) => i.itemType !== 'combo'),
        comboItems: cartItems
          .filter((i) => i.itemType === 'combo')
          .map((i) => ({ comboId: i.comboId, quantity: i.quantity })),
        discount: Number(billDiscount) || 0,
        paymentMethod: paymentMethod === 'Split' ? `Cash: ₹${splitCashAmount} + UPI: ₹${splitUpiAmount}` : paymentMethod,
        paymentSplit: paymentMethod === 'Split' ? [{ method: 'Cash', amount: splitCashAmount }, { method: 'UPI', amount: splitUpiAmount }] : [],
        amountReceived: paymentMethod === 'Credit' ? 0 : Number(amountReceived) || grandTotal,
        status: paymentMethod === 'Credit' ? 'pending' : 'paid',
        invoiceType: cartItems.some((i) => i.itemType === 'service') ? 'xerox' : 'retail',
        notes,
      };

      const invoice = await createPosBill(billPayload);
      setCompletedBill(invoice);
      setCartItems([]);
      setBillDiscount(0);
      setAmountReceived(0);
      setNotes('');
      setSelectedCustomer(null);
    } catch (err) {
      showToast(err.message || 'Failed to complete bill transaction', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fix Blank Print Issue — wait for render then window.print()
  const handlePrintInvoice = async (billObj = completedBill) => {
    if (!billObj) return;
    showToast('Preparing printable invoice...');
    await new Promise((resolve) => requestAnimationFrame(resolve));
    window.print();
  };

  // PDF Download (Working)
  const handleDownloadPDF = async (billObj = completedBill) => {
    if (!billObj) return;
    showToast('Generating PDF...');
    try {
      const element = document.getElementById('printable-invoice');
      if (!element) {
        showToast('Printable invoice element not ready', 'error');
        return;
      }
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${billObj.invoiceNumber || 'INV-2026'}.pdf`);
      showToast('PDF Downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to download PDF', 'error');
    }
  };

  // WhatsApp Share Validation (+91)
  const handleWhatsAppShare = (billObj = completedBill) => {
    if (!billObj) return;
    const phoneRaw = selectedCustomer?.phone || selectedCustomer?.mobile || billObj.customerPhone || '';
    const cleanPhone = String(phoneRaw).replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('Please add customer mobile number to share invoice on WhatsApp.', 'warning');
      return;
    }

    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Hello ${billObj.customerName || 'Customer'},\nThank you for shopping at ${company?.name || 'PageCraft Stationery'}!\n\nInvoice No: ${billObj.invoiceNumber}\nAmount: ₹${Number(billObj.grandTotal || 0).toFixed(2)}\nPayment: ${billObj.paymentMethod || 'Cash'}\n\nHave a great day!`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, '_blank');
    showToast('Opening WhatsApp chat...');
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-[18px] border border-stone shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-bottle text-white flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-charcoal leading-tight">POS Billing Counter</h1>
            <p className="text-xs text-warm-gray">Stationery, School Kits & Print/Xerox Billing</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Format selector */}
          <div className="flex items-center bg-cream border border-stone rounded-xl p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPrintFormat('a4')}
              className={`px-3 py-1 rounded-lg transition-all ${printFormat === 'a4' ? 'bg-white text-charcoal shadow-xs' : 'text-warm-gray'}`}
            >
              A4 Format
            </button>
            <button
              type="button"
              onClick={() => setPrintFormat('thermal')}
              className={`px-3 py-1 rounded-lg transition-all ${printFormat === 'thermal' ? 'bg-white text-charcoal shadow-xs' : 'text-warm-gray'}`}
            >
              Thermal (80mm)
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate('/app/stationery/bills')}
            className="px-3.5 py-1.5 bg-cream hover:bg-stone/40 text-charcoal font-medium rounded-xl text-xs flex items-center gap-1.5 border border-stone transition-all"
          >
            <FileText className="w-3.5 h-3.5" /> All Bills
          </button>
        </div>
      </div>

      {/* Main Billing Grid: Left (Catalog & Inputs) / Right (Invoice Cart & Checkout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Customer Selection & Search */}
          <div className="bg-white p-4 rounded-[18px] border border-stone shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                <User className="w-4 h-4 text-green-bottle" /> Customer Details
              </label>
              <button
                type="button"
                onClick={() => setShowAddCustomerModal(true)}
                className="text-xs text-green-bottle hover:text-green-forest font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> New Customer
              </button>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedCustomer?.id || selectedCustomer?._id || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) setSelectedCustomer(null);
                  else setSelectedCustomer(customers.find((c) => (c.id || c._id) === val) || null);
                }}
                className="bz-input text-xs flex-1"
              >
                <option value="">Walk-in Customer (Default)</option>
                {customers.map((c) => (
                  <option key={c.id || c._id} value={c.id || c._id}>
                    {c.name} {c.phone || c.mobile ? `(${c.phone || c.mobile})` : ''} {c.schoolOrCollege ? `[${c.schoolOrCollege}]` : ''}
                  </option>
                ))}
              </select>
              {selectedCustomer && (
                <button
                  type="button"
                  onClick={() => setSelectedCustomer(null)}
                  className="px-3 py-2 bg-cream text-warm-gray hover:text-charcoal rounded-xl text-xs border border-stone"
                >
                  Clear
                </button>
              )}
            </div>

            {selectedCustomer && (
              <div className="p-2.5 bg-cream/40 rounded-xl border border-stone text-xs flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-charcoal">{selectedCustomer.name}</span>
                  {selectedCustomer.phone && <span className="text-warm-gray ml-2">Ph: {selectedCustomer.phone}</span>}
                  {selectedCustomer.schoolOrCollege && <span className="text-green-forest font-medium ml-2">School: {selectedCustomer.schoolOrCollege}</span>}
                </div>
                {Number(selectedCustomer.outstandingBalance) > 0 && (
                  <span className="text-terracotta font-bold">Credit Bal: ₹{selectedCustomer.outstandingBalance}</span>
                )}
              </div>
            )}
          </div>

          {/* Barcode & Search Input Header */}
          <div className="bg-white p-4 rounded-[18px] border border-stone shadow-subtle space-y-3">
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="w-4 h-4 text-warm-gray absolute left-3.5 top-3" />
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Scan barcode / enter SKU & press Enter..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="bz-input pl-10 text-xs font-mono"
                />
              </div>
              <button type="submit" className="bz-btn-primary px-4 text-xs">
                Scan
              </button>
            </form>

            {/* Catalog Mode Navigation Tabs */}
            <div className="flex border-b border-stone text-xs font-semibold gap-4 pt-1">
              <button
                type="button"
                onClick={() => setActiveTab('products')}
                className={`pb-2 border-b-2 flex items-center gap-1.5 transition-all ${
                  activeTab === 'products' ? 'border-green-bottle text-green-bottle' : 'border-transparent text-warm-gray hover:text-charcoal'
                }`}
              >
                <ShoppingBag className="w-4 h-4" /> Products Catalog ({filteredProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('combos')}
                className={`pb-2 border-b-2 flex items-center gap-1.5 transition-all ${
                  activeTab === 'combos' ? 'border-green-bottle text-green-bottle' : 'border-transparent text-warm-gray hover:text-charcoal'
                }`}
              >
                <GraduationCap className="w-4 h-4" /> School Kits ({stationeryCombos.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('services')}
                className={`pb-2 border-b-2 flex items-center gap-1.5 transition-all ${
                  activeTab === 'services' ? 'border-green-bottle text-green-bottle' : 'border-transparent text-warm-gray hover:text-charcoal'
                }`}
              >
                <Printer className="w-4 h-4" /> Xerox & Print ({PRINT_SERVICES.length})
              </button>
            </div>

            {/* Product Search & Category Filters (For Products Tab) */}
            {activeTab === 'products' && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-warm-gray absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="Search stationery items by name, SKU, brand..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bz-input pl-10 text-xs"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('')}
                    className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                      !selectedCategory ? 'bg-green-bottle text-white font-semibold' : 'bg-cream text-warm-gray hover:bg-stone/40'
                    }`}
                  >
                    All Items
                  </button>
                  {STATIONERY_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                        selectedCategory === cat ? 'bg-green-bottle text-white font-semibold' : 'bg-cream text-warm-gray hover:bg-stone/40'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TAB 1: Products Grid */}
          {activeTab === 'products' && (
            <div className="bg-white p-4 rounded-[18px] border border-stone shadow-subtle">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-warm-gray text-xs">
                  No stationery products found matching your search.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
                  {filteredProducts.map((p) => {
                    const isLow = (p.stock || 0) <= (p.minStockLevel || 10);
                    return (
                      <div
                        key={p.id || p._id}
                        onClick={() => addProductToCart(p)}
                        className="p-3 bg-cream/30 hover:bg-green-bottle/5 border border-stone/80 rounded-xl cursor-pointer transition-all hover:border-green-bottle/40 flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] uppercase font-bold text-warm-gray truncate">{p.category}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                              Stock: {p.stock}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-charcoal group-hover:text-green-bottle line-clamp-2 mt-1">
                            {p.name}
                          </h4>
                          {p.brand && <p className="text-[10px] text-warm-gray">{p.brand}</p>}
                        </div>
                        <div className="mt-2 pt-2 border-t border-stone/40 flex items-center justify-between">
                          <span className="text-xs font-bold text-charcoal">₹{p.sellingPrice || p.price}</span>
                          <span className="text-[10px] text-green-bottle font-bold group-hover:underline">+ Add</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: School Kits / Combos */}
          {activeTab === 'combos' && (
            <div className="bg-white p-4 rounded-[18px] border border-stone shadow-subtle space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-green-bottle" /> Bundled School Supply Kits
              </h3>
              {stationeryCombos.length === 0 ? (
                <div className="text-center py-10 text-warm-gray text-xs">
                  No pre-packaged school kits configured.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto">
                  {stationeryCombos.map((combo) => (
                    <div
                      key={combo.id || combo._id}
                      className="p-3.5 bg-cream/40 rounded-xl border border-stone space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-center">
                          <h4 className="text-xs font-bold text-charcoal">{combo.name}</h4>
                          <span className="text-xs font-bold text-green-bottle">₹{combo.sellingPrice}</span>
                        </div>
                        <p className="text-[10px] text-warm-gray mt-0.5">SKU: {combo.sku}</p>
                        <div className="mt-2 text-[11px] text-warm-gray space-y-0.5 border-t border-stone/40 pt-1.5">
                          {(combo.productDetails || combo.items || []).map((ci, idx) => (
                            <p key={idx}>• {ci.quantity}x {ci.name || ci.description || 'Product'}</p>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => addComboToCart(combo)}
                        className="w-full py-1.5 bg-green-bottle hover:bg-green-forest text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
                      >
                        + Add Kit to Invoice
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Print & Xerox Services */}
          {activeTab === 'services' && (
            <div className="bg-white p-4 rounded-[18px] border border-stone shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-teal-600" /> Xerox & Document Printing Services
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-warm-gray font-medium">Copies / Pages:</span>
                  <input
                    type="number"
                    min="1"
                    value={customPageCount}
                    onChange={(e) => setCustomPageCount(Math.max(1, Number(e.target.value)))}
                    className="w-16 px-2 py-1 border border-stone rounded-lg text-xs font-bold text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto">
                {PRINT_SERVICES.map((srv) => (
                  <div
                    key={srv.serviceType}
                    onClick={() => addServiceToCart(srv, customPageCount)}
                    className="p-3 bg-teal-50/40 hover:bg-teal-50 border border-teal-200/80 rounded-xl cursor-pointer transition-all hover:border-teal-400 flex flex-col justify-between group"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-charcoal group-hover:text-teal-700">{srv.name}</h4>
                      <p className="text-[10px] text-warm-gray mt-0.5">₹{srv.defaultRate} / {srv.unit}</p>
                    </div>
                    <div className="mt-2 pt-1.5 border-t border-teal-200/60 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-teal-800">
                        {customPageCount} {srv.unit}s = ₹{srv.defaultRate * customPageCount}
                      </span>
                      <span className="text-teal-700 font-bold group-hover:underline">+ Add</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL (5 cols) — Cart & Checkout Sticky Summary */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-[20px] border border-stone shadow-card space-y-4 sticky top-4">
            <div className="flex items-center justify-between border-b border-stone pb-3">
              <h2 className="text-sm font-bold text-charcoal flex items-center gap-2">
                <Receipt className="w-4 h-4 text-green-bottle" /> Invoice Cart ({cartItems.length} items)
              </h2>
              {cartItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCartItems([])}
                  className="text-xs text-terracotta hover:underline font-medium"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {/* Items Table */}
            <div className="max-h-64 overflow-y-auto border border-stone/60 rounded-xl divide-y divide-stone/40">
              {cartItems.length === 0 ? (
                <div className="py-12 text-center text-warm-gray text-xs space-y-1">
                  <ShoppingBag className="w-6 h-6 mx-auto text-warm-gray/60" />
                  <p>Cart is empty</p>
                  <p className="text-[11px]">Click items or scan barcodes on left to add</p>
                </div>
              ) : (
                cartItems.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-white text-xs flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-charcoal truncate">{item.description}</p>
                      <div className="flex items-center gap-2 text-[10px] text-warm-gray mt-0.5">
                        <span>Rate: ₹{item.rate}</span>
                        <span>GST: {item.gstRate}%</span>
                      </div>
                    </div>

                    {/* Qty Counter */}
                    <div className="flex items-center border border-stone rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(idx, -1)}
                        className="px-2 py-0.5 bg-cream hover:bg-stone/30 text-charcoal font-bold"
                      >
                        -
                      </button>
                      <span className="px-2.5 py-0.5 font-bold text-charcoal text-xs">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(idx, 1)}
                        className="px-2 py-0.5 bg-cream hover:bg-stone/30 text-charcoal font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right w-16">
                      <span className="font-bold text-charcoal">
                        ₹{(Number(item.quantity) * Number(item.rate)).toFixed(2)}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="text-warm-gray hover:text-terracotta p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Financial Summary */}
            <div className="space-y-2 pt-2 border-t border-stone text-xs">
              <div className="flex justify-between text-warm-gray">
                <span>Subtotal:</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>

              {/* Discount Entry */}
              <div className="flex items-center justify-between gap-2 py-1">
                <span className="text-warm-gray">Bill Discount:</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={billDiscount}
                    onChange={(e) => setBillDiscount(Math.max(0, Number(e.target.value)))}
                    className="w-20 px-2 py-1 border border-stone rounded-lg text-xs font-bold text-right"
                    placeholder="0"
                  />
                  <span className="text-warm-gray font-semibold">₹</span>
                </div>
              </div>

              <div className="flex justify-between text-warm-gray">
                <span>CGST (half):</span>
                <span>₹{cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-warm-gray">
                <span>SGST (half):</span>
                <span>₹{sgst.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-charcoal pt-2 border-t border-stone">
                <span>Grand Total:</span>
                <span className="text-lg text-green-bottle font-display">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Section */}
            <div className="space-y-3 pt-2 border-t border-stone">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal block">Payment Method</label>
              <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
                {['Cash', 'UPI', 'Card', 'Credit'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      setPaymentMethod(mode);
                      if (mode === 'Cash' && !amountReceived) setAmountReceived(grandTotal);
                    }}
                    className={`py-2 rounded-xl border text-center transition-all ${
                      paymentMethod === mode ? 'bg-green-bottle text-white border-green-bottle shadow-xs' : 'bg-cream text-charcoal border-stone hover:bg-stone/30'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {/* Amount Received & Change Balance Calculation */}
              {paymentMethod !== 'Credit' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-warm-gray block mb-1">Amount Received (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={amountReceived}
                      onChange={(e) => setAmountReceived(Number(e.target.value))}
                      className="bz-input text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-warm-gray block mb-1">Change / Balance (₹)</label>
                    <div className="bz-input text-xs font-bold bg-cream/60 flex items-center">
                      ₹{Math.max(0, amountReceived - grandTotal).toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Checkout Action Button */}
            <button
              type="button"
              disabled={cartItems.length === 0 || isSubmitting}
              onClick={handleCheckout}
              className="w-full py-3 bg-yellow-butter hover:bg-yellow-honey text-charcoal font-bold rounded-[16px] text-sm shadow-yellow flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating Bill...' : `Complete & Print Bill (₹${grandTotal.toFixed(2)})`}
            </button>
          </div>
        </div>
      </div>

      {/* INLINE ADD CUSTOMER MODAL */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-md w-full p-6 shadow-elev space-y-4">
            <div className="flex justify-between items-center border-b border-stone pb-3">
              <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
                <User className="w-4 h-4 text-green-bottle" /> Add New Customer
              </h3>
              <button type="button" onClick={() => setShowAddCustomerModal(false)} className="p-1 rounded-full hover:bg-cream">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar / St. Xavier School"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="bz-input"
                />
              </div>
              <div>
                <label className="font-semibold text-charcoal block mb-1">Mobile Number (Indian +91)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="bz-input"
                />
              </div>
              <div>
                <label className="font-semibold text-charcoal block mb-1">GST Number (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 27AAAAA0000A1Z5"
                  value={newCustGstin}
                  onChange={(e) => setNewCustGstin(e.target.value)}
                  className="bz-input uppercase"
                />
              </div>
              <div>
                <label className="font-semibold text-charcoal block mb-1">School / College Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. DPS International"
                  value={newCustSchool}
                  onChange={(e) => setNewCustSchool(e.target.value)}
                  className="bz-input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-4 py-2 bg-cream text-charcoal rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="bz-btn-primary px-4 text-xs">
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* COMPLETED BILL MODAL & PRINT PREVIEW */}
      {completedBill && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] max-w-3xl w-full p-6 shadow-elev space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-stone pb-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
                <div>
                  <h3 className="text-base font-bold text-charcoal">Invoice #{completedBill.invoiceNumber} Generated!</h3>
                  <p className="text-xs text-warm-gray">Transaction recorded successfully.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCompletedBill(null)}
                className="p-1.5 rounded-full hover:bg-cream text-warm-gray"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-cream/60 p-3 rounded-2xl border border-stone">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrintInvoice(completedBill)}
                  className="px-4 py-2 bg-green-bottle hover:bg-green-forest text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Print Invoice
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPDF(completedBill)}
                  className="px-4 py-2 bg-white text-charcoal border border-stone hover:bg-cream rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" /> Download PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleWhatsAppShare(completedBill)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Share2 className="w-4 h-4" /> Share WhatsApp
                </button>
              </div>

              <button
                type="button"
                onClick={() => setCompletedBill(null)}
                className="px-4 py-2 bg-yellow-butter hover:bg-yellow-honey text-charcoal rounded-xl text-xs font-bold"
              >
                + New Sale
              </button>
            </div>

            {/* Printable Invoice Component Preview */}
            <div className="border border-stone rounded-2xl p-4 bg-gray-50/50 max-h-[460px] overflow-y-auto">
              <PrintableInvoice
                invoice={completedBill}
                company={company}
                settings={stationerySettings}
                format={printFormat}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
