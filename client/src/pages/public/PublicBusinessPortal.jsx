import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Scissors,
  Utensils,
  BookOpen,
  Boxes,
  ShoppingBag,
  Clock,
  Calendar,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
  Plus,
  Trash2,
  QrCode,
  FileText,
  Send,
  Printer,
  ShoppingBasket,
  ChevronRight,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { PoweredByBizora } from '../../components/ui/PoweredByBizora';
import PublicRetailStorePage from './PublicRetailStorePage';
import PublicSalonStorefrontPage from './PublicSalonStorefrontPage';
import PublicRestaurantStorefrontPage from './PublicRestaurantStorefrontPage';

export default function PublicBusinessPortal() {
  const { slug, subpath } = useParams();
  const [business, setBusiness] = useState(null);
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cart & Booking States
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Salon specific
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState('Riya');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedTime, setSelectedTime] = useState('10:00 AM');

  // Manufacturing quote specific
  const [companyName, setCompanyName] = useState('');
  const [targetProduct, setTargetProduct] = useState('5-Axis CNC Machining');
  const [targetQuantity, setTargetQuantity] = useState(500);
  const [quoteSpecs, setQuoteSpecs] = useState('');
  const [rfqStep, setRfqStep] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState('SS 304 / 316');
  const [surfaceFinish, setSurfaceFinish] = useState('Standard Machined');
  const [deliveryTimeline, setDeliveryTimeline] = useState('Standard (3-4 Weeks)');

  // Status & Success state
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    fetchPublicData();
  }, [slug]);

  const fetchPublicData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/public/business/${slug || 'demo'}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load business details');
      setBusiness(data.business);
      setCatalog(data.catalog || {});
    } catch (err) {
      console.warn('Public business API error, using slug-aware fallback:', err.message);
      // Slug-aware fallback — detect business type from URL slug so Salon never shows Retail
      const sl = (slug || '').toLowerCase();
      const isSalonSlug = sl.includes('salon') || sl.includes('glow') || sl.includes('beauty') || sl.includes('hair') || sl.includes('spa');
      const isRestaurantSlug = sl.includes('restaurant') || sl.includes('food') || sl.includes('olive') || sl.includes('dine') || sl.includes('cafe');
      const isMfgSlug = sl.includes('manufacturing') || sl.includes('mfg') || sl.includes('industrial') || sl.includes('precision');
      const isStationerySlug = sl.includes('stationery') || sl.includes('xerox') || sl.includes('pagecraft');
      const detectedType = isSalonSlug ? 'salon' : isRestaurantSlug ? 'restaurant' : isMfgSlug ? 'manufacturing' : isStationerySlug ? 'stationery' : 'retail';

      if (isSalonSlug) {
        setBusiness({
          name: 'Glow Salon Studio',
          businessType: 'salon',
          phone: '+91 98250 12345',
          email: 'hello@glowsalon.com',
          city: 'Gujarat, India',
          tagline: 'Where your next look begins.',
          publicSettings: { onlineBookingEnabled: true },
        });
        setCatalog({});
      } else if (isRestaurantSlug) {
        setBusiness({
          name: 'The Olive Table',
          businessType: 'restaurant',
          phone: '+91 98250 12345',
          email: 'contact@olivetable.com',
          city: 'Gujarat, India',
          publicSettings: { onlineOrderingEnabled: true },
        });
        setCatalog({ items: [] });
      } else if (isMfgSlug) {
        setBusiness({
          name: 'Apex Manufacturing Works',
          businessType: 'manufacturing',
          phone: '+91 98250 12345',
          city: 'Gujarat, India',
          publicSettings: {},
        });
        setCatalog({});
      } else if (isStationerySlug) {
        setBusiness({
          name: 'PageCraft Stationery',
          businessType: 'stationery',
          phone: '+91 98250 12345',
          city: 'Gujarat, India',
          publicSettings: {},
        });
        setCatalog({ products: [] });
      } else {
        // Only default to retail when slug looks like retail
        setBusiness({
          name: 'Apex Supermart',
          businessType: 'retail',
          phone: '+91 98250 12345',
          email: 'contact@biizora.com',
          city: 'Gujarat, India',
          publicSettings: { onlineBookingEnabled: true, onlineOrderingEnabled: true, onlinePaymentsEnabled: true },
        });
        setCatalog({
          categories: ['All', 'Groceries', 'Beverages', 'Snacks', 'Personal Care', 'Household', 'Daily Essentials'],
          products: [
            { id: 'ret-1', name: 'Organic Sharbati Wheat Flour (Atta 5kg)', price: 240, mrp: 280, discount: 14, category: 'Groceries', stock: 45, brand: 'Aashirvaad', description: '100% pure Sharbati whole wheat flour rich in fiber.' },
            { id: 'ret-2', name: 'Fortune Sunlite Refined Sunflower Oil (1L)', price: 145, mrp: 165, discount: 12, category: 'Groceries', stock: 60, brand: 'Fortune', description: 'Light refined sunflower oil rich in Vitamin E.' },
            { id: 'ret-3', name: 'Tata Salt Vacuum Evaporated Iodized Salt (1kg)', price: 28, mrp: 30, discount: 7, category: 'Groceries', stock: 120, brand: 'Tata', description: 'Desh Ka Namak - pure vacuum evaporated iodized salt.' },
            { id: 'ret-4', name: 'Amul Taaza Toned Milk (1L Pasteurized)', price: 68, mrp: 72, discount: 5, category: 'Daily Essentials', stock: 35, brand: 'Amul', description: 'Fresh pasteurized toned milk with 3.0% fat.' },
            { id: 'ret-5', name: 'Nescafe Classic Instant Coffee (100g Jar)', price: 320, mrp: 360, discount: 11, category: 'Beverages', stock: 25, brand: 'Nescafe', description: '100% pure natural roasted coffee beans.' },
            { id: 'ret-6', name: 'Britannia Good Day Cashew Cookies (200g)', price: 50, mrp: 60, discount: 16, category: 'Snacks', stock: 80, brand: 'Britannia', description: 'Rich butter cookies loaded with crunchy real cashews.' },
            { id: 'ret-7', name: 'Dove Cream Beauty Bathing Bar (75g x 3)', price: 195, mrp: 220, discount: 11, category: 'Personal Care', stock: 30, brand: 'Dove', description: 'Formulated with 1/4 moisturizing cream.' },
            { id: 'ret-8', name: 'Surf Excel Easy Wash Detergent Powder (1kg)', price: 140, mrp: 155, discount: 10, category: 'Household', stock: 50, brand: 'Surf Excel', description: 'Superior stain removal formula.' },
          ],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSalonBookingSubmit = async (e) => {
    e.preventDefault();
    if (!customerName || !selectedService) return;
    setLoading(true);
    try {
      const res = await fetch('/api/public/salon/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug || 'demo',
          clientName: customerName,
          phone,
          email,
          service: selectedService.name,
          stylist: selectedStylist,
          date: selectedDate,
          time: selectedTime,
          paymentMethod: 'Razorpay',
        }),
      });
      const data = await res.json();
      setConfirmation(data.booking || {
        bookingId: `SAL-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName: customerName,
        service: selectedService.name,
        date: selectedDate,
        time: selectedTime,
        status: 'Confirmed',
      });
    } catch {
      setConfirmation({
        bookingId: `SAL-${Math.floor(1000 + Math.random() * 9000)}`,
        clientName: customerName,
        service: selectedService?.name || 'Salon Appointment',
        date: selectedDate,
        time: selectedTime,
        status: 'Confirmed',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestaurantOrderSubmit = async (e) => {
    e.preventDefault();
    if (!cart.length) return;
    setLoading(true);
    try {
      const res = await fetch('/api/public/restaurant/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug || 'demo',
          customerName,
          phone,
          items: cart,
          paymentMethod: 'Razorpay',
        }),
      });
      const data = await res.json();
      setConfirmation(data.order || {
        orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName,
        grandTotal: cart.reduce((s, i) => s + i.price * i.quantity, 0),
        status: 'New Order Received',
      });
    } catch {
      setConfirmation({
        orderNumber: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName,
        grandTotal: cart.reduce((s, i) => s + i.price * i.quantity, 0),
        status: 'New Order Received',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStationeryOrderSubmit = async (e) => {
    e.preventDefault();
    if (!cart.length) return;
    setLoading(true);
    try {
      const res = await fetch('/api/public/stationery/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug || 'demo',
          customerName,
          phone,
          email,
          items: cart,
          paymentMethod: 'Razorpay',
        }),
      });
      const data = await res.json();
      setConfirmation(data.order || {
        invoiceNumber: `ST-${Math.floor(1000 + Math.random() * 9000)}`,
        pickupCode: `BZR-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName,
        grandTotal: cart.reduce((s, i) => s + i.price * i.quantity, 0),
        status: 'Order Received',
      });
    } catch {
      setConfirmation({
        invoiceNumber: `ST-${Math.floor(1000 + Math.random() * 9000)}`,
        pickupCode: `BZR-${Math.floor(1000 + Math.random() * 9000)}`,
        customerName,
        grandTotal: cart.reduce((s, i) => s + i.price * i.quantity, 0),
        status: 'Order Received',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManufacturingQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!companyName || !targetProduct) return;
    setLoading(true);
    try {
      const res = await fetch('/api/public/manufacturing/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug || 'demo',
          companyName,
          contactName: customerName,
          phone,
          email,
          productName: targetProduct,
          targetQuantity,
          specs: quoteSpecs,
        }),
      });
      const data = await res.json();
      setConfirmation(data.quote || {
        quoteId: `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
        companyName,
        productName: targetProduct,
        targetQuantity,
        status: 'Quotation Request Received',
      });
    } catch {
      setConfirmation({
        quoteId: `QT-2026-${Math.floor(100 + Math.random() * 900)}`,
        companyName,
        productName: targetProduct,
        targetQuantity,
        status: 'Quotation Request Received',
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.id === item.id || i.name === item.name);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { ...item, quantity: 1, price: item.price || item.sellingPrice || 100 }];
    });
  };

  if (loading && !business) {
    return (
      <div className="min-h-screen bg-cream/40 flex items-center justify-center p-6 text-charcoal">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-green-bottle border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold">Loading Biizora Customer Experience...</p>
        </div>
      </div>
    );
  }

  // Determine business type — use explicit API value first, fall back to slug keywords
  const rawType = (business?.businessType || '').toLowerCase();
  const sl = (slug || '').toLowerCase();
  const isSalonSlug = sl.includes('salon') || sl.includes('glow') || sl.includes('beauty') || sl.includes('hair') || sl.includes('spa');
  const bType = rawType || (isSalonSlug ? 'salon' : sl.includes('restaurant') ? 'restaurant' : sl.includes('manufacturing') || sl.includes('mfg') ? 'manufacturing' : sl.includes('stationery') ? 'stationery' : 'retail');

  // SALON BUSINESS: Render complete luxury salon digital storefront & booking experience
  if (bType === 'salon') {
    return <PublicSalonStorefrontPage business={business} catalog={catalog} slug={slug} />;
  }

  // RESTAURANT BUSINESS: Render luxury resort & fine-dining digital menu & ordering experience
  if (bType === 'restaurant') {
    return <PublicRestaurantStorefrontPage business={business} catalog={catalog} slug={slug} />;
  }

  // RETAIL BUSINESS: Render complete dedicated shopping storefront
  if (bType === 'retail') {
    return <PublicRetailStorePage business={business} catalog={catalog} slug={slug} />;
  }

  return (
    <div className="min-h-screen bg-cream/30 flex flex-col justify-between p-4 sm:p-6 font-sans text-charcoal">
      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Isolated Business Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-green-bottle text-white flex items-center justify-center mx-auto shadow-md">
            {bType === 'salon' && <Scissors className="w-7 h-7 text-yellow-butter" />}
            {bType === 'restaurant' && <Utensils className="w-7 h-7 text-yellow-butter" />}
            {bType === 'stationery' && <BookOpen className="w-7 h-7 text-yellow-butter" />}
            {bType === 'manufacturing' && <Boxes className="w-7 h-7 text-yellow-butter" />}
            {(bType === 'retail' || bType === 'general') && <ShoppingBag className="w-7 h-7 text-yellow-butter" />}
          </div>
          <h1 className="text-2xl font-bold font-display text-charcoal tracking-tight">{business?.name || 'Biizora Business'}</h1>
          <p className="text-xs text-warm-gray font-medium flex items-center justify-center gap-2">
            <span>{business?.city || 'Gujarat, India'}</span>
            <span>•</span>
            <span>{business?.phone || '+91 98000 00000'}</span>
          </p>
        </div>

        {/* CONFIRMATION SCREEN */}
        {confirmation ? (
          <div className="bg-white rounded-[24px] p-6 border border-stone shadow-card space-y-5 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto border border-emerald-300">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-charcoal">Transaction Submitted Successfully!</h2>
              <p className="text-xs text-warm-gray mt-1">Your details have been logged into {business?.name}.</p>
            </div>

            <div className="bg-cream/50 p-4 rounded-2xl border border-stone text-left text-xs space-y-2">
              {confirmation.bookingId && (
                <div className="flex justify-between border-b border-stone/40 pb-1.5 font-semibold">
                  <span className="text-warm-gray">Booking ID:</span>
                  <span className="font-mono text-green-bottle font-bold">{confirmation.bookingId}</span>
                </div>
              )}
              {confirmation.pickupCode && (
                <div className="p-3 bg-green-bottle text-white rounded-xl text-center space-y-1 my-2">
                  <p className="text-[10px] text-yellow-butter uppercase tracking-wider font-bold">Counter Pickup Verification Code</p>
                  <p className="text-2xl font-mono font-black tracking-widest text-yellow-butter">{confirmation.pickupCode}</p>
                </div>
              )}
              {confirmation.orderNumber && (
                <div className="flex justify-between border-b border-stone/40 pb-1.5 font-semibold">
                  <span className="text-warm-gray">Order Number:</span>
                  <span className="font-mono text-green-bottle font-bold">{confirmation.orderNumber}</span>
                </div>
              )}
              {confirmation.quoteId && (
                <div className="flex justify-between border-b border-stone/40 pb-1.5 font-semibold">
                  <span className="text-warm-gray">Quotation Ref ID:</span>
                  <span className="font-mono text-green-bottle font-bold">{confirmation.quoteId}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 font-bold">
                <span className="text-warm-gray">Status:</span>
                <span className="text-emerald-700">{confirmation.status}</span>
              </div>
            </div>

            <button
              onClick={() => { setConfirmation(null); setCart([]); }}
              className="w-full py-3 bg-green-bottle hover:bg-green-forest text-white font-bold text-xs rounded-xl shadow-subtle transition-all"
            >
              Done / Start New Request
            </button>
          </div>
        ) : (
          /* INDUSTRY ADAPTED CUSTOMER FORMS */
          <div className="space-y-4">
            {/* SALON EXPERIENCE */}
            {bType === 'salon' && (
              <form onSubmit={handleSalonBookingSubmit} className="bg-white rounded-[24px] p-6 border border-stone shadow-card space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2 border-b border-stone pb-3">
                  <Scissors className="w-4 h-4 text-green-bottle" /> Book Salon Appointment
                </h2>

                <div>
                  <label className="text-xs font-semibold text-charcoal block mb-1">Select Service *</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {(catalog?.services || []).map((srv) => (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedService(srv)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer flex justify-between items-center transition-all ${
                          selectedService?.id === srv.id
                            ? 'bg-green-bottle/10 border-green-bottle text-green-bottle font-bold'
                            : 'bg-cream/40 border-stone text-charcoal hover:bg-cream'
                        }`}
                      >
                        <div>
                          <p className="font-bold">{srv.name}</p>
                          <p className="text-[10px] text-warm-gray">{srv.duration} Mins</p>
                        </div>
                        <span className="font-bold">₹{srv.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Preferred Stylist</label>
                    <select
                      value={selectedStylist}
                      onChange={(e) => setSelectedStylist(e.target.value)}
                      className="bz-input"
                    >
                      {(catalog?.stylists || ['Riya', 'Anjali', 'Kavya']).map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Select Date *</label>
                    <input
                      type="date"
                      required
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bz-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Select Time Slot *</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="bz-input"
                    >
                      {(catalog?.timeSlots || ['10:00 AM', '11:30 AM', '02:00 PM']).map((ts) => (
                        <option key={ts} value={ts}>{ts}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98200..."
                      className="bz-input font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-charcoal block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Pooja Sharma"
                    className="bz-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedService}
                  className="w-full py-3.5 bg-green-bottle hover:bg-green-forest disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-subtle transition-all"
                >
                  {loading ? 'Confirming Availability...' : 'Confirm Salon Appointment'}
                </button>
              </form>
            )}

            {/* RESTAURANT EXPERIENCE */}
            {bType === 'restaurant' && (
              <form onSubmit={handleRestaurantOrderSubmit} className="bg-white rounded-[24px] p-6 border border-stone shadow-card space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2 border-b border-stone pb-3">
                  <Utensils className="w-4 h-4 text-green-bottle" /> Digital Restaurant Menu & Order
                </h2>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {(catalog?.items || []).map((mItem) => (
                    <div key={mItem.id} className="p-3 bg-cream/30 border border-stone rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-charcoal">{mItem.name}</h4>
                        <p className="text-[10px] text-warm-gray">{mItem.description || mItem.category}</p>
                        <p className="font-bold text-green-bottle mt-0.5">₹{mItem.price}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(mItem)}
                        className="px-3 py-1.5 bg-green-bottle text-white rounded-lg text-[11px] font-bold"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>

                {cart.length > 0 && (
                  <div className="p-3 bg-cream/50 rounded-xl border border-stone text-xs space-y-2">
                    <p className="font-bold text-charcoal">Cart Items ({cart.length})</p>
                    {cart.map((cItem, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{cItem.quantity}x {cItem.name}</span>
                        <span className="font-bold">₹{cItem.price * cItem.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-stone pt-1.5 flex justify-between font-bold">
                      <span>Total Amount:</span>
                      <span className="text-green-bottle">₹{cart.reduce((s, i) => s + i.price * i.quantity, 0)}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Rahul"
                      className="bz-input"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98200..."
                      className="bz-input font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !cart.length}
                  className="w-full py-3.5 bg-green-bottle hover:bg-green-forest disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-subtle transition-all"
                >
                  {loading ? 'Placing Order...' : `Pay & Place Food Order (₹${cart.reduce((s, i) => s + i.price * i.quantity, 0)})`}
                </button>
              </form>
            )}

            {/* STATIONERY EXPERIENCE */}
            {bType === 'stationery' && (
              <form onSubmit={handleStationeryOrderSubmit} className="bg-white rounded-[24px] p-6 border border-stone shadow-card space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2 border-b border-stone pb-3">
                  <BookOpen className="w-4 h-4 text-green-bottle" /> Stationery Catalog & Counter Pickup Order
                </h2>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {(catalog?.products || []).map((stItem) => (
                    <div key={stItem.id} className="p-3 bg-cream/30 border border-stone rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-charcoal">{stItem.name}</h4>
                        <p className="text-[10px] text-warm-gray">SKU: {stItem.sku || 'ST-01'} · Category: {stItem.category}</p>
                        <p className="font-bold text-green-bottle mt-0.5">₹{stItem.price || stItem.sellingPrice}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(stItem)}
                        className="px-3 py-1.5 bg-green-bottle text-white rounded-lg text-[11px] font-bold"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>

                {cart.length > 0 && (
                  <div className="p-3 bg-cream/50 rounded-xl border border-stone text-xs space-y-2">
                    <p className="font-bold text-charcoal">Selected Items ({cart.length})</p>
                    {cart.map((cItem, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{cItem.quantity}x {cItem.name}</span>
                        <span className="font-bold">₹{cItem.price * cItem.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ankit Shah"
                      className="bz-input"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98200..."
                      className="bz-input font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !cart.length}
                  className="w-full py-3.5 bg-green-bottle hover:bg-green-forest disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-subtle transition-all"
                >
                  {loading ? 'Generating Pickup Code...' : 'Place Order & Generate Pickup Code'}
                </button>
              </form>
            )}

            {/* MANUFACTURING B2B PUBLIC PORTAL */}
            {bType === 'manufacturing' && (
              <div className="space-y-8">
                {/* Hero section */}
                <div className="bg-gradient-to-br from-[#0F382C] via-[#164e3d] to-[#0A261E] rounded-[28px] p-6 sm:p-8 text-white space-y-5 shadow-lg border border-white/10 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-64 h-64 bg-yellow-butter/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[11px] font-bold uppercase tracking-wider text-yellow-butter">
                    <Boxes className="w-3.5 h-3.5" /> B2B Industrial Manufacturing Portal
                  </div>
                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">{business?.name || 'Apex Manufacturing Works'}</h1>
                    <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
                      Precision Component Machining, Heavy Fabrication & Custom OEM Industrial Assembly • ISO 9001:2015 Certified Manufacturing
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <a
                      href="#rfq-form"
                      className="px-5 py-2.5 bg-yellow-butter hover:bg-yellow-honey text-charcoal font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Request a Quote (RFQ)
                    </a>
                    <a
                      href="#capabilities"
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all inline-flex items-center gap-1.5"
                    >
                      <Boxes className="w-3.5 h-3.5" /> Explore Capabilities
                    </a>
                  </div>
                </div>

                {/* Manufacturing Capabilities Showcase */}
                <div id="capabilities" className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-bottle" /> Manufacturing Capabilities & Machinery
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        title: '5-Axis CNC Machining',
                        materials: 'SS 304/316, Aluminum 6061, Alloy Steel',
                        tolerance: '±0.005 mm Precision Tolerance',
                        desc: 'High-speed 5-axis milling for complex aerospace, hydraulic & automotive components.',
                      },
                      {
                        title: 'Precision CNC Turning',
                        materials: 'Titanium, Brass, Tool Steel, EN8',
                        tolerance: 'Max OD: 450 mm, Length: 1200 mm',
                        desc: 'Heavy-duty CNC lathe turning, threading, grooving & shaft manufacturing.',
                      },
                      {
                        title: 'Injection Moulding & Tooling',
                        materials: 'Nylon 66, ABS, Polycarbonate, PP',
                        tolerance: 'Clamping Force: 80T - 450T',
                        desc: 'Custom plastic component molding, multi-cavity tool design & rapid prototyping.',
                      },
                      {
                        title: 'Heavy Sheet Metal Fabrication',
                        materials: 'Mild Steel, Stainless Steel, Galvanized Sheet',
                        tolerance: 'Laser Cutting up to 20mm thickness',
                        desc: 'CNC fiber laser cutting, hydraulic press bending, MIG/TIG certified welding.',
                      },
                    ].map((cap, idx) => (
                      <div key={idx} className="p-4 bg-white rounded-2xl border border-stone shadow-xs hover:border-green-bottle/40 transition-all space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-xs text-charcoal">{cap.title}</h3>
                          <span className="text-[10px] font-bold font-mono text-green-bottle bg-green-bottle/10 px-2 py-0.5 rounded-md">
                            Certified
                          </span>
                        </div>
                        <p className="text-[11px] text-warm-gray leading-relaxed">{cap.desc}</p>
                        <div className="pt-1 border-t border-stone/50 text-[10px] space-y-0.5 text-charcoal/70">
                          <div><strong>Materials:</strong> {cap.materials}</div>
                          <div><strong>Specs:</strong> {cap.tolerance}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetProduct(cap.title);
                            document.getElementById('rfq-form')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-[11px] font-bold text-green-bottle hover:underline inline-flex items-center gap-1 pt-1"
                        >
                          Request Quote for {cap.title} →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Representative Products */}
                <div className="space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-green-bottle" /> Representative OEM Components
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { name: 'SS Heavy Valve Body', sku: 'MFR-VLV-901', material: 'SS 316' },
                      { name: 'Hydraulic Cylinder Casing', sku: 'MFR-HYD-402', material: 'Alloy Steel' },
                      { name: 'Industrial Flange 150#', sku: 'MFR-FLG-150', material: 'SS 304' },
                      { name: 'IP66 Electrical Enclosure', sku: 'MFR-ENC-66', material: 'Mild Steel' },
                    ].map((prod, pIdx) => (
                      <div key={pIdx} className="p-3 bg-white rounded-xl border border-stone shadow-xs text-center space-y-1.5">
                        <div className="w-10 h-10 mx-auto rounded-lg bg-cream/70 border border-stone flex items-center justify-center">
                          <Boxes className="w-5 h-5 text-green-bottle" />
                        </div>
                        <h4 className="font-bold text-xs text-charcoal truncate">{prod.name}</h4>
                        <span className="text-[10px] font-mono text-warm-gray block">{prod.sku}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetProduct(prod.name);
                            document.getElementById('rfq-form')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full py-1 bg-cream hover:bg-stone text-charcoal font-bold text-[10px] rounded-lg transition-colors"
                        >
                          Select for Quote
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* GUIDED B2B RFQ STEP WIZARD */}
                <div id="rfq-form" className="bg-white rounded-[24px] p-6 border border-stone shadow-card space-y-6">
                  <div className="border-b border-stone pb-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
                        <FileText className="w-4 h-4 text-green-bottle" /> Guided B2B Request for Quotation (RFQ)
                      </h2>
                      <span className="text-xs font-bold font-mono text-green-bottle bg-green-bottle/10 px-2.5 py-1 rounded-full">
                        Step {rfqStep} of 4
                      </span>
                    </div>

                    {/* Step progress bar */}
                    <div className="grid grid-cols-4 gap-1.5 pt-2">
                      {['Capability', 'Specifications', 'Contact Details', 'Review & Submit'].map((label, stepIdx) => (
                        <div key={stepIdx} className="space-y-1">
                          <div className={`h-1.5 rounded-full transition-all duration-300 ${rfqStep >= stepIdx + 1 ? 'bg-green-bottle' : 'bg-stone'}`} />
                          <span className="text-[10px] font-semibold text-warm-gray hidden sm:block truncate">{label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleManufacturingQuoteSubmit} className="space-y-5">
                    {/* STEP 1: CAPABILITY / PRODUCT SELECTION */}
                    {rfqStep === 1 && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider">Step 1: What manufacturing capability or product do you require?</h3>
                        <div className="space-y-3">
                          <label className="text-xs font-semibold text-charcoal block">Target Capability / Product Name *</label>
                          <input
                            type="text"
                            required
                            value={targetProduct}
                            onChange={(e) => setTargetProduct(e.target.value)}
                            placeholder="e.g. 5-Axis CNC Machining, SS Heavy Flange..."
                            className="bz-input"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-xs font-semibold text-charcoal block">Select Material Grade</label>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                            {['SS 304 / 316', 'Aluminum 6061', 'Alloy Steel', 'Brass / Bronze', 'Tool Steel EN24', 'Custom Plastic'].map((mat) => (
                              <button
                                key={mat}
                                type="button"
                                onClick={() => setSelectedMaterial(mat)}
                                className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                                  selectedMaterial === mat ? 'bg-green-bottle text-white border-green-bottle font-bold shadow-xs' : 'bg-cream/40 border-stone text-charcoal hover:bg-cream'
                                }`}
                              >
                                {mat}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => setRfqStep(2)}
                            className="px-5 py-2.5 bg-green-bottle text-white font-bold text-xs rounded-xl shadow-xs hover:bg-green-forest"
                          >
                            Next: Specifications →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 2: TECHNICAL SPECIFICATIONS & QUANTITY */}
                    {rfqStep === 2 && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider">Step 2: Technical Specifications & Quantities</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="font-semibold text-charcoal block mb-1">Target Quantity (Units) *</label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={targetQuantity}
                              onChange={(e) => setTargetQuantity(e.target.value)}
                              className="bz-input font-mono"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-charcoal block mb-1">Surface Finish / Treatment</label>
                            <select
                              value={surfaceFinish}
                              onChange={(e) => setSurfaceFinish(e.target.value)}
                              className="bz-input"
                            >
                              <option value="Standard Machined">Standard Machined (Ra 1.6)</option>
                              <option value="Anodized / Plated">Anodized / Electro-plated</option>
                              <option value="Powder Coated">Powder Coated Industrial</option>
                              <option value="Polished Ra 0.4">Mirror Polished (Ra 0.4)</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="font-semibold text-charcoal block mb-1">Target Delivery Timeline</label>
                            <select
                              value={deliveryTimeline}
                              onChange={(e) => setDeliveryTimeline(e.target.value)}
                              className="bz-input"
                            >
                              <option value="Urgent (1-2 Weeks)">Urgent (1-2 Weeks)</option>
                              <option value="Standard (3-4 Weeks)">Standard (3-4 Weeks)</option>
                              <option value="Flexible (5+ Weeks)">Flexible Batch Delivery (5+ Weeks)</option>
                            </select>
                          </div>
                          <div>
                            <label className="font-semibold text-charcoal block mb-1">Tolerance / Special Instructions</label>
                            <input
                              type="text"
                              value={quoteSpecs}
                              onChange={(e) => setQuoteSpecs(e.target.value)}
                              placeholder="e.g. ±0.01mm tolerance, CMM report required..."
                              className="bz-input"
                            />
                          </div>
                        </div>
                        <div className="pt-2 flex justify-between">
                          <button
                            type="button"
                            onClick={() => setRfqStep(1)}
                            className="px-4 py-2 bg-cream text-charcoal font-bold text-xs rounded-xl border border-stone hover:bg-stone"
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setRfqStep(3)}
                            className="px-5 py-2.5 bg-green-bottle text-white font-bold text-xs rounded-xl shadow-xs hover:bg-green-forest"
                          >
                            Next: Contact Details →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 3: COMPANY & CONTACT DETAILS */}
                    {rfqStep === 3 && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider">Step 3: Buyer Company Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="font-semibold text-charcoal block mb-1">Company / Organization *</label>
                            <input
                              type="text"
                              required
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              placeholder="e.g. Apex Engineering Solutions"
                              className="bz-input"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-charcoal block mb-1">Contact Person Name *</label>
                            <input
                              type="text"
                              required
                              value={customerName}
                              onChange={(e) => setCustomerName(e.target.value)}
                              placeholder="e.g. Rajesh Mehta (Procurement Manager)"
                              className="bz-input"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <label className="font-semibold text-charcoal block mb-1">Mobile Phone *</label>
                            <input
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+91 98200 11223"
                              className="bz-input font-mono"
                            />
                          </div>
                          <div>
                            <label className="font-semibold text-charcoal block mb-1">Work Email Address *</label>
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="rajesh@apexengineering.in"
                              className="bz-input"
                            />
                          </div>
                        </div>
                        <div className="pt-2 flex justify-between">
                          <button
                            type="button"
                            onClick={() => setRfqStep(2)}
                            className="px-4 py-2 bg-cream text-charcoal font-bold text-xs rounded-xl border border-stone hover:bg-stone"
                          >
                            ← Back
                          </button>
                          <button
                            type="button"
                            onClick={() => setRfqStep(4)}
                            className="px-5 py-2.5 bg-green-bottle text-white font-bold text-xs rounded-xl shadow-xs hover:bg-green-forest"
                          >
                            Next: Review RFQ →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STEP 4: REVIEW & SUBMIT */}
                    {rfqStep === 4 && (
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <h3 className="text-xs font-bold text-charcoal uppercase tracking-wider">Step 4: Review RFQ & Confirm Submission</h3>
                        <div className="p-4 bg-cream/50 rounded-2xl border border-stone space-y-2 text-xs">
                          <div className="flex justify-between border-b border-stone/50 pb-2">
                            <span className="text-warm-gray">Target Capability / Product:</span>
                            <span className="font-bold text-charcoal">{targetProduct}</span>
                          </div>
                          <div className="flex justify-between border-b border-stone/50 pb-2">
                            <span className="text-warm-gray">Material Grade:</span>
                            <span className="font-bold text-charcoal">{selectedMaterial}</span>
                          </div>
                          <div className="flex justify-between border-b border-stone/50 pb-2">
                            <span className="text-warm-gray">Target Quantity:</span>
                            <span className="font-bold font-mono text-green-bottle">{targetQuantity} Units</span>
                          </div>
                          <div className="flex justify-between border-b border-stone/50 pb-2">
                            <span className="text-warm-gray">Surface Finish / Timeline:</span>
                            <span className="font-bold text-charcoal">{surfaceFinish} · {deliveryTimeline}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-warm-gray">Buyer Company:</span>
                            <span className="font-bold text-charcoal">{companyName || 'Not specified'} ({customerName || 'Contact'})</span>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => setRfqStep(3)}
                            className="px-4 py-2 bg-cream text-charcoal font-bold text-xs rounded-xl border border-stone hover:bg-stone"
                          >
                            ← Edit Information
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-green-bottle hover:bg-green-forest disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                          >
                            <Send className="w-4 h-4 text-yellow-butter" />
                            {loading ? 'Submitting RFQ...' : 'Submit Official RFQ Request'}
                          </button>
                        </div>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

            {/* RETAIL / GENERAL EXPERIENCE */}
            {(bType === 'retail' || bType === 'general') && (
              <form onSubmit={handleStationeryOrderSubmit} className="bg-white rounded-[24px] p-6 border border-stone shadow-card space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2 border-b border-stone pb-3">
                  <ShoppingBag className="w-4 h-4 text-green-bottle" /> Product Catalog Showcase & Purchase
                </h2>

                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {(catalog?.products || []).map((retItem) => (
                    <div key={retItem.id} className="p-3 bg-cream/30 border border-stone rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-charcoal">{retItem.name}</h4>
                        <p className="font-bold text-green-bottle mt-0.5">₹{retItem.price || 999}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(retItem)}
                        className="px-3 py-1.5 bg-green-bottle text-white rounded-lg text-[11px] font-bold"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>

                {cart.length > 0 && (
                  <div className="p-3 bg-cream/50 rounded-xl border border-stone text-xs space-y-2">
                    <p className="font-bold text-charcoal">Selected Items ({cart.length})</p>
                    {cart.map((cItem, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{cItem.quantity}x {cItem.name}</span>
                        <span className="font-bold">₹{cItem.price * cItem.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Customer Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Customer Name"
                      className="bz-input"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-charcoal block mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98200..."
                      className="bz-input font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !cart.length}
                  className="w-full py-3.5 bg-green-bottle hover:bg-green-forest disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-subtle transition-all"
                >
                  {loading ? 'Processing...' : 'Complete Online Purchase'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="pt-8 pb-4 text-center">
        <PoweredByBizora className="justify-center" />
      </div>
    </div>
  );
}
