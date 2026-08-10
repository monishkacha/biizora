import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { restaurantApi } from '../../api/client';
import { PoweredByBizora } from '../../components/ui/PoweredByBizora';
import {
  Utensils,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  QrCode,
  Truck,
  Sparkles,
} from 'lucide-react';

export default function PublicOrderingPage() {
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('table');

  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState(tableParam ? 'dine_in' : 'takeaway');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [error, setError] = useState('');

  const categories = ['All', 'Starters', 'Main Course', 'Rice & Biryani', 'Breads', 'Desserts', 'Beverages'];

  useEffect(() => {
    restaurantApi
      .getMenuItems()
      .then((res) => setMenuItems(res.menuItems || []))
      .catch(() => setMenuItems([]));
  }, []);

  const handleAddToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => (c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQty = (id, delta) => {
    setCart((prev) => {
      const next = [...prev];
      const idx = next.findIndex((c) => c.id === id);
      if (idx >= 0) {
        next[idx].quantity += delta;
        if (next[idx].quantity <= 0) {
          return next.filter((c) => c.id !== id);
        }
      }
      return next;
    });
  };

  const filteredMenuItems = menuItems.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxAmount = Math.round(subtotal * 0.05);
  const grandTotal = Math.round(subtotal + taxAmount);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!customerName || !phone || cart.length === 0) return;

    setError('');
    setLoading(true);

    try {
      const res = await restaurantApi.publicCreateOrder({
        orderType,
        tableNumber: tableParam || null,
        customerName,
        phone,
        deliveryAddress,
        items: cart,
      });

      if (res.order) {
        setSubmittedOrder(res.order);
        setCart([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream/50 flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="max-w-md mx-auto w-full space-y-5">
        {/* Header */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-green-bottle text-white flex items-center justify-center mx-auto shadow-sm">
            <Utensils className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold text-charcoal">The Olive Table</h1>
          {tableParam ? (
            <span className="inline-flex items-center gap-1 bg-amber-500/15 text-amber-900 border border-amber-500/30 text-xs font-extrabold px-3 py-0.5 rounded-full">
              <QrCode className="w-3.5 h-3.5" /> Table {tableParam} QR Menu
            </span>
          ) : (
            <p className="text-xs text-warm-gray font-medium">Online Menu & Direct Ordering</p>
          )}
        </div>

        {submittedOrder ? (
          /* Order Status Tracker */
          <div className="bg-white rounded-3xl p-6 border border-stone shadow-xl space-y-5 text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-charcoal">Order Received!</h2>
              <p className="text-xs text-warm-gray mt-0.5">
                Order <span className="font-bold text-green-bottle">{submittedOrder.orderNumber}</span> sent to kitchen.
              </p>
            </div>

            {/* Status Steps */}
            <div className="bg-cream/60 p-4 rounded-2xl border border-stone/50 space-y-3 text-left">
              <div className="text-xs font-bold text-warm-gray uppercase tracking-wider">Live Status</div>
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-green-bottle">Kitchen Received</span>
                <span className="bg-amber-500/15 text-amber-900 px-2.5 py-0.5 rounded-full capitalize">
                  {submittedOrder.kitchenStatus}
                </span>
              </div>
            </div>

            <button
              onClick={() => setSubmittedOrder(null)}
              className="w-full py-3 bg-green-bottle text-white font-bold text-sm rounded-xl hover:bg-green-bottle/90"
            >
              Order More Items
            </button>
          </div>
        ) : (
          /* Menu & Cart */
          <div className="space-y-4">
            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-green-bottle text-white shadow-subtle'
                      : 'bg-white text-charcoal/70 border border-stone hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dishes */}
            <div className="space-y-3">
              {filteredMenuItems.map((item) => {
                const cartQty = (cart.find((c) => c.id === item.id) || {}).quantity || 0;
                return (
                  <div
                    key={item.id}
                    className="bg-white p-4 rounded-2xl border border-stone/40 shadow-sm flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            item.foodType === 'non-veg' ? 'bg-rose-600' : 'bg-emerald-600'
                          }`}
                        />
                        <h3 className="font-bold text-charcoal text-sm">{item.name}</h3>
                      </div>
                      <p className="text-xs text-warm-gray line-clamp-2">{item.description}</p>
                      <div className="text-sm font-extrabold text-green-bottle">₹{item.price}</div>
                    </div>

                    {cartQty > 0 ? (
                      <div className="flex items-center bg-cream rounded-xl border border-stone p-1 shrink-0">
                        <button onClick={() => handleUpdateQty(item.id, -1)} className="p-1">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 font-bold text-xs">{cartQty}</span>
                        <button onClick={() => handleUpdateQty(item.id, 1)} className="p-1">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="px-3 py-1.5 bg-green-bottle text-white text-xs font-bold rounded-xl hover:bg-green-bottle/90 shrink-0"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Cart & Checkout */}
            {cart.length > 0 && (
              <form onSubmit={handleSubmitOrder} className="bg-white p-5 rounded-3xl border border-stone shadow-xl space-y-4">
                <h2 className="text-base font-extrabold text-charcoal flex justify-between items-center border-b border-stone/40 pb-2">
                  <span className="flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-green-bottle" /> Cart ({cart.length} items)
                  </span>
                  <span className="text-green-bottle text-base">₹{grandTotal}</span>
                </h2>

                {error && (
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-charcoal">Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your Name"
                      className="w-full mt-1 p-2.5 rounded-xl border border-stone text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-charcoal">Phone *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98200..."
                      className="w-full mt-1 p-2.5 rounded-xl border border-stone text-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-green-bottle text-white font-bold text-sm rounded-xl hover:bg-green-bottle/90 transition-all shadow-md disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Place Order Now'}
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
