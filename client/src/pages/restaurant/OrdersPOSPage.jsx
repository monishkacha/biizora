import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  Receipt,
  Users,
  Utensils,
  Clock,
  Sparkles,
  ShoppingBag,
  CheckCircle,
  Filter,
} from 'lucide-react';

export default function OrdersPOSPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramTableId = searchParams.get('tableId');

  const {
    tables,
    menuItems,
    orders,
    createOrder,
    updateKitchenStatus,
    showToast,
  } = useBusiness();

  // Selected state for POS creation
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTableId, setSelectedTableId] = useState(paramTableId || '');
  const [orderType, setOrderType] = useState('dine_in');
  const [customerName, setCustomerName] = useState('Walk-in Guest');
  const [phone, setPhone] = useState('');
  const [cart, setCart] = useState([]);
  const [orderNotes, setOrderNotes] = useState('');

  // Modifier modal state
  const [activeItemForMod, setActiveItemForMod] = useState(null);
  const [itemNote, setItemNote] = useState('');
  const [selectedMods, setSelectedMods] = useState([]);

  const categories = ['All', 'Starters', 'Main Course', 'Rice & Biryani', 'Breads', 'Desserts', 'Beverages'];

  useEffect(() => {
    if (paramTableId) setSelectedTableId(paramTableId);
  }, [paramTableId]);

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOpenModifier = (item) => {
    setActiveItemForMod(item);
    setItemNote('');
    setSelectedMods([]);
  };

  const handleToggleModifierOption = (groupName, option) => {
    setSelectedMods((prev) => {
      const exists = prev.find((m) => m.optionName === option.name);
      if (exists) {
        return prev.filter((m) => m.optionName !== option.name);
      }
      return [...prev, { groupName, optionName: option.name, price: option.price }];
    });
  };

  const handleAddToCartWithMods = () => {
    if (!activeItemForMod) return;

    const modTotal = selectedMods.reduce((s, m) => s + m.price, 0);
    const unitPrice = activeItemForMod.price + modTotal;

    const cartItem = {
      menuItemId: activeItemForMod.id,
      name: activeItemForMod.name,
      price: activeItemForMod.price,
      unitPrice,
      quantity: 1,
      foodType: activeItemForMod.foodType,
      kitchenStation: activeItemForMod.kitchenStation,
      modifiers: selectedMods,
      notes: itemNote,
      gstRate: activeItemForMod.gstRate || 5,
    };

    setCart((prev) => [...prev, cartItem]);
    setActiveItemForMod(null);
  };

  const handleAddToCartQuick = (item) => {
    if (item.modifiers && item.modifiers.length > 0) {
      handleOpenModifier(item);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id && (!c.modifiers || c.modifiers.length === 0));
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          unitPrice: item.price,
          quantity: 1,
          foodType: item.foodType,
          kitchenStation: item.kitchenStation,
          modifiers: [],
          notes: '',
          gstRate: item.gstRate || 5,
        },
      ];
    });
  };

  const handleUpdateQty = (index, delta) => {
    setCart((prev) => {
      const next = [...prev];
      next[index].quantity += delta;
      if (next[index].quantity <= 0) {
        return next.filter((_, i) => i !== index);
      }
      return next;
    });
  };

  const handleRemoveFromCart = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const taxAmount = Math.round(subtotal * 0.05); // 5% GST for restaurant
  const grandTotal = Math.round(subtotal + taxAmount);

  const handleSendToKitchen = async () => {
    if (cart.length === 0) {
      showToast('Cart is empty. Please select menu items.', 'error');
      return;
    }

    try {
      await createOrder({
        orderType,
        tableId: selectedTableId || null,
        customerName,
        phone,
        items: cart,
        notes: orderNotes,
      });

      setCart([]);
      setOrderNotes('');
    } catch (err) {
      showToast(err.message || 'Failed to create order', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">POS & Order Entry</h1>
          <p className="text-sm text-warm-gray mt-0.5">
            Create dine-in, takeaway, delivery, or QR orders and send directly to Kitchen Display.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {['dine_in', 'takeaway', 'delivery', 'online'].map((t) => (
            <button
              key={t}
              onClick={() => setOrderType(t)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                orderType === t
                  ? 'bg-green-bottle text-white shadow-subtle'
                  : 'bg-cream text-charcoal/70 border border-stone hover:bg-stone-200'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Layout: Left POS Catalog, Right Cart & Active Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Catalog (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Category Pills */}
          <div className="bg-white p-4 rounded-2xl border border-stone/40 space-y-3 shadow-sm">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-warm-gray" />
              <input
                type="text"
                placeholder="Search menu items (e.g. Butter Chicken, Naan)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone/60 text-sm focus:outline-none focus:border-green-bottle"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-green-bottle text-white shadow-subtle'
                      : 'bg-cream text-charcoal/70 border border-stone hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleAddToCartQuick(item)}
                className="bg-white p-4 rounded-2xl border border-stone/40 shadow-sm hover:border-green-bottle/60 hover:shadow-md transition-all cursor-pointer flex justify-between items-start"
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        item.foodType === 'non-veg' ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}
                    />
                    <h3 className="font-bold text-charcoal text-sm">{item.name}</h3>
                  </div>
                  <p className="text-xs text-warm-gray line-clamp-2">{item.description}</p>
                  <div className="text-sm font-extrabold text-green-bottle pt-1">₹{item.price}</div>
                </div>

                <button className="p-2 bg-green-bottle/10 text-green-bottle rounded-xl hover:bg-green-bottle hover:text-white transition-all shrink-0">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Order Cart (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-stone/40 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-charcoal flex items-center justify-between border-b border-stone/50 pb-3">
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-green-bottle" /> Current Order Cart
              </span>
              <span className="text-xs text-warm-gray">{cart.length} items</span>
            </h2>

            {/* Table & Customer Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-charcoal">Select Table</label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl border border-stone text-xs"
                >
                  <option value="">No Table (Takeaway)</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl border border-stone text-xs"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-stone/40 max-h-72 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-warm-gray text-xs font-medium">
                  Cart is empty. Click menu items on the left to build order.
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 max-w-[60%]">
                      <div className="font-bold text-charcoal">{item.name}</div>
                      {item.modifiers && item.modifiers.length > 0 && (
                        <div className="text-[10px] text-warm-gray">
                          {item.modifiers.map((m) => m.optionName).join(', ')}
                        </div>
                      )}
                      {item.notes && (
                        <div className="text-[10px] text-amber-700 italic">Note: {item.notes}</div>
                      )}
                      <div className="text-green-bottle font-semibold">₹{item.unitPrice} each</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-cream rounded-lg border border-stone p-1">
                        <button
                          onClick={() => handleUpdateQty(idx, -1)}
                          className="p-1 text-charcoal hover:bg-stone-200 rounded"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQty(idx, 1)}
                          className="p-1 text-charcoal hover:bg-stone-200 rounded"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveFromCart(idx)}
                        className="text-rose-600 hover:text-rose-800 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Subtotal & Action */}
            {cart.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-stone/50">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-warm-gray">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-warm-gray">
                    <span>GST (5%)</span>
                    <span>₹{taxAmount}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-charcoal pt-1 border-t border-stone/30">
                    <span>Total Amount</span>
                    <span className="text-green-bottle">₹{grandTotal}</span>
                  </div>
                </div>

                <button
                  onClick={handleSendToKitchen}
                  className="w-full py-3 bg-green-bottle text-white font-bold text-sm rounded-xl hover:bg-green-bottle/90 transition-all flex items-center justify-center gap-2 shadow-subtle"
                >
                  <Send className="w-4 h-4" /> Send Order to Kitchen
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Orders Section */}
      <div className="bg-white p-5 rounded-2xl border border-stone/40 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-charcoal flex items-center justify-between">
          <span>Active Restaurant Orders</span>
          <span className="text-xs text-warm-gray">{orders.filter((o) => o.orderStatus === 'active').length} active</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders
            .filter((o) => o.orderStatus === 'active')
            .map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-2xl border border-stone/60 bg-cream/30 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start border-b border-stone/40 pb-2">
                    <div>
                      <span className="font-extrabold text-charcoal text-base">{order.orderNumber}</span>
                      <span className="text-xs text-warm-gray ml-2">({order.tableName || order.orderType})</span>
                    </div>
                    <span className="bg-amber-500/15 text-amber-900 border border-amber-500/30 text-xs font-bold px-2 py-0.5 rounded-full capitalize">
                      {order.kitchenStatus}
                    </span>
                  </div>

                  <div className="my-2 space-y-1 text-xs">
                    {order.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-charcoal/80">
                        <span>{it.quantity}× {it.name}</span>
                        <span className="font-semibold">₹{it.price * it.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone/40 flex items-center justify-between">
                  <div className="font-extrabold text-green-bottle text-base">
                    ₹{order.grandTotal}
                  </div>
                  <button
                    onClick={() => navigate(`/app/billing?orderId=${order.id}`)}
                    className="px-3.5 py-1.5 bg-green-bottle text-white text-xs font-bold rounded-xl hover:bg-green-bottle/90 flex items-center gap-1"
                  >
                    <Receipt className="w-3.5 h-3.5" /> Billing / Pay
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modifier Selection Modal */}
      {activeItemForMod && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone space-y-4">
            <h2 className="text-xl font-bold text-charcoal">Customize {activeItemForMod.name}</h2>

            {(activeItemForMod.modifiers || []).map((grp, gIdx) => (
              <div key={gIdx} className="space-y-2">
                <label className="text-xs font-bold text-warm-gray uppercase tracking-wider">{grp.name}</label>
                <div className="grid grid-cols-2 gap-2">
                  {grp.options.map((opt, oIdx) => {
                    const selected = selectedMods.some((m) => m.optionName === opt.name);
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleToggleModifierOption(grp.name, opt)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold flex justify-between items-center transition-all ${
                          selected
                            ? 'bg-green-bottle text-white border-green-bottle'
                            : 'bg-cream text-charcoal border-stone hover:bg-stone-200'
                        }`}
                      >
                        <span>{opt.name}</span>
                        <span>{opt.price > 0 ? `+₹${opt.price}` : ''}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div>
              <label className="text-xs font-semibold text-charcoal">Kitchen Special Note</label>
              <input
                type="text"
                placeholder="e.g. Less spicy, Extra gravy..."
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl border border-stone text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveItemForMod(null)}
                className="flex-1 py-2.5 bg-stone-100 text-charcoal font-semibold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddToCartWithMods}
                className="flex-1 py-2.5 bg-green-bottle text-white font-bold text-xs rounded-xl hover:bg-green-bottle/90"
              >
                Add to Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
