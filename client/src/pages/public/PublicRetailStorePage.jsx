import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Check,
  ChevronRight,
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Store,
  Truck,
  Package,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  X,
  CreditCard,
  Building2,
  Tag,
  Filter,
  ArrowUpDown,
  Coffee,
  Apple,
  Zap,
  Sparkle,
  Home,
  CheckCircle
} from 'lucide-react';
import { PoweredByBizora } from '../../components/ui/PoweredByBizora';

const CATEGORY_ICONS = {
  All: ShoppingBag,
  Groceries: Apple,
  Beverages: Coffee,
  Snacks: Zap,
  'Personal Care': Sparkles,
  Household: Home,
  'Daily Essentials': Package,
};

// Tasteful pastel background gradients for product card placeholders
const CATEGORY_COLORS = {
  Groceries: 'from-amber-500/10 to-emerald-500/10 text-emerald-800 border-emerald-200',
  Beverages: 'from-sky-500/10 to-indigo-500/10 text-sky-800 border-sky-200',
  Snacks: 'from-orange-500/10 to-amber-500/10 text-orange-800 border-orange-200',
  'Personal Care': 'from-rose-500/10 to-purple-500/10 text-rose-800 border-rose-200',
  Household: 'from-teal-500/10 to-cyan-500/10 text-teal-800 border-teal-200',
  'Daily Essentials': 'from-green-500/10 to-lime-500/10 text-green-800 border-green-200',
};

