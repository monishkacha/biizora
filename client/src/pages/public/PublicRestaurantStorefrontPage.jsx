import React, { useState, useEffect, useMemo } from 'react';
import {
  Utensils,
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Check,
  ChevronRight,
  MapPin,
  Clock,
  Award,
  Star,
  MessageSquare,
  X,
  ChefHat
} from 'lucide-react';
import { PoweredByBizora } from '../../components/ui/PoweredByBizora';

const DEFAULT_MENU_ITEMS = [
  {
    id: 'rest-1',
    name: 'Paneer Tikka Platter',
    category: 'Starters',
    price: 380,
    foodType: 'veg',
    description: 'Char-grilled cottage cheese marinated in aromatic Kashmiri spices, hung curd, and mustard oil. Served with mint chutney.',
    image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80',
    tags: ['BESTSELLER', "CHEF'S SPECIAL"],
    prepTime: '15-20 min',
    ingredients: ['Cottage Cheese', 'Hung Curd', 'Kashmiri Red Chili', 'Mustard Oil'],
    allergens: ['Dairy', 'Mustard'],
  },
  {
    id: 'rest-2',
    name: 'Butter Chicken Special',
    category: 'Main Course',
    price: 490,
    foodType: 'non-veg',
    description: 'Tender tandoori chicken cooked in a rich, velvety tomato and cashew nut gravy finished with real butter and fresh fenugreek.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
    tags: ['BESTSELLER'],
    prepTime: '20-25 min',
    ingredients: ['Chicken Tikka', 'Butter', 'Cashew Nut Paste', 'Fresh Cream'],
    allergens: ['Dairy', 'Tree Nuts'],
  },
  {
    id: 'rest-3',
    name: 'Dal Makhani Signature',
    category: 'North Indian',
    price: 340,
    foodType: 'veg',
    description: 'Black lentils slow-cooked overnight on charcoal embers with butter, cream, and subtle Indian spices. Unmatched silkiness.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    tags: ['BESTSELLER'],
    prepTime: '15 min',
    ingredients: ['Black Urad Dal', 'Butter', 'Fresh Tomato Puree', 'Cream'],
    allergens: ['Dairy'],
  },
  {
    id: 'rest-4',
    name: 'Truffle Mushroom Risotto',
    category: 'Italian',
    price: 520,
    foodType: 'veg',
    description: 'Arborio rice slow-stirred with wild portobello mushrooms, parmesan cheese, and drizzled with white truffle oil.',
    image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=600&auto=format&fit=crop&q=80',
    tags: ["CHEF'S SPECIAL", 'NEW'],
    prepTime: '20 min',
    ingredients: ['Arborio Rice', 'Portobello Mushroom', 'Parmesan Cheese', 'Truffle Oil'],
    allergens: ['Dairy', 'Gluten'],
  },
  {
    id: 'rest-5',
    name: 'Tandoori Garlic Naan',
    category: 'North Indian',
    price: 85,
    foodType: 'veg',
    description: 'Leavened bread baked live in traditional clay tandoor, topped with minced garlic, fresh coriander, and melted butter.',
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
    tags: ['MUST TRY'],
    prepTime: '10 min',
    ingredients: ['Refined Flour', 'Butter', 'Garlic', 'Coriander'],
    allergens: ['Gluten', 'Dairy'],
  },
  {
    id: 'rest-6',
    name: 'Sizzling Brownie with Ice Cream',
    category: 'Desserts',
    price: 290,
    foodType: 'veg',
    description: 'Dense dark chocolate brownie served piping hot on a sizzling iron skillet, topped with Madagascar vanilla ice cream.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    tags: ['BESTSELLER'],
    prepTime: '10 min',
    ingredients: ['Belgian Chocolate', 'Vanilla Ice Cream', 'Walnuts'],
    allergens: ['Dairy', 'Gluten', 'Nuts'],
  },
  {
    id: 'rest-7',
    name: 'Fresh Lime Mint Cooler',
    category: 'Beverages',
    price: 140,
    foodType: 'veg',
    description: 'Refreshing crushed mint leaves, freshly squeezed lime, pink salt, and sparkling soda served on crushed ice.',
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    tags: ['REFRESHING'],
    prepTime: '5 min',
    ingredients: ['Fresh Lime', 'Mint Leaves', 'Soda', 'Pink Salt'],
    allergens: [],
  },
  {
    id: 'rest-8',
    name: 'Manchow Soup Crisp',
    category: 'Soups',
    price: 210,
    foodType: 'veg',
    description: 'Spicy and tangy Indo-Chinese soup loaded with finely chopped vegetables, garlic, soy sauce, served with crispy fried noodles.',
    image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop&q=80',
    tags: ['SPICY'],
    prepTime: '12 min',
    ingredients: ['Carrot', 'Cabbage', 'Garlic', 'Soy Sauce'],
    allergens: ['Soy', 'Gluten'],
  },
];

