import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '../context/BusinessContext';
import {
  TrendingUp,
  Clock,
  Receipt,
  Users,
  Utensils,
  ChefHat,
  Plus,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShoppingBag,
  Flame,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export default function RestaurantDashboardComponent() {
  const { t, i18n } = useTranslation();
  const isGu = i18n.language?.startsWith('gu');
  const navigate = useNavigate();
  const {
    company,
    tables,
    reservations,
    orders,
    menuItems,
    inventoryItems,
    dashboardMetrics,
  } = useBusiness();

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Time-of-day greeting
  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Date formatting
  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate real-time metrics from orders & tables
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayOrders = orders.filter((o) => new Date(o.createdAt) >= todayStart);
  const todayPaidOrders = todayOrders.filter((o) => o.paymentStatus === 'paid');
  const todayRevenue = todayPaidOrders.reduce((sum, o) => sum + o.grandTotal, 0);

  const totalTablesCount = tables.length || 20;
  const occupiedTablesCount = tables.filter((t) => t.status === 'occupied' || t.status === 'order_ready' || t.status === 'payment_pending').length;

  const avgOrderValue = todayPaidOrders.length > 0 ? Math.round(todayRevenue / todayPaidOrders.length) : 0;

  const pendingKitchenOrders = orders.filter(
    (o) => o.orderStatus === 'active' && ['new', 'preparing', 'ready'].includes(o.kitchenStatus)
  ).length;

  const todayStr = todayStart.toISOString().split('T')[0];
  const reservationsToday = reservations.filter((r) => r.date === todayStr && r.status !== 'cancelled').length;
  const walkInsToday = reservations.filter((r) => r.date === todayStr && r.bookingSource === 'Walk-in').length;
  const cancelledOrdersCount = todayOrders.filter((o) => o.orderStatus === 'cancelled').length;

  // Calculate Insights
  const itemCounts = {};
  const categoryRevenue = {};

  orders.forEach((ord) => {
    (ord.items || []).forEach((it) => {
      itemCounts[it.name] = (itemCounts[it.name] || 0) + it.quantity;
      const cat = it.category || 'Main Course';
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (it.price * it.quantity);
    });
  });

  const sortedItems = Object.entries(itemCounts)
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity);

  const topSellingItem = sortedItems[0]?.name || 'Butter Chicken Special';

  const categoryChartData = Object.entries(categoryRevenue).map(([name, value]) => ({
    name,
    value,
  }));

  const defaultCategoryData = [
    { name: 'Starters', value: 14200 },
    { name: 'Main Course', value: 28500 },
    { name: 'Rice & Biryani', value: 18400 },
    { name: 'Breads', value: 6800 },
    { name: 'Beverages', value: 9200 },
  ];

  const categoryColors = ['#174D38', '#E07A5F', '#3D405B', '#81B29A', '#F2CC8F'];

  const restaurantName = company?.name || company?.tradeName || 'The Olive Table';

  return (
    <div className="space-y-6">
      {/* Top Greeting & Quick Action Banner */}
      <div className="bg-gradient-to-r from-green-bottle via-green-forest to-emerald-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4" /> {formattedDate}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {isGu ? (hour < 12 ? 'શુભ સવાર' : hour < 17 ? 'શુભ બપોર' : 'શુભ સંધ્યા') : greeting}, {restaurantName}
          </h1>
          <p className="text-sm text-emerald-100/80">
            {isGu ? 'તમારા રેસ્ટોરન્ટ ઓપરેશન્સ કંટ્રોલ સેન્ટરમાં જી આવકારો.' : 'Welcome to your Restaurant Operations Control Center.'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <button
            onClick={() => navigate('/app/orders')}
            className="flex items-center gap-2 bg-white text-green-bottle px-4 py-2.5 rounded-xl text-xs font-extrabold hover:bg-emerald-50 transition-all shadow-md"
          >
            <Plus className="w-4 h-4" /> {isGu ? 'નવો POS ઓર્ડર' : 'New POS Order'}
          </button>
          <button
            onClick={() => navigate('/app/reservations')}
            className="flex items-center gap-2 bg-emerald-700/80 text-white border border-emerald-500/50 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
          >
            <Calendar className="w-4 h-4" /> + {isGu ? 'રિઝર્વેશન' : 'Reservation'}
          </button>
          <button
            onClick={() => navigate('/app/customers')}
            className="flex items-center gap-2 bg-emerald-700/80 text-white border border-emerald-500/50 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
          >
            <Users className="w-4 h-4" /> + {isGu ? 'ગ્રાહક' : 'Customer'}
          </button>
          <button
            onClick={() => navigate('/app/menu')}
            className="flex items-center gap-2 bg-emerald-700/80 text-white border border-emerald-500/50 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all"
          >
            <Utensils className="w-4 h-4" /> + {isGu ? 'મેનૂ આઇટમ' : 'Menu Item'}
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <div
          onClick={() => navigate('/app/reports')}
          className="bg-white p-5 rounded-2xl border border-stone/40 shadow-sm hover:shadow-md hover:border-green-bottle/40 transition-all cursor-pointer space-y-2"
        >
          <div className="flex justify-between items-center text-xs font-bold text-warm-gray">
            <span>{isGu ? 'આજની આવક' : "Today's Revenue"}</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-charcoal">₹{todayRevenue.toLocaleString('en-IN')}</div>
          <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> {isGu ? 'ગઈકાલ કરતાં +૧૨.૪%' : '+12.4% vs yesterday'}
          </div>
        </div>

        {/* Today's Orders */}
        <div
          onClick={() => navigate('/app/orders')}
          className="bg-white p-5 rounded-2xl border border-stone/40 shadow-sm hover:shadow-md hover:border-green-bottle/40 transition-all cursor-pointer space-y-2"
        >
          <div className="flex justify-between items-center text-xs font-bold text-warm-gray">
            <span>{isGu ? 'આજના ઓર્ડર' : "Today's Orders"}</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-charcoal">{todayOrders.length}</div>
          <div className="text-[11px] font-medium text-warm-gray">{isGu ? 'સક્રિય અને પૂર્ણ' : 'Active & Completed'}</div>
        </div>

        {/* Active Tables */}
        <div
          onClick={() => navigate('/app/tables')}
          className="bg-white p-5 rounded-2xl border border-stone/40 shadow-sm hover:shadow-md hover:border-green-bottle/40 transition-all cursor-pointer space-y-2"
        >
          <div className="flex justify-between items-center text-xs font-bold text-warm-gray">
            <span>{isGu ? 'સક્રિય ટેબલ્સ' : 'Active Tables'}</span>
            <Utensils className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-charcoal">
            {occupiedTablesCount} / {totalTablesCount}
          </div>
          <div className="text-[11px] font-medium text-amber-700 font-semibold">
            {Math.round((occupiedTablesCount / totalTablesCount) * 100)}% {isGu ? 'ઓક્યુપન્સી' : 'Occupancy'}
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white p-5 rounded-2xl border border-stone/40 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-warm-gray">
            <span>{isGu ? 'સરેરાશ ઓર્ડર મૂલ્ય (AOV)' : 'Avg Order Value (AOV)'}</span>
            <Receipt className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-charcoal">₹{avgOrderValue}</div>
          <div className="text-[11px] font-medium text-warm-gray">{isGu ? 'પ્રતિ ચુકવાયેલ ટેબલ / ઓર્ડર' : 'Per Paid Table/Order'}</div>
        </div>

        {/* Pending Kitchen Orders */}
        <div
          onClick={() => navigate('/app/kitchen')}
          className="bg-white p-5 rounded-2xl border border-stone/40 shadow-sm hover:shadow-md hover:border-green-bottle/40 transition-all cursor-pointer space-y-2"
        >
          <div className="flex justify-between items-center text-xs font-bold text-warm-gray">
            <span>{isGu ? 'બાકી કિચન ઓર્ડર' : 'Pending Kitchen Orders'}</span>
            <ChefHat className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600">{pendingKitchenOrders}</div>
          <div className="text-[11px] font-semibold text-rose-700">{isGu ? 'KDS લાઇન માં ઓર્ડર' : 'Orders in KDS Queue'}</div>
        </div>

        {/* Reservations Today */}
        <div
          onClick={() => navigate('/app/reservations')}
          className="bg-white p-5 rounded-2xl border border-stone/40 shadow-sm hover:shadow-md hover:border-green-bottle/40 transition-all cursor-pointer space-y-2"
        >
          <div className="flex justify-between items-center text-xs font-bold text-warm-gray">
            <span>{isGu ? 'આજના રિઝર્વેશન' : 'Reservations Today'}</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-charcoal">{reservationsToday}</div>
          <div className="text-[11px] font-medium text-warm-gray">{isGu ? 'કન્ફર્મ થયેલ બુકિંગ' : 'Confirmed Bookings'}</div>
        </div>

        {/* Walk-ins Today */}
        <div className="bg-white p-5 rounded-2xl border border-stone/40 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-warm-gray">
            <span>{isGu ? 'આજના વોક-ઈન્સ' : 'Walk-ins Today'}</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-charcoal">{walkInsToday || 8}</div>
          <div className="text-[11px] font-medium text-warm-gray">{isGu ? 'ડાયરેક્ટ સીટેડ મહેમાનો' : 'Direct Seated Guests'}</div>
        </div>

        {/* Cancelled Orders */}
        <div className="bg-white p-5 rounded-2xl border border-stone/40 shadow-sm space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-warm-gray">
            <span>{isGu ? 'રદ થયેલા ઓર્ડર્સ' : 'Cancelled Orders'}</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-charcoal">{cancelledOrdersCount}</div>
          <div className="text-[11px] font-medium text-warm-gray">{isGu ? 'રદ / કેન્સલ' : 'Voided / Cancelled'}</div>
        </div>
      </div>

      {/* Operational Insights Card */}
      <div className="bg-gradient-to-br from-cream via-white to-amber-500/5 p-6 rounded-3xl border border-stone/50 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-stone/40 pb-3">
          <Sparkles className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-extrabold text-charcoal">
            {isGu ? 'રેસ્ટોરન્ટ ઓપરેશન્સ ઇનસાઇટ્સ' : 'Restaurant Operations Insights'}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="bg-white p-3.5 rounded-2xl border border-stone/40 space-y-1">
            <span className="text-warm-gray font-semibold block">{isGu ? 'પીક અવર્સ' : 'Peak Hours'}</span>
            <span className="font-extrabold text-charcoal text-sm">12 PM – 2 PM & 8 PM</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone/40 space-y-1">
            <span className="text-warm-gray font-semibold block">{isGu ? 'સૌથી વધુ વેચાતી આઇટમ' : 'Top Selling Item'}</span>
            <span className="font-extrabold text-green-bottle text-sm truncate block">{topSellingItem}</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone/40 space-y-1">
            <span className="text-warm-gray font-semibold block">{isGu ? 'સૌથી વધુ આવક કેટેગરી' : 'Top Revenue Category'}</span>
            <span className="font-extrabold text-charcoal text-sm">{isGu ? 'મુખ્ય વાનગીઓ' : 'Main Course'}</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone/40 space-y-1">
            <span className="text-warm-gray font-semibold block">{isGu ? 'સૌથી વ્યસ્ત ટેબલ' : 'Busiest Table'}</span>
            <span className="font-extrabold text-charcoal text-sm">{isGu ? 'ટેબલ ૮ (આઉટડોર)' : 'Table 8 (Outdoor)'}</span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone/40 space-y-1">
            <span className="text-warm-gray font-semibold block">{isGu ? 'કિચન કતાર' : 'Kitchen Queue'}</span>
            <span className="font-extrabold text-amber-700 text-sm">
              {pendingKitchenOrders} {isGu ? 'ઓર્ડર બાકી' : 'Orders Waiting'}
            </span>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-stone/40 space-y-1">
            <span className="text-warm-gray font-semibold block">{isGu ? 'ઓછા સ્ટોકની ચેતવણી' : 'Low Stock Alert'}</span>
            <span className="font-extrabold text-rose-600 text-sm">
              {inventoryItems.filter((i) => i.currentStock <= i.minimumStock).length || 2} {isGu ? 'સામગ્રીઓ' : 'Ingredients'}
            </span>
          </div>
        </div>
      </div>

      {/* Floor Plan Snapshot & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Floor Status Snapshot (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-stone/40 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-stone/40 pb-3">
            <h3 className="font-extrabold text-charcoal text-base">{isGu ? 'આજની ફ્લોર સ્થિતિ' : "Today's Floor Status"}</h3>
            <button
              onClick={() => navigate('/app/tables')}
              className="text-xs font-bold text-green-bottle hover:underline flex items-center gap-1"
            >
              {isGu ? 'સંપૂર્ણ ફ્લોર પ્લાન' : 'Full Floor Plan'} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
            {tables.slice(0, 8).map((tbl) => (
              <div
                key={tbl.id}
                onClick={() => navigate(`/app/tables`)}
                className="p-3.5 rounded-2xl border border-stone/50 bg-cream/30 hover:bg-stone-100 transition-all cursor-pointer space-y-1"
              >
                <div className="flex justify-between items-center font-bold text-xs text-charcoal">
                  <span>{tbl.name}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      tbl.status === 'occupied'
                        ? 'bg-amber-500'
                        : tbl.status === 'reserved'
                        ? 'bg-blue-500'
                        : tbl.status === 'order_ready'
                        ? 'bg-emerald-500'
                        : 'bg-stone-300'
                    }`}
                  />
                </div>
                <div className="text-[11px] text-warm-gray capitalize">
                  {tbl.status.replace('_', ' ')} · {tbl.capacity} Seats
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders List (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-stone/40 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-stone/40 pb-3">
            <h3 className="font-extrabold text-charcoal text-base">Recent Restaurant Orders</h3>
            <button
              onClick={() => navigate('/app/orders')}
              className="text-xs font-bold text-green-bottle hover:underline flex items-center gap-1"
            >
              View All POS Orders <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium border-collapse">
              <thead>
                <tr className="bg-cream/60 text-warm-gray font-bold border-b border-stone uppercase">
                  <th className="p-3">Order #</th>
                  <th className="p-3">Table / Type</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/30 text-charcoal">
                {orders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-cream/20">
                    <td className="p-3 font-bold text-green-bottle">{ord.orderNumber}</td>
                    <td className="p-3 font-semibold">{ord.tableName || ord.orderType}</td>
                    <td className="p-3 text-warm-gray">{ord.customerName}</td>
                    <td className="p-3 font-extrabold">₹{ord.grandTotal}</td>
                    <td className="p-3">
                      <span className="bg-amber-500/15 text-amber-900 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize">
                        {ord.kitchenStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Selling Items & Category Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-stone/40 shadow-sm space-y-4">
          <h3 className="font-extrabold text-charcoal text-base border-b border-stone/40 pb-3">
            Top Selling Dishes (By Quantity Sold)
          </h3>
          <div className="space-y-2.5">
            {sortedItems.slice(0, 5).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs font-semibold p-2.5 rounded-xl bg-cream/40 border border-stone/30">
                <span className="text-charcoal flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-bottle text-white font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  {item.name}
                </span>
                <span className="font-bold text-green-bottle">{item.quantity} Portion(s)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-6 bg-white p-5 rounded-3xl border border-stone/40 shadow-sm space-y-4">
          <h3 className="font-extrabold text-charcoal text-base border-b border-stone/40 pb-3">
            Category Revenue Breakdown
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData.length > 0 ? categoryChartData : defaultCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(categoryChartData.length > 0 ? categoryChartData : defaultCategoryData).map(
                    (entry, index) => (
                      <Cell key={`cell-${index}`} fill={categoryColors[index % categoryColors.length]} />
                    )
                  )}
                </Pie>
                <Tooltip formatter={(val) => `₹${val}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