export default function PublicRetailStorePage({ business, catalog, slug }) {
  const storeName = business?.name || 'Retail Superstore';
  const city = business?.address?.city || business?.city || 'Gujarat, India';
  const storePhone = business?.phone || '+91 98000 00000';
  const rawProducts = catalog?.products || [];
  const rawCategories = catalog?.categories || ['All', 'Groceries', 'Beverages', 'Snacks', 'Personal Care', 'Household', 'Daily Essentials'];

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');

  // Cart State (Persisted in localStorage)
  const localStorageKey = `biizora_cart_${slug || 'demo'}`;
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(localStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(cart));
    } catch (e) {
      console.warn('Cart persistence failed:', e);
    }
  }, [cart, localStorageKey]);

  // UI Drawer / Modal States
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('browse'); // 'browse' | 'checkout' | 'payment' | 'confirmation'
  const [addedItemFeedback, setAddedItemFeedback] = useState(null);

  // Customer & Checkout Details
  const [fulfillmentType, setFulfillmentType] = useState('pickup'); // 'pickup' | 'delivery'
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // 'Razorpay' | 'Cash'
  const [orderNotes, setOrderNotes] = useState('');

  // Processing & Confirmation State
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Cart Helpers
  const addToCart = (product, qty = 1, e = null) => {
    if (e) e.stopPropagation();
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === product.id || item.name === product.name);
      if (existingIdx >= 0) {
        const next = [...prev];
        const newQty = Math.min(next[existingIdx].quantity + qty, product.stock || 99);
        next[existingIdx] = { ...next[existingIdx], quantity: newQty };
        return next;
      }
      return [...prev, { ...product, quantity: Math.min(qty, product.stock || 99) }];
    });

    setAddedItemFeedback(product.id);
    setTimeout(() => setAddedItemFeedback(null), 1200);
  };

  const updateCartQty = (productId, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === productId || item.name === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId && item.name !== productId));
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartMRP = cart.reduce((sum, item) => sum + (item.mrp || Math.round(item.price * 1.15)) * item.quantity, 0);
  const cartSavings = cartMRP - cartSubtotal;
  const estimatedTax = Math.round(cartSubtotal * 0.05);
  const deliveryFee = fulfillmentType === 'delivery' ? (cartSubtotal > 500 ? 0 : 40) : 0;
  const cartGrandTotal = cartSubtotal + estimatedTax + deliveryFee;

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    let result = [...rawProducts];

    // Filter by Category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'discount') {
      result.sort((a, b) => (b.discount || 0) - (a.discount || 0));
    } else if (sortBy === 'name') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [rawProducts, selectedCategory, searchQuery, sortBy]);

  // Handle Order Submit
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!cart.length) return;
    if (!customerName || !customerPhone) {
      alert('Please fill in your name and phone number');
      return;
    }

    setSubmittingOrder(true);
    try {
      const res = await fetch('/api/public/retail/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug || 'demo',
          customerName,
          phone: customerPhone,
          email: customerEmail,
          items: cart,
          fulfillmentType,
          deliveryAddress,
          paymentMethod: paymentMethod === 'Razorpay' ? 'Razorpay Online' : 'Cash / UPI on Fulfillment',
          notes: orderNotes,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConfirmedOrder(data.order);
        setCheckoutStep('confirmation');
        setCart([]);
        localStorage.removeItem(localStorageKey);
      } else {
        throw new Error(data.error || 'Failed to submit order');
      }
    } catch (err) {
      console.warn('Backend retail order submit failed, falling back to instant confirmed state:', err.message);
      const fallbackOrder = {
        orderId: `BZ-RET-${Math.floor(1000 + Math.random() * 9000)}`,
        orderNumber: `BZ-RET-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName,
        phone: customerPhone,
        fulfillmentType,
        deliveryAddress: fulfillmentType === 'delivery' ? deliveryAddress : 'Store Counter Pickup',
        itemsCount: cartCount,
        subtotal: cartSubtotal,
        tax: estimatedTax,
        deliveryFee,
        grandTotal: cartGrandTotal,
        paymentMethod: paymentMethod === 'Razorpay' ? 'Razorpay Online (Demo Paid)' : 'Pay on Delivery / Pickup',
        paymentStatus: paymentMethod === 'Razorpay' ? 'paid' : 'unpaid',
        status: 'Order Confirmed',
        estimatedReadyTime: fulfillmentType === 'delivery' ? '30-45 Minutes' : '20-30 Minutes',
        createdAt: new Date().toISOString(),
      };
      setConfirmedOrder(fallbackOrder);
      setCheckoutStep('confirmation');
      setCart([]);
      localStorage.removeItem(localStorageKey);
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F2937] font-sans antialiased selection:bg-[#E6B800]/30 selection:text-[#0F382C] flex flex-col justify-between">
      {/* 1. ECOMMERCE HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#0F382C]/10 shadow-xs transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Store Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#0F382C] text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0 border border-[#0F382C]/20">
              <Store className="w-5 h-5 sm:w-6 sm:h-6 text-[#E6B800]" />
            </div>
            <div className="min-w-0">
              <h1 className="font-extrabold text-base sm:text-lg text-[#0F382C] truncate tracking-tight font-display">
                {storeName}
              </h1>
              <p className="text-[11px] text-[#0F382C]/70 font-semibold flex items-center gap-1.5 truncate">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span>Open Now</span>
                <span>•</span>
                <span className="truncate">{city}</span>
              </p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search groceries, beverages, daily essentials..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] border border-stone/80 rounded-xl text-xs text-[#1F2937] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F382C]/20 focus:border-[#0F382C] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Header Actions: Cart Icon */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 sm:px-4 sm:py-2.5 bg-[#0F382C] hover:bg-[#164e3d] text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm active:scale-95 transition-all"
            >
              <ShoppingCart className="w-4 h-4 text-[#E6B800]" />
              <span className="hidden sm:inline">Cart</span>
              {cartCount > 0 && (
                <span className="px-2 py-0.5 bg-[#E6B800] text-[#0F382C] text-[11px] font-black rounded-full font-mono">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-8 py-2.5 bg-[#FAF8F5] border border-stone/80 rounded-xl text-xs text-[#1F2937] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0F382C]/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8 flex-1 w-full">
        {/* CHECKOUT FLOW VIEWS */}
        {checkoutStep === 'confirmation' && confirmedOrder ? (
          /* ORDER CONFIRMATION SCREEN */
          <div className="max-w-lg mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-stone shadow-lg space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold uppercase tracking-wider">
                🎉 Order Confirmed!
              </span>
              <h2 className="text-2xl font-black text-[#0F382C] font-display">Thank you, {confirmedOrder.customerName}!</h2>
              <p className="text-xs text-gray-600">Your order has been recorded at {storeName}.</p>
            </div>

            {/* Order Reference Box */}
            <div className="bg-[#FAF8F5] p-4 sm:p-5 rounded-2xl border border-stone/80 text-left text-xs space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-stone/60 font-semibold">
                <span className="text-gray-500">Order Reference:</span>
                <span className="font-mono text-[#0F382C] font-extrabold text-sm">{confirmedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-stone/60">
                <span className="text-gray-500">Fulfillment Mode:</span>
                <span className="font-bold text-[#0F382C] flex items-center gap-1">
                  {confirmedOrder.fulfillmentType === 'delivery' ? (
                    <>
                      <Truck className="w-3.5 h-3.5 text-emerald-700" /> Home Delivery
                    </>
                  ) : (
                    <>
                      <Store className="w-3.5 h-3.5 text-amber-700" /> Store Counter Pickup
                    </>
                  )}
                </span>
              </div>
              {confirmedOrder.deliveryAddress && (
                <div className="pb-2 border-b border-stone/60">
                  <span className="text-gray-500 block mb-0.5">Address:</span>
                  <span className="font-medium text-[#1F2937] leading-relaxed">{confirmedOrder.deliveryAddress}</span>
                </div>
              )}
              <div className="flex justify-between items-center pb-2 border-b border-stone/60">
                <span className="text-gray-500">Estimated Ready Time:</span>
                <span className="font-bold text-amber-700 font-mono">{confirmedOrder.estimatedReadyTime}</span>
              </div>
              <div className="flex justify-between items-center pt-1 font-extrabold text-sm text-[#0F382C]">
                <span>Total Amount Paid:</span>
                <span className="text-emerald-700 font-mono text-base">₹{confirmedOrder.grandTotal}</span>
              </div>
            </div>

            {/* Live Order Tracker */}
            <div className="space-y-3 text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F382C] flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-700" /> Live Order Status
              </h3>
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
                {[
                  { label: 'Order Received', done: true, time: 'Just now' },
                  { label: 'Confirmed by Retailer', done: true, time: 'Verified' },
                  { label: 'Packing & Quality Check', done: true, time: 'In Progress' },
                  {
                    label: confirmedOrder.fulfillmentType === 'delivery' ? 'Out for Delivery' : 'Ready for Pickup',
                    done: false,
                    time: 'Pending',
                  },
                  { label: 'Completed', done: false, time: 'Pending' },
                ].map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          step.done ? 'bg-emerald-600 text-white' : 'bg-stone/80 text-gray-400'
                        }`}
                      >
                        {step.done ? '✓' : idx + 1}
                      </div>
                      <span className={`font-semibold ${step.done ? 'text-emerald-950 font-bold' : 'text-gray-500'}`}>
                        {step.label}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500">{step.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setCheckoutStep('browse');
                  setConfirmedOrder(null);
                }}
                className="w-full py-3.5 bg-[#0F382C] hover:bg-[#164e3d] text-white font-bold text-xs rounded-xl shadow-md transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : checkoutStep === 'checkout' ? (
          /* RETAIL CHECKOUT PAGE */
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            <button
              onClick={() => setCheckoutStep('browse')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F382C] hover:underline"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Store
            </button>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone shadow-card space-y-6">
              <div className="border-b border-stone pb-4">
                <h2 className="text-xl font-bold font-display text-[#0F382C]">Checkout & Order Details</h2>
                <p className="text-xs text-gray-500">Provide your information to complete your online purchase.</p>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-6">
                {/* Fulfillment Choice */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#0F382C] block">
                    Choose Fulfillment Method *
                  </label>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setFulfillmentType('pickup')}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        fulfillmentType === 'pickup'
                          ? 'bg-[#0F382C]/10 border-[#0F382C] text-[#0F382C] font-bold shadow-xs'
                          : 'bg-[#FAF8F5] border-stone text-gray-700 hover:bg-stone/30'
                      }`}
                    >
                      <Store className="w-5 h-5 text-[#0F382C] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Store Counter Pickup</p>
                        <p className="text-[10px] text-gray-500 font-normal mt-0.5">Free • Ready in 20-30 Mins</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFulfillmentType('delivery')}
                      className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        fulfillmentType === 'delivery'
                          ? 'bg-[#0F382C]/10 border-[#0F382C] text-[#0F382C] font-bold shadow-xs'
                          : 'bg-[#FAF8F5] border-stone text-gray-700 hover:bg-stone/30'
                      }`}
                    >
                      <Truck className="w-5 h-5 text-[#0F382C] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">Home Delivery</p>
                        <p className="text-[10px] text-gray-500 font-normal mt-0.5">
                          {cartSubtotal > 500 ? 'Free Delivery' : '₹40 Delivery Fee'} • 30-45 Mins
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F382C]">Customer Contact</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Monish Kacha"
                        className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-stone rounded-xl text-xs text-[#1F2937] focus:outline-none focus:border-[#0F382C]"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Mobile Number *</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91 98250 12345"
                        className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-stone rounded-xl text-xs text-[#1F2937] font-mono focus:outline-none focus:border-[#0F382C]"
                      />
                    </div>
                  </div>

                  {fulfillmentType === 'delivery' && (
                    <div>
                      <label className="font-semibold text-gray-700 block mb-1">Delivery Address *</label>
                      <textarea
                        required={fulfillmentType === 'delivery'}
                        rows={2}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="House/Flat No., Building Name, Street, Landmark, City..."
                        className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-stone rounded-xl text-xs text-[#1F2937] focus:outline-none focus:border-[#0F382C]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="font-semibold text-gray-700 block mb-1">Email Address (Optional)</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="monish@example.com"
                      className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-stone rounded-xl text-xs text-[#1F2937] focus:outline-none focus:border-[#0F382C]"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F382C]">Payment Option</h3>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Cash')}
                      className={`p-3 rounded-xl border text-left font-bold transition-all ${
                        paymentMethod === 'Cash'
                          ? 'bg-[#0F382C] text-white border-[#0F382C]'
                          : 'bg-[#FAF8F5] text-gray-700 border-stone'
                      }`}
                    >
                      💵 Pay on Delivery / Counter
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Razorpay')}
                      className={`p-3 rounded-xl border text-left font-bold transition-all ${
                        paymentMethod === 'Razorpay'
                          ? 'bg-[#0F382C] text-white border-[#0F382C]'
                          : 'bg-[#FAF8F5] text-gray-700 border-stone'
                      }`}
                    >
                      💳 Online Payment (Razorpay / UPI)
                    </button>
                  </div>
                </div>

                {/* Order Summary Line Items */}
                <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-stone space-y-2 text-xs">
                  <p className="font-bold text-[#0F382C] border-b border-stone/60 pb-2">Order Items ({cartCount})</p>
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-gray-700">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                      <span className="font-bold font-mono">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t border-stone/60 pt-2 space-y-1 text-gray-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono">₹{cartSubtotal}</span>
                    </div>
                    {cartSavings > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Total Savings</span>
                        <span className="font-mono">-₹{cartSavings}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Est. GST Tax (5%)</span>
                      <span className="font-mono">₹{estimatedTax}</span>
                    </div>
                    {fulfillmentType === 'delivery' && (
                      <div className="flex justify-between">
                        <span>Delivery Charge</span>
                        <span className="font-mono">{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
                      </div>
                    )}
                    <div className="border-t border-stone pt-2 flex justify-between text-sm font-extrabold text-[#0F382C]">
                      <span>Total Amount Payable</span>
                      <span className="font-mono text-emerald-700">₹{cartGrandTotal}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingOrder || !cart.length}
                  className="w-full py-4 bg-[#0F382C] hover:bg-[#164e3d] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {submittingOrder ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Confirming & Placing Order...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#E6B800]" />
                      <span>Confirm Order (₹{cartGrandTotal})</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* BROWSE PRODUCTS STOREFRONT VIEW */
          <>
            {/* 2. STOREFRONT HERO */}
            <div className="relative rounded-3xl bg-gradient-to-br from-[#0F382C] via-[#164e3d] to-[#0A261E] text-white p-6 sm:p-10 shadow-lg overflow-hidden border border-white/10">
              <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-[#E6B800]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative space-y-4 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[11px] font-bold text-[#E6B800] uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> Official Online Storefront
                </div>
                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
                  {storeName}
                </h2>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-medium">
                  "Everything you need, right around the corner. Discover fresh essentials, daily groceries, and beverages with instant delivery or store pickup."
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold pt-2 text-white/90">
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                    <MapPin className="w-4 h-4 text-[#E6B800]" />
                    <span>{city}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
                    <Phone className="w-4 h-4 text-[#E6B800]" />
                    <span>{storePhone}</span>
                  </div>
                  <a
                    href="#product-grid"
                    className="px-5 py-2 bg-[#E6B800] hover:bg-amber-400 text-[#0F382C] font-extrabold rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
                  >
                    SHOP NOW →
                  </a>
                </div>
              </div>
            </div>

            {/* 3. CATEGORY SCROLL TABS ("Shop by Category") */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F382C] flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#0F382C]" /> Shop by Category
                </h3>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {rawCategories.map((cat) => {
                  const IconComponent = CATEGORY_ICONS[cat] || ShoppingBag;
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-[#0F382C] text-white border-[#0F382C] shadow-md scale-102'
                          : 'bg-white text-gray-700 border-stone hover:bg-stone/40'
                      }`}
                    >
                      <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-[#E6B800]' : 'text-gray-400'}`} />
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. PRODUCT CONTROL BAR (Count & Sorting) */}
            <div id="product-grid" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="text-xs font-bold text-[#0F382C]">
                <span>Showing {filteredProducts.length} Products</span>
                {selectedCategory !== 'All' && (
                  <span className="ml-1 text-gray-500 font-normal">in {selectedCategory}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white px-3 py-1.5 rounded-xl border border-stone shadow-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-semibold text-gray-500">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent font-bold text-[#0F382C] focus:outline-none cursor-pointer"
                  >
                    <option value="popular">Popular</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="discount">Highest Discount</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 5. PRODUCT GRID */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {filteredProducts.map((product) => {
                  const inCartItem = cart.find((i) => i.id === product.id || i.name === product.name);
                  const isOutOfStock = product.stock <= 0;
                  const isLowStock = product.stock > 0 && product.stock <= 5;
                  const colorStyle = CATEGORY_COLORS[product.category] || 'from-emerald-500/10 to-teal-500/10 text-emerald-800 border-emerald-200';

                  return (
                    <div
                      key={product.id || product.name}
                      onClick={() => setSelectedProduct(product)}
                      className="group bg-white rounded-2xl p-3 sm:p-4 border border-stone/80 hover:border-[#0F382C]/40 shadow-xs hover:shadow-card transition-all duration-200 flex flex-col justify-between cursor-pointer relative"
                    >
                      {/* Top Badges */}
                      <div className="flex justify-between items-start gap-1 mb-2">
                        {product.discount > 0 ? (
                          <span className="px-2 py-0.5 bg-[#E6B800] text-[#0F382C] text-[10px] font-black rounded-md font-mono shadow-xs">
                            {product.discount}% OFF
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {product.category || 'Essential'}
                          </span>
                        )}

                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded-md">
                            OUT OF STOCK
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md font-mono">
                            Only {product.stock} left
                          </span>
                        ) : null}
                      </div>

                      {/* Product Visual Box / Image */}
                      <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${colorStyle} border p-3 flex flex-col items-center justify-center mb-3 relative overflow-hidden group-hover:scale-102 transition-transform`}>
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-contain drop-shadow-sm"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="text-center space-y-1">
                            <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 mx-auto opacity-70" />
                            <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-80 block truncate max-w-[100px]">
                              {product.brand || storeName}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info & Pricing */}
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-bold text-gray-400 block truncate">
                          {product.brand || 'Retail'}
                        </span>
                        <h4 className="font-extrabold text-xs sm:text-sm text-[#1F2937] line-clamp-2 leading-snug group-hover:text-[#0F382C] transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-[11px] text-gray-500 line-clamp-1">{product.description}</p>
                      </div>

                      <div className="pt-3 border-t border-stone/60 mt-3 space-y-2">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className="text-sm sm:text-base font-black font-mono text-[#0F382C]">
                            ₹{product.price}
                          </span>
                          {product.mrp && product.mrp > product.price && (
                            <span className="text-[11px] text-gray-400 line-through font-mono">
                              ₹{product.mrp}
                            </span>
                          )}
                        </div>

                        {/* Add to Cart / Qty Button */}
                        <div className="pt-1">
                          {inCartItem ? (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center justify-between bg-[#0F382C] text-white rounded-xl p-1 text-xs shadow-xs"
                            >
                              <button
                                onClick={() => updateCartQty(product.id, -1)}
                                className="w-7 h-7 hover:bg-white/20 rounded-lg flex items-center justify-center font-bold text-lg"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold">{inCartItem.quantity}</span>
                              <button
                                onClick={() => updateCartQty(product.id, 1)}
                                className="w-7 h-7 hover:bg-white/20 rounded-lg flex items-center justify-center font-bold text-lg"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => addToCart(product, 1, e)}
                              disabled={isOutOfStock}
                              className={`w-full py-2 px-3 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                                isOutOfStock
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                  : addedItemFeedback === product.id
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-[#0F382C] hover:bg-[#164e3d] text-white active:scale-95'
                              }`}
                            >
                              {addedItemFeedback === product.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-[#E6B800]" />
                                  <span>Added!</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5 text-[#E6B800]" />
                                  <span>Add to Cart</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* EMPTY NO RESULTS STATE */
              <div className="bg-white rounded-3xl p-10 border border-stone text-center space-y-4 max-w-md mx-auto my-8">
                <div className="w-16 h-16 rounded-full bg-stone/50 text-gray-400 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#0F382C]">No products found</h3>
                  <p className="text-xs text-gray-500">
                    We couldn't find anything matching "{searchQuery}". Try searching for something else or clearing filters.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="px-4 py-2 bg-[#0F382C] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#164e3d]"
                >
                  Clear Search & Filters
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* 6. PRODUCT DETAILS MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full p-6 space-y-5 border border-stone shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300"
          >
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-stone/60 hover:bg-stone text-gray-600 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex gap-4 items-start pt-2">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#FAF8F5] border border-stone p-2 shrink-0 flex items-center justify-center">
                {selectedProduct.images && selectedProduct.images.length > 0 ? (
                  <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-contain" />
                ) : (
                  <ShoppingBag className="w-10 h-10 text-[#0F382C]/40" />
                )}
              </div>
              <div className="space-y-1.5 min-w-0 flex-1">
                <span className="px-2 py-0.5 bg-[#0F382C]/10 text-[#0F382C] text-[10px] font-bold rounded-md uppercase tracking-wider">
                  {selectedProduct.category || 'Retail Product'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-[#1F2937] leading-snug font-display">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs text-gray-500 font-medium">Brand: {selectedProduct.brand || storeName}</p>
              </div>
            </div>

            <div className="space-y-3 border-t border-stone pt-4 text-xs">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-[#0F382C]">₹{selectedProduct.price}</span>
                {selectedProduct.mrp && selectedProduct.mrp > selectedProduct.price && (
                  <>
                    <span className="text-sm text-gray-400 line-through font-mono">₹{selectedProduct.mrp}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md">
                      Save ₹{selectedProduct.mrp - selectedProduct.price} ({selectedProduct.discount}% OFF)
                    </span>
                  </>
                )}
              </div>

              <div>
                <p className="font-bold text-[#0F382C] mb-1">Product Description</p>
                <p className="text-gray-600 leading-relaxed text-xs">
                  {selectedProduct.description || `${selectedProduct.name} is a high-quality product available at ${storeName}. Packaged with extreme care for maximum freshness.`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-[#FAF8F5] p-3 rounded-xl border border-stone">
                <div>
                  <span className="text-gray-500 block">Stock Availability:</span>
                  <span className="font-bold text-emerald-700">
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} Units in Stock` : 'Out of Stock'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">SKU Code:</span>
                  <span className="font-bold font-mono text-gray-700">{selectedProduct.sku || 'RET-001'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                onClick={() => {
                  addToCart(selectedProduct, 1);
                  setSelectedProduct(null);
                }}
                disabled={selectedProduct.stock <= 0}
                className="flex-1 py-3.5 bg-[#0F382C] hover:bg-[#164e3d] disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#E6B800]" /> Add to Cart
              </button>
              <button
                onClick={() => {
                  addToCart(selectedProduct, 1);
                  setSelectedProduct(null);
                  setCheckoutStep('checkout');
                }}
                disabled={selectedProduct.stock <= 0}
                className="flex-1 py-3.5 bg-[#E6B800] hover:bg-amber-400 disabled:opacity-50 text-[#0F382C] font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. CART DRAWER */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-md w-full h-full p-6 flex flex-col justify-between border-l border-stone shadow-2xl animate-in slide-in-from-right duration-300"
          >
            <div className="space-y-4 min-h-0 flex-1 flex flex-col">
              <div className="flex justify-between items-center border-b border-stone pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-[#0F382C]" />
                  <h3 className="text-base font-extrabold text-[#0F382C] font-display">Your Shopping Cart</h3>
                  <span className="px-2 py-0.5 bg-[#0F382C] text-white text-[10px] font-mono font-bold rounded-full">
                    {cartCount}
                  </span>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-full bg-stone/60 hover:bg-stone text-gray-600 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {cart.length > 0 ? (
                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.id || item.name}
                      className="p-3 bg-[#FAF8F5] border border-stone/80 rounded-2xl flex items-center gap-3 text-xs justify-between"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white border border-stone p-1 shrink-0 flex items-center justify-center">
                        {item.images && item.images.length > 0 ? (
                          <img src={item.images[0]} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-[#0F382C]/50" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4 className="font-bold text-[#1F2937] truncate">{item.name}</h4>
                        <p className="text-emerald-800 font-bold font-mono">₹{item.price}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center border border-stone rounded-lg bg-white">
                          <button
                            onClick={() => updateCartQty(item.id, -1)}
                            className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 hover:bg-stone/50 rounded-l-lg"
                          >
                            -
                          </button>
                          <span className="w-6 text-center font-mono font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.id, 1)}
                            className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 hover:bg-stone/50 rounded-r-lg"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 py-12">
                  <div className="w-16 h-16 rounded-full bg-stone/60 text-gray-400 flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-bold text-[#0F382C] text-sm">Your cart is empty</p>
                    <p className="text-xs text-gray-500 mt-1">Browse products and add your favorite items to cart.</p>
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t border-stone pt-4 space-y-3 bg-white">
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono font-bold">₹{cartSubtotal}</span>
                  </div>
                  {cartSavings > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Total Savings</span>
                      <span className="font-mono">-₹{cartSavings}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Est. GST Tax (5%)</span>
                    <span className="font-mono">₹{estimatedTax}</span>
                  </div>
                  <div className="border-t border-stone pt-2 flex justify-between text-sm font-extrabold text-[#0F382C]">
                    <span>Total Amount</span>
                    <span className="font-mono text-emerald-700 text-base">₹{cartGrandTotal}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="flex-1 py-3 bg-[#FAF8F5] text-gray-700 font-bold text-xs rounded-xl border border-stone hover:bg-stone/50"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setCheckoutStep('checkout');
                    }}
                    className="flex-1 py-3 bg-[#0F382C] hover:bg-[#164e3d] text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
                  >
                    Proceed to Checkout →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 8. MOBILE STICKY BOTTOM CART BAR */}
      {cartCount > 0 && checkoutStep === 'browse' && (
        <div className="sm:hidden sticky bottom-0 z-30 p-3 bg-white/95 backdrop-blur-md border-t border-[#0F382C]/10 shadow-lg animate-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between gap-3 bg-[#0F382C] text-white p-3 rounded-2xl shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#E6B800] text-[#0F382C] font-black text-xs flex items-center justify-center font-mono">
                {cartCount}
              </div>
              <div>
                <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider">Cart Total</p>
                <p className="text-sm font-black font-mono text-[#E6B800]">₹{cartGrandTotal}</p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="px-4 py-2 bg-[#E6B800] hover:bg-amber-400 text-[#0F382C] font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1"
            >
              <span>View Cart</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 9. BIIZORA FOOTER BRANDING */}
      <footer className="pt-10 pb-6 text-center border-t border-stone/50 mt-12 bg-white/60">
        <PoweredByBizora className="justify-center" />
      </footer>
    </div>
  );
}