const CATEGORIES = ['All', 'Starters', 'Soups', 'Main Course', 'North Indian', 'Italian', 'Desserts', 'Beverages', 'Specials'];

export default function PublicRestaurantStorefrontPage({ business, catalog, slug }) {
  const urlParams = new URLSearchParams(window.location.search);
  const tableParam = urlParams.get('table') || '';

  const restaurantName = business?.name || 'The Olive Table';
  const city = business?.city || 'Gujarat, India';
  const phone = business?.phone || '+91 98250 12345';
  const tagline = business?.tagline || 'Good food. Beautiful moments.';

  const menuItems = useMemo(() => {
    const rawItems = catalog?.items || catalog?.menuItems || [];
    if (rawItems.length > 0) {
      return rawItems.map((item, idx) => ({
        id: item._id?.toString() || item.id || `menu-${idx}`,
        name: item.name,
        category: item.category || 'Main Course',
        price: item.price || item.sellingPrice || 350,
        foodType: item.foodType || (item.name.toLowerCase().includes('chicken') || item.name.toLowerCase().includes('mutton') ? 'non-veg' : 'veg'),
        description: item.description || `Signature ${item.name} prepared fresh by our executive chefs.`,
        image: item.image || DEFAULT_MENU_ITEMS[idx % DEFAULT_MENU_ITEMS.length].image,
        tags: item.isBestseller ? ['BESTSELLER'] : item.isChefSpecial ? ["CHEF'S SPECIAL"] : [DEFAULT_MENU_ITEMS[idx % DEFAULT_MENU_ITEMS.length].tags[0]],
        prepTime: `${item.preparationTime || 15-20} min`,
        ingredients: item.ingredients || DEFAULT_MENU_ITEMS[idx % DEFAULT_MENU_ITEMS.length].ingredients,
        allergens: item.allergens || DEFAULT_MENU_ITEMS[idx % DEFAULT_MENU_ITEMS.length].allergens,
      }));
    }
    return DEFAULT_MENU_ITEMS;
  }, [catalog]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItemModal, setActiveItemModal] = useState(null);

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const [itemSpiceLevel, setItemSpiceLevel] = useState('Medium');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [itemSpecialNotes, setItemSpecialNotes] = useState('');

  const [orderType, setOrderType] = useState(tableParam ? 'dine_in' : 'takeaway');
  const [tableNumber, setTableNumber] = useState(tableParam || '4');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('PAY_ONLINE');
  const [submitting, setSubmitting] = useState(false);

  const [activeOrder, setActiveOrder] = useState(null);
  const [orderStep, setOrderStep] = useState(1);
  const [simulatedWhatsApp, setSimulatedWhatsApp] = useState(null);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase() || (selectedCategory === 'Specials' && (item.tags?.includes('BESTSELLER') || item.tags?.includes("CHEF'S SPECIAL")));
      const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  const cartSubtotal = useMemo(() => cart.reduce((acc, item) => acc + item.totalPrice * item.quantity, 0), [cart]);
  const taxAmount = Math.round(cartSubtotal * 0.05);
  const deliveryFee = orderType === 'delivery' ? 40 : 0;
  const grandTotal = cartSubtotal + taxAmount + deliveryFee;

  const totalCartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const handleAddToCart = (item, spiceLevel = 'Medium', addons = [], notes = '') => {
    const addonTotal = addons.reduce((sum, a) => sum + a.price, 0);
    const unitPrice = item.price + addonTotal;
    const cartItemId = `${item.id}-${spiceLevel}-${addons.map((a) => a.name).join('-')}`;

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex((i) => i.cartItemId === cartItemId);
      if (existingIdx >= 0) {
        const nextCart = [...prevCart];
        nextCart[existingIdx].quantity += 1;
        return nextCart;
      }
      return [
        ...prevCart,
        {
          cartItemId,
          id: item.id,
          name: item.name,
          basePrice: item.price,
          unitPrice,
          totalPrice: unitPrice,
          quantity: 1,
          foodType: item.foodType,
          spiceLevel,
          addons,
          notes,
          image: item.image,
        },
      ];
    });

    setActiveItemModal(null);
  };

  const updateCartQuantity = (cartItemId, delta) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const handlePlaceOrder = async (e) => {
    e?.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      alert('Please enter your name and phone number.');
      return;
    }
    if (!cart.length) {
      alert('Your cart is empty.');
      return;
    }

    setSubmitting(true);
    const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();

    try {
      const res = await fetch('/api/public/restaurant/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: slug || 'restaurant-demo',
          customerName,
          phone: customerPhone,
          tableNo: orderType === 'dine_in' ? tableNumber : '',
          orderType,
          deliveryAddress: orderType === 'delivery' ? deliveryAddress : '',
          pickupCode: orderType === 'takeaway' ? pickupCode : '',
          items: cart.map((c) => ({
            name: c.name,
            quantity: c.quantity,
            price: c.unitPrice,
            modifiers: c.addons,
            notes: `${c.spiceLevel} spice${c.notes ? ` | Notes: ${c.notes}` : ''}`,
          })),
          paymentMethod: paymentMethod === 'PAY_ONLINE' ? 'Razorpay' : 'Pay at Counter',
          subtotal: cartSubtotal,
          tax: taxAmount,
          grandTotal,
        }),
      });
      const data = await res.json();

      const createdObj = {
        orderId: data.order?.orderId || `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        orderNumber: data.order?.orderNumber || `#${Math.floor(1000 + Math.random() * 9000)}`,
        customerName,
        customerPhone,
        orderType,
        tableNumber: orderType === 'dine_in' ? (tableNumber || '4') : '',
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : '',
        pickupCode,
        items: [...cart],
        subtotal: cartSubtotal,
        tax: taxAmount,
        deliveryFee,
        grandTotal,
        paymentMethod: paymentMethod === 'PAY_ONLINE' ? 'Razorpay (PAID)' : 'Pay at Counter (PENDING)',
        paymentStatus: paymentMethod === 'PAY_ONLINE' ? 'PAID' : 'PAY_AT_COUNTER',
        status: 'PENDING RESTAURANT ACCEPTANCE',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setActiveOrder(createdObj);
      setCartOpen(false);
      setCart([]);
      setOrderStep(1);

      setSimulatedWhatsApp({
        to: customerPhone,
        message: `Hi ${customerName} 👋 Your order ${createdObj.orderNumber} from ${restaurantName} has been received! We'll notify you as soon as the kitchen accepts it.`,
      });
    } catch {
      const createdObj = {
        orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        orderNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
        customerName,
        customerPhone,
        orderType,
        tableNumber: orderType === 'dine_in' ? (tableNumber || '4') : '',
        deliveryAddress: orderType === 'delivery' ? deliveryAddress : '',
        pickupCode,
        items: [...cart],
        subtotal: cartSubtotal,
        tax: taxAmount,
        deliveryFee,
        grandTotal,
        paymentMethod: paymentMethod === 'PAY_ONLINE' ? 'Razorpay (PAID)' : 'Pay at Counter (PENDING)',
        paymentStatus: paymentMethod === 'PAY_ONLINE' ? 'PAID' : 'PAY_AT_COUNTER',
        status: 'PENDING RESTAURANT ACCEPTANCE',
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setActiveOrder(createdObj);
      setCartOpen(false);
      setCart([]);
      setOrderStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!activeOrder?.orderId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/public/order-status/${activeOrder.orderId}`);
        const data = await res.json();
        if (res.ok && data.status) {
          const s = data.status.toLowerCase();
          if (s.includes('accepted')) setOrderStep(2);
          else if (s.includes('preparing')) setOrderStep(3);
          else if (s.includes('ready')) setOrderStep(4);
          else if (s.includes('completed') || s.includes('served') || s.includes('picked')) setOrderStep(5);
        }
      } catch {}
    }, 4000);
    return () => clearInterval(interval);
  }, [activeOrder]);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F2937] font-sans selection:bg-[#E6B800]/30 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#0F382C]/10 transition-all">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0F382C] text-[#E6B800] flex items-center justify-center shadow-md">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold text-[#0F382C] tracking-wide leading-tight flex items-center gap-2">
                {restaurantName}
                {tableParam && (
                  <span className="text-[10px] font-sans font-bold bg-[#E6B800] text-[#0F382C] px-2 py-0.5 rounded-full">
                    Table #{tableParam}
                  </span>
                )}
              </h1>
              <p className="text-[11px] text-[#0F382C]/70 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Fine Dining • {city}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food menu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-white border border-[#0F382C]/15 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#0F382C]/20 w-48"
              />
            </div>

            <button
              onClick={() => setCartOpen(true)}
              className="relative px-4 py-2 bg-[#0F382C] text-white hover:bg-[#0F382C]/90 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-[#E6B800]" />
              <span className="hidden sm:inline">Order</span>
              {totalCartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#E6B800] text-[#0F382C] font-black text-[10px] flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-[#0F382C] text-[#FAF8F5] overflow-hidden py-12 sm:py-16 px-4">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#E6B800_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#E6B800]/30 text-xs font-medium text-[#E6B800]">
            <Award className="w-4 h-4" />
            <span>Luxury Resort & Fine Dining Sanctuary</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
            {tagline}
          </h2>

          <p className="max-w-xl mx-auto text-xs sm:text-sm text-emerald-100/80 font-light leading-relaxed">
            Authentic culinary masterpieces crafted with fresh farm produce, wood-fired spices, and artisanal passion.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#digital-menu"
              className="px-6 py-3 bg-[#E6B800] hover:bg-[#E6B800]/90 text-[#0F382C] font-bold rounded-2xl shadow-xl text-xs transition-all transform hover:-translate-y-0.5 inline-flex items-center gap-2"
            >
              <ChefHat className="w-4 h-4" />
              EXPLORE DIGITAL MENU
            </a>
            {activeOrder && (
              <button
                onClick={() => setOrderStep(activeOrder ? orderStep : 1)}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl border border-white/20 backdrop-blur-md text-xs transition-all flex items-center gap-2"
              >
                <Clock className="w-4 h-4 text-[#E6B800]" />
                TRACK ACTIVE ORDER ({activeOrder.orderNumber})
              </button>
            )}
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-100/70 border-t border-white/10 max-w-lg mx-auto">
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 text-[#E6B800] fill-[#E6B800]" />
              <strong>4.9 / 5.0</strong> (240+ Verified Diner Reviews)
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#E6B800]" />
              {city}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#E6B800]" />
              11:00 AM - 11:00 PM
            </span>
          </div>
        </div>
      </section>

      {/* Active Order Banner */}
      {activeOrder && (
        <section className="max-w-4xl mx-auto px-4 mt-6">
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-[#0F382C]/20 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0F382C] bg-[#E6B800] px-3 py-0.5 rounded-full">
                    LIVE ORDER STATUS
                  </span>
                  <span className="font-mono text-sm font-bold text-gray-700">{activeOrder.orderNumber}</span>
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0F382C]">
                  {orderStep === 1 && 'Order Received — Waiting for Restaurant'}
                  {orderStep === 2 && 'Restaurant Accepted Your Order'}
                  {orderStep === 3 && '👨‍🍳 Kitchen is Preparing Your Food'}
                  {orderStep === 4 && (activeOrder.orderType === 'takeaway' ? '✨ Ready for Pickup!' : activeOrder.orderType === 'delivery' ? '🛵 Out for Delivery' : '🍽️ Coming to Your Table!')}
                  {orderStep === 5 && '✅ Order Completed. Enjoy Your Meal!'}
                </h3>
              </div>

              {activeOrder.orderType === 'takeaway' && activeOrder.pickupCode && (
                <div className="bg-[#0F382C] text-white px-5 py-3 rounded-2xl text-center shadow-md">
                  <p className="text-[10px] text-[#E6B800] uppercase font-bold tracking-wider">Pickup Verification Code</p>
                  <p className="text-2xl font-mono font-black text-[#E6B800] tracking-widest">{activeOrder.pickupCode}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-bold text-[#0F382C]">
                <span className={orderStep >= 1 ? 'text-[#0F382C]' : 'text-gray-400'}>Received</span>
                <span className={orderStep >= 2 ? 'text-[#0F382C]' : 'text-gray-400'}>Accepted</span>
                <span className={orderStep >= 3 ? 'text-[#0F382C]' : 'text-gray-400'}>Preparing</span>
                <span className={orderStep >= 4 ? 'text-[#0F382C]' : 'text-gray-400'}>{activeOrder.orderType === 'takeaway' ? 'Ready' : activeOrder.orderType === 'delivery' ? 'Out' : 'Ready'}</span>
                <span className={orderStep >= 5 ? 'text-[#0F382C]' : 'text-gray-400'}>Served</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#0F382C] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${(orderStep / 5) * 100}%` }}
                />
              </div>
            </div>

            {simulatedWhatsApp && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-emerald-900 text-[11px]">WhatsApp Notification Sent to {simulatedWhatsApp.to}:</p>
                  <p className="text-[#1F2937] font-mono text-[11px] mt-0.5 bg-white p-2 rounded-xl border border-emerald-200">
                    "{simulatedWhatsApp.message}"
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#FAF8F5] p-4 rounded-2xl border border-[#0F382C]/10">
              <div>
                <span className="text-gray-500 text-[10px] block">Customer</span>
                <span className="font-bold text-[#0F382C]">{activeOrder.customerName}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block">Order Type</span>
                <span className="font-bold text-[#0F382C] uppercase">{activeOrder.orderType} {activeOrder.tableNumber ? `(Table #${activeOrder.tableNumber})` : ''}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block">Total Amount</span>
                <span className="font-bold text-[#0F382C]">₹{activeOrder.grandTotal}</span>
              </div>
              <div>
                <span className="text-gray-500 text-[10px] block">Payment Method</span>
                <span className="font-bold text-emerald-700">{activeOrder.paymentMethod}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Menu Section */}
      <section id="digital-menu" className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F382C]">
            Our Digital Menu
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
            Select items to order directly to your table, for counter takeaway, or home delivery.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0F382C] text-[#FAF8F5] shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="sm:hidden">
          <input
            type="text"
            placeholder="Search food items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-2xl text-xs"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const inCart = cart.find((c) => c.id === item.id);
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-[#0F382C]/10 transition-all flex flex-col justify-between group"
              >
                <div
                  onClick={() => {
                    setActiveItemModal(item);
                    setItemSpiceLevel('Medium');
                    setSelectedAddons([]);
                    setItemSpecialNotes('');
                  }}
                  className="relative h-48 overflow-hidden bg-gray-100 cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md p-1 rounded-lg border border-gray-200">
                    <span className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center ${item.foodType === 'veg' ? 'border-emerald-600' : 'border-red-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${item.foodType === 'veg' ? 'bg-emerald-600' : 'bg-red-600'}`} />
                    </span>
                  </div>

                  {item.tags?.[0] && (
                    <div className="absolute top-3 right-3 bg-[#0F382C] text-[#E6B800] text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md">
                      {item.tags[0]}
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div
                    onClick={() => {
                      setActiveItemModal(item);
                      setItemSpiceLevel('Medium');
                      setSelectedAddons([]);
                      setItemSpecialNotes('');
                    }}
                    className="space-y-1.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-serif text-base font-bold text-[#0F382C] group-hover:text-[#E6B800] transition-colors">
                        {item.name}
                      </h3>
                      <span className="text-[#0F382C] font-bold text-base">₹{item.price}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-normal leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                    <span className="text-[11px] text-gray-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-[#E6B800]" /> {item.prepTime}
                    </span>

                    {inCart ? (
                      <div className="flex items-center gap-2 bg-[#0F382C] text-white px-2.5 py-1 rounded-xl text-xs font-bold">
                        <button onClick={() => updateCartQuantity(inCart.cartItemId, -1)} className="hover:text-[#E6B800]">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span>{inCart.quantity}</span>
                        <button onClick={() => updateCartQuantity(inCart.cartItemId, 1)} className="hover:text-[#E6B800]">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="px-4 py-1.5 bg-[#0F382C] hover:bg-[#0F382C]/90 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#E6B800]" /> Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Food Modal */}
      {activeItemModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative border border-[#0F382C]/20 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="relative h-56 bg-gray-100">
              <img src={activeItemModal.image} alt={activeItemModal.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setActiveItemModal(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-2xl font-bold text-[#0F382C]">
                    {activeItemModal.name}
                  </h3>
                  <span className="text-xl font-bold text-[#0F382C]">₹{activeItemModal.price}</span>
                </div>
                <p className="text-gray-600 text-xs leading-relaxed font-medium">
                  {activeItemModal.description}
                </p>
              </div>

              <div className="p-3.5 bg-[#FAF8F5] rounded-2xl border border-[#0F382C]/10 space-y-2">
                <div>
                  <span className="font-bold text-[#0F382C] uppercase tracking-wider text-[10px] block mb-1">Ingredients</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeItemModal.ingredients?.map((ing) => (
                      <span key={ing} className="px-2.5 py-0.5 bg-white border border-gray-200 rounded-md text-[10px] text-gray-700">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
                {activeItemModal.allergens?.length > 0 && (
                  <p className="text-[10px] text-amber-800 font-semibold pt-1">
                    ⚠️ Allergens: {activeItemModal.allergens.join(', ')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-bold text-[#0F382C] block">Spice Preference</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Mild 🌶️', 'Medium 🌶️🌶️', 'Spicy 🌶️🌶️🌶️'].map((spice) => (
                    <button
                      key={spice}
                      type="button"
                      onClick={() => setItemSpiceLevel(spice.split(' ')[0])}
                      className={`py-2 rounded-xl font-semibold text-center border transition-all ${
                        itemSpiceLevel === spice.split(' ')[0]
                          ? 'bg-[#0F382C] text-white border-[#0F382C]'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {spice}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-[#0F382C] block">Customizations / Add-ons</label>
                <div className="space-y-2">
                  {[
                    { name: 'Extra Butter & Cheese', price: 50 },
                    { name: 'Mint Chutney Bowl', price: 20 },
                    { name: 'Lacha Onion & Lemon Salad', price: 30 },
                  ].map((addon) => {
                    const isChecked = selectedAddons.some((a) => a.name === addon.name);
                    return (
                      <div
                        key={addon.name}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedAddons(selectedAddons.filter((a) => a.name !== addon.name));
                          } else {
                            setSelectedAddons([...selectedAddons, addon]);
                          }
                        }}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked ? 'bg-emerald-50 border-emerald-500 font-bold' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <span>{addon.name}</span>
                        <span className="text-[#0F382C] font-bold">+₹{addon.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#0F382C] block mb-1">Kitchen Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Less oil, gluten-free, no onion"
                  value={itemSpecialNotes}
                  onChange={(e) => setItemSpecialNotes(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              <button
                type="button"
                onClick={() => handleAddToCart(activeItemModal, itemSpiceLevel, selectedAddons, itemSpecialNotes)}
                className="w-full py-3.5 bg-[#0F382C] text-white font-bold rounded-2xl text-xs shadow-lg hover:bg-[#0F382C]/90 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-[#E6B800]" />
                Add to Order (₹{activeItemModal.price + selectedAddons.reduce((s, a) => s + a.price, 0)})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="bg-[#0F382C] text-white p-5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#E6B800]" />
                <div>
                  <h3 className="font-serif text-base font-bold">Your Restaurant Order</h3>
                  <p className="text-[10px] text-emerald-200">{restaurantName}</p>
                </div>
              </div>
              <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-6 flex-1 text-xs">
              {cart.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                    <Utensils className="w-8 h-8" />
                  </div>
                  <p className="font-serif text-base font-bold text-[#0F382C]">Your cart is empty</p>
                  <p className="text-gray-500 max-w-xs mx-auto">Explore our luxury digital menu and add something delicious!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.cartItemId} className="p-3.5 bg-[#FAF8F5] border border-[#0F382C]/10 rounded-2xl space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-[#0F382C]">{item.name}</h4>
                          <p className="text-[10px] text-gray-500">
                            Spice: {item.spiceLevel} {item.addons.length > 0 && `· Addons: ${item.addons.map((a) => a.name).join(', ')}`}
                          </p>
                        </div>
                        <span className="font-bold text-[#0F382C]">₹{item.totalPrice * item.quantity}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-gray-400">₹{item.unitPrice} each</span>
                        <div className="flex items-center gap-2 bg-[#0F382C] text-white px-2 py-0.5 rounded-lg font-bold">
                          <button onClick={() => updateCartQuantity(item.cartItemId, -1)}>
                            <Minus className="w-3 h-3" />
                          </button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.cartItemId, 1)}>
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="p-4 bg-[#0F382C]/5 rounded-2xl border border-[#0F382C]/15 space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>₹{cartSubtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>GST (5%)</span>
                      <span>₹{taxAmount}</span>
                    </div>
                    {orderType === 'delivery' && (
                      <div className="flex justify-between text-gray-600">
                        <span>Delivery Charge</span>
                        <span>₹{deliveryFee}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-sm text-[#0F382C] border-t border-gray-200 pt-2">
                      <span>Total Amount</span>
                      <span>₹{grandTotal}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-[#0F382C] block">Select Order Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { type: 'dine_in', label: '🍽️ Dine-In' },
                        { type: 'takeaway', label: '🛍️ Takeaway' },
                        { type: 'delivery', label: '🛵 Delivery' },
                      ].map((ot) => (
                        <button
                          key={ot.type}
                          type="button"
                          onClick={() => setOrderType(ot.type)}
                          className={`py-2 rounded-xl font-bold text-center border transition-all ${
                            orderType === ot.type
                              ? 'bg-[#0F382C] text-white border-[#0F382C]'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          {ot.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {orderType === 'dine_in' && (
                    <div>
                      <label className="font-bold text-[#0F382C] block mb-1">Table Number</label>
                      <input
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="e.g. Table 4"
                        className="w-full p-2.5 rounded-xl border border-gray-300 font-bold"
                      />
                    </div>
                  )}

                  {orderType === 'delivery' && (
                    <div>
                      <label className="font-bold text-[#0F382C] block mb-1">Delivery Address</label>
                      <textarea
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Full delivery address with flat/house number..."
                        className="w-full p-2.5 rounded-xl border border-gray-300"
                        rows={2}
                      />
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <div>
                      <label className="font-bold text-[#0F382C] block mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Rahul Shah"
                        className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-[#0F382C] block mb-1">Phone Number (For Updates) *</label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+91 98200 12345"
                        className="w-full p-2.5 rounded-xl border border-gray-300 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="font-bold text-[#0F382C] block">Payment Option</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('PAY_ONLINE')}
                        className={`p-3 rounded-xl border font-bold text-left transition-all ${
                          paymentMethod === 'PAY_ONLINE'
                            ? 'bg-[#0F382C] text-white border-[#0F382C]'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        💳 Pay Online (Razorpay)
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('PAY_AT_COUNTER')}
                        className={`p-3 rounded-xl border font-bold text-left transition-all ${
                          paymentMethod === 'PAY_AT_COUNTER'
                            ? 'bg-[#0F382C] text-white border-[#0F382C]'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        💵 Pay at Counter
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-5 bg-white border-t border-gray-200 sticky bottom-0">
                <button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="w-full py-4 bg-[#E6B800] hover:bg-[#E6B800]/90 text-[#0F382C] font-black rounded-2xl text-xs shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? 'Placing Order...' : `PLACE RESTAURANT ORDER (₹${grandTotal}) →`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Bottom Cart Bar */}
      {totalCartCount > 0 && !cartOpen && (
        <div className="fixed bottom-6 left-4 right-4 z-40 max-w-md mx-auto">
          <button
            onClick={() => setCartOpen(true)}
            className="w-full py-3.5 bg-[#0F382C] text-white px-5 rounded-2xl shadow-2xl border border-[#E6B800]/30 flex items-center justify-between animate-bounce"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-[#E6B800] text-[#0F382C] font-black text-xs flex items-center justify-center">
                {totalCartCount}
              </span>
              <div className="text-left">
                <p className="font-bold text-xs">View Your Order</p>
                <p className="text-[10px] text-emerald-200">Subtotal: ₹{cartSubtotal}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#E6B800] flex items-center gap-1">
              Checkout <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      )}

      <footer className="mt-16 text-center text-xs text-gray-400">
        <PoweredByBizora />
      </footer>
    </div>
  );
}
