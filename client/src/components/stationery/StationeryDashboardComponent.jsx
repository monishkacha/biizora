import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';
import {
  IndianRupee,
  Receipt,
  AlertTriangle,
  GraduationCap,
  Printer,
  Plus,
  ArrowRight,
  ChevronRight,
  Package,
  Users,
  FileText,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function StationeryDashboardComponent() {
  const {
    invoices,
    products,
    stationeryMetrics,
    stationerySchoolOrders,
    company,
  } = useBusiness();
  const navigate = useNavigate();

  // Metrics computation from real context data
  const paidToday = (invoices || []).filter((i) => {
    if (i.status !== 'paid') return false;
    const dateStr = String(i.issueDate || i.createdAt || '');
    return dateStr.slice(0, 10) === new Date().toISOString().slice(0, 10);
  });

  const todaySales = stationeryMetrics?.todaySales ?? paidToday.reduce((sum, i) => sum + (i.grandTotal || 0), 0);
  const billsToday = stationeryMetrics?.billsToday ?? paidToday.length;

  const lowStockItems = (products || []).filter(
    (p) => (p.stock || 0) <= (p.minStockLevel || p.reorderLevel || 10)
  );

  const pendingSchoolOrders = (stationerySchoolOrders || []).filter(
    (o) => !['Delivered', 'Paid'].includes(o.status)
  );

  const xeroxRevenue = stationeryMetrics?.xeroxRevenueToday ?? invoices
    .flatMap((i) => i.items || [])
    .filter((item) => item.itemType === 'service')
    .reduce((sum, item) => sum + (item.amount || item.quantity * item.rate || 0), 0);

  const recentBills = (invoices || []).slice(0, 6);

  const kpiCards = [
    {
      title: "Today's Sales",
      value: `₹${Number(todaySales).toLocaleString('en-IN')}`,
      hint: `${billsToday} bills generated today`,
      icon: IndianRupee,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      action: () => navigate('/app/stationery/bills'),
    },
    {
      title: 'Bills Today',
      value: billsToday,
      hint: 'Completed POS transactions',
      icon: Receipt,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      action: () => navigate('/app/stationery/bills'),
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.length,
      hint: lowStockItems.length > 0 ? 'Requires stock reorder' : 'Stock healthy',
      icon: AlertTriangle,
      color: lowStockItems.length > 0 ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200',
      action: () => navigate('/app/stationery/inventory'),
    },
    {
      title: 'Pending School Orders',
      value: pendingSchoolOrders.length,
      hint: 'Quotations & packed kits',
      icon: GraduationCap,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      action: () => navigate('/app/stationery/school-orders'),
    },
    {
      title: 'Xerox & Print Revenue',
      value: `₹${Number(xeroxRevenue).toLocaleString('en-IN')}`,
      hint: 'Copies, printouts & lamination',
      icon: Printer,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      action: () => navigate('/app/stationery/print-xerox'),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-green-bottle/90 to-green-bottle text-white p-6 rounded-[22px] shadow-card">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-yellow-butter uppercase tracking-wider mb-1">
            <span>Stationery & School Supplies POS</span>
            <span>•</span>
            <span>{company?.name || 'PageCraft Stationery'}</span>
          </div>
          <h1 className="text-2xl font-bold font-display">Stationery Billing Workspace</h1>
          <p className="text-sm text-white/80 mt-1">
            Fast billing counter, barcode product search, school bulk orders, and Xerox service billing.
          </p>
        </div>

        {/* Quick Actions Header */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/app/stationery/billing')}
            className="px-4 py-2.5 bg-yellow-butter hover:bg-yellow-honey text-charcoal font-semibold rounded-[14px] text-sm flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> New Bill
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/stationery/products')}
            className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-medium rounded-[14px] text-sm flex items-center gap-1.5 backdrop-blur-sm transition-all"
          >
            <Package className="w-4 h-4" /> Product
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/stationery/school-orders')}
            className="px-3.5 py-2.5 bg-white/15 hover:bg-white/25 text-white font-medium rounded-[14px] text-sm flex items-center gap-1.5 backdrop-blur-sm transition-all"
          >
            <GraduationCap className="w-4 h-4" /> School Order
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={card.action}
              className="bg-white border border-stone rounded-[18px] p-4 hover:border-green-bottle/40 shadow-subtle hover:shadow-card transition-all cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <p className="text-xs font-semibold text-warm-gray leading-tight">{card.title}</p>
                <div className={`p-2 rounded-xl border ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold font-display text-charcoal tracking-tight">{card.value}</h3>
                <p className="text-[11px] text-warm-gray mt-1">{card.hint}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="bg-cream/60 border border-stone p-4 rounded-[18px] flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-charcoal">Quick Actions:</span>
        <div className="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => navigate('/app/stationery/billing')}
            className="px-3.5 py-2 rounded-xl bg-white border border-stone text-charcoal font-semibold hover:bg-green-bottle hover:text-white transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> + New Bill
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/stationery/products')}
            className="px-3.5 py-2 rounded-xl bg-white border border-stone text-charcoal font-medium hover:bg-cream transition-all flex items-center gap-1.5"
          >
            <Package className="w-3.5 h-3.5" /> + Add Product
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/stationery/customers')}
            className="px-3.5 py-2 rounded-xl bg-white border border-stone text-charcoal font-medium hover:bg-cream transition-all flex items-center gap-1.5"
          >
            <Users className="w-3.5 h-3.5" /> + Add Customer
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/stationery/school-orders')}
            className="px-3.5 py-2 rounded-xl bg-white border border-stone text-charcoal font-medium hover:bg-cream transition-all flex items-center gap-1.5"
          >
            <GraduationCap className="w-3.5 h-3.5" /> + School Order
          </button>
          <button
            type="button"
            onClick={() => navigate('/app/stationery/print-xerox')}
            className="px-3.5 py-2 rounded-xl bg-white border border-stone text-charcoal font-medium hover:bg-cream transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> + Xerox Job
          </button>
        </div>
      </div>

      {/* Main Grid: Recent Bills & Low Stock / Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bills */}
        <div className="lg:col-span-2 bg-white border border-stone rounded-[20px] shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-stone flex items-center justify-between bg-cream/30">
            <div>
              <h2 className="text-sm font-semibold text-charcoal flex items-center gap-2">
                <Receipt className="w-4 h-4 text-green-bottle" /> Recent Counter Bills
              </h2>
              <p className="text-xs text-warm-gray">Latest transactions generated at POS counter</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/app/stationery/bills')}
              className="text-xs font-semibold text-green-bottle hover:text-green-forest flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="bz-table">
              <thead>
                <tr>
                  <th>Bill No</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Items</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-warm-gray py-8">
                      No bills recorded today. Click <strong>+ New Bill</strong> to generate invoice.
                    </td>
                  </tr>
                ) : (
                  recentBills.map((inv) => (
                    <tr key={inv.id || inv._id} className="hover:bg-cream/40 cursor-pointer" onClick={() => navigate('/app/stationery/bills')}>
                      <td className="font-semibold text-charcoal">{inv.invoiceNumber}</td>
                      <td className="text-charcoal font-medium">{inv.customerName || 'Walk-in'}</td>
                      <td>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-cream text-warm-gray border border-stone">
                          {inv.invoiceType || 'Retail'}
                        </span>
                      </td>
                      <td className="text-xs text-warm-gray">{(inv.items || []).length} items</td>
                      <td className="text-right font-bold text-charcoal">₹{Number(inv.grandTotal || 0).toLocaleString('en-IN')}</td>
                      <td className="text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {inv.status || 'Paid'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts & Xerox Overview Sidebar */}
        <div className="space-y-6">
          {/* Low Stock Widget */}
          <div className="bg-white border border-stone rounded-[20px] p-4 shadow-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-stone pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" /> Low Stock Alerts ({lowStockItems.length})
              </h2>
              <button
                type="button"
                onClick={() => navigate('/app/stationery/inventory')}
                className="text-xs text-green-bottle hover:underline font-medium"
              >
                Manage
              </button>
            </div>

            {lowStockItems.length === 0 ? (
              <p className="text-xs text-warm-gray py-4 text-center">All products are adequately stocked.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {lowStockItems.slice(0, 5).map((prod) => (
                  <div
                    key={prod.id || prod._id}
                    className="flex items-center justify-between p-2.5 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-charcoal">{prod.name}</p>
                      <p className="text-[10px] text-warm-gray">Cat: {prod.category} • SKU: {prod.sku}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-md text-[11px]">
                        {prod.stock} {prod.unit || 'pc'}
                      </span>
                      <p className="text-[9px] text-warm-gray mt-0.5">Min: {prod.minStockLevel || prod.reorderLevel || 10}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Print & Xerox Quick Services Card */}
          <div className="bg-white border border-stone rounded-[20px] p-4 shadow-subtle space-y-3">
            <div className="flex items-center justify-between border-b border-stone pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-teal-600" /> Xerox & Print Counter
              </h2>
              <button
                type="button"
                onClick={() => navigate('/app/stationery/print-xerox')}
                className="text-xs text-green-bottle hover:underline font-medium"
              >
                Open
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-cream/40 rounded-xl border border-stone text-center">
                <p className="text-[10px] text-warm-gray font-medium uppercase">B/W Xerox</p>
                <p className="text-base font-bold text-charcoal mt-1">₹2 <span className="text-[10px] font-normal text-warm-gray">/ page</span></p>
              </div>
              <div className="p-3 bg-cream/40 rounded-xl border border-stone text-center">
                <p className="text-[10px] text-warm-gray font-medium uppercase">Color Print</p>
                <p className="text-base font-bold text-charcoal mt-1">₹10 <span className="text-[10px] font-normal text-warm-gray">/ page</span></p>
              </div>
              <div className="p-3 bg-cream/40 rounded-xl border border-stone text-center">
                <p className="text-[10px] text-warm-gray font-medium uppercase">Lamination</p>
                <p className="text-base font-bold text-charcoal mt-1">₹30 <span className="text-[10px] font-normal text-warm-gray">/ A4</span></p>
              </div>
              <div className="p-3 bg-cream/40 rounded-xl border border-stone text-center">
                <p className="text-[10px] text-warm-gray font-medium uppercase">Binding</p>
                <p className="text-base font-bold text-charcoal mt-1">₹40 <span className="text-[10px] font-normal text-warm-gray">/ book</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
