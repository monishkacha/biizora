import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import {
  BarChart3,
  IndianRupee,
  Package,
  Printer,
  GraduationCap,
  Boxes,
  TrendingUp,
  Download,
} from 'lucide-react';

export default function StationeryReportsPage() {
  const { invoices, products, stationerySchoolOrders } = useBusiness();
  const [activeReportTab, setActiveReportTab] = useState('daily'); // 'daily' | 'products' | 'stock' | 'xerox' | 'school'

  // Daily Sales Calculations
  const paidInvoices = (invoices || []).filter((i) => i.status === 'paid');
  const cashSales = paidInvoices
    .filter((i) => String(i.paymentMethod).toLowerCase().includes('cash'))
    .reduce((sum, i) => sum + (i.grandTotal || 0), 0);
  const upiSales = paidInvoices
    .filter((i) => String(i.paymentMethod).toLowerCase().includes('upi'))
    .reduce((sum, i) => sum + (i.grandTotal || 0), 0);
  const cardSales = paidInvoices
    .filter((i) => String(i.paymentMethod).toLowerCase().includes('card'))
    .reduce((sum, i) => sum + (i.grandTotal || 0), 0);
  const totalDailySales = cashSales + upiSales + cardSales;

  // Product Sales Calculations
  const salesMap = {};
  for (const inv of paidInvoices) {
    for (const item of inv.items || []) {
      if (item.itemType === 'service') continue;
      const key = item.description || 'Stationery Item';
      salesMap[key] = (salesMap[key] || 0) + (item.quantity || 1);
    }
  }

  const topSelling = Object.entries(salesMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const slowMoving = (products || [])
    .filter((p) => (p.stock || 0) > (p.minStockLevel || 10) * 2)
    .slice(0, 8);

  // Stock Analytics
  const lowStockProds = (products || []).filter((p) => (p.stock || 0) <= (p.minStockLevel || 10) && (p.stock || 0) > 0);
  const outOfStockProds = (products || []).filter((p) => (p.stock || 0) <= 0);

  // Xerox Analytics
  let bwCopies = 0;
  let colorCopies = 0;
  let laminationCount = 0;
  let xeroxRevenueTotal = 0;

  for (const inv of paidInvoices) {
    for (const item of inv.items || []) {
      if (item.itemType !== 'service') continue;
      xeroxRevenueTotal += item.amount || item.quantity * item.rate || 0;
      const st = String(item.serviceType || item.description || '').toLowerCase();
      const pages = Number(item.quantity) || 0;
      if (st.includes('color')) colorCopies += pages;
      else if (st.includes('b&w') || st.includes('black') || st.includes('xerox')) bwCopies += pages;
      if (st.includes('lamination')) laminationCount += pages;
    }
  }

  // School Orders Analytics
  const pendingSchool = (stationerySchoolOrders || []).filter((o) => ['Quotation', 'Confirmed', 'Packed'].includes(o.status));
  const deliveredSchool = (stationerySchoolOrders || []).filter((o) => o.status === 'Delivered');
  const unpaidSchool = (stationerySchoolOrders || []).filter((o) => o.status !== 'Paid');

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[20px] border border-stone shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-bottle text-white flex items-center justify-center font-bold">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal">Stationery Business Reports</h1>
            <p className="text-xs text-warm-gray">Daily sales breakdown, top selling notebooks & pens, stock, & Xerox reports</p>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="bg-white p-2 rounded-[18px] border border-stone shadow-subtle flex flex-wrap gap-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveReportTab('daily')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeReportTab === 'daily' ? 'bg-green-bottle text-white shadow-xs' : 'bg-cream text-warm-gray hover:text-charcoal'
          }`}
        >
          <IndianRupee className="w-4 h-4" /> Daily Sales Breakdown
        </button>
        <button
          type="button"
          onClick={() => setActiveReportTab('products')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeReportTab === 'products' ? 'bg-green-bottle text-white shadow-xs' : 'bg-cream text-warm-gray hover:text-charcoal'
          }`}
        >
          <Package className="w-4 h-4" /> Product Performance
        </button>
        <button
          type="button"
          onClick={() => setActiveReportTab('stock')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeReportTab === 'stock' ? 'bg-green-bottle text-white shadow-xs' : 'bg-cream text-warm-gray hover:text-charcoal'
          }`}
        >
          <Boxes className="w-4 h-4" /> Stock & Inventory Report
        </button>
        <button
          type="button"
          onClick={() => setActiveReportTab('xerox')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeReportTab === 'xerox' ? 'bg-green-bottle text-white shadow-xs' : 'bg-cream text-warm-gray hover:text-charcoal'
          }`}
        >
          <Printer className="w-4 h-4" /> Xerox & Print Report
        </button>
        <button
          type="button"
          onClick={() => setActiveReportTab('school')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
            activeReportTab === 'school' ? 'bg-green-bottle text-white shadow-xs' : 'bg-cream text-warm-gray hover:text-charcoal'
          }`}
        >
          <GraduationCap className="w-4 h-4" /> School Orders Report
        </button>
      </div>

      {/* REPORT 1: Daily Sales */}
      {activeReportTab === 'daily' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-[18px] border border-stone shadow-subtle">
              <span className="text-xs font-semibold text-warm-gray uppercase">Cash Sales</span>
              <h3 className="text-2xl font-bold font-display text-charcoal mt-2">₹{cashSales.toLocaleString('en-IN')}</h3>
            </div>
            <div className="bg-white p-5 rounded-[18px] border border-stone shadow-subtle">
              <span className="text-xs font-semibold text-warm-gray uppercase">UPI / Online Sales</span>
              <h3 className="text-2xl font-bold font-display text-emerald-700 mt-2">₹{upiSales.toLocaleString('en-IN')}</h3>
            </div>
            <div className="bg-white p-5 rounded-[18px] border border-stone shadow-subtle">
              <span className="text-xs font-semibold text-warm-gray uppercase">Card Sales</span>
              <h3 className="text-2xl font-bold font-display text-blue-700 mt-2">₹{cardSales.toLocaleString('en-IN')}</h3>
            </div>
            <div className="bg-gradient-to-r from-green-bottle to-green-forest text-white p-5 rounded-[18px] shadow-card">
              <span className="text-xs font-semibold uppercase text-yellow-butter">Total Daily Revenue</span>
              <h3 className="text-2xl font-bold font-display mt-2">₹{totalDailySales.toLocaleString('en-IN')}</h3>
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: Product Performance */}
      {activeReportTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-stone rounded-[20px] shadow-subtle p-5 space-y-3">
            <h2 className="text-sm font-bold text-charcoal flex items-center gap-2 border-b border-stone pb-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" /> Top-Selling Notebooks & Pens
            </h2>
            <div className="space-y-2">
              {topSelling.length === 0 ? (
                <p className="text-xs text-warm-gray py-4 text-center">No product sales data logged.</p>
              ) : (
                topSelling.map(([name, qty], idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 bg-cream/30 rounded-xl text-xs">
                    <span className="font-semibold text-charcoal">{idx + 1}. {name}</span>
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      {qty} units sold
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white border border-stone rounded-[20px] shadow-subtle p-5 space-y-3">
            <h2 className="text-sm font-bold text-charcoal flex items-center gap-2 border-b border-stone pb-2">
              <Boxes className="w-4 h-4 text-amber-700" /> Slow-Moving Items (Excess Stock)
            </h2>
            <div className="space-y-2">
              {slowMoving.length === 0 ? (
                <p className="text-xs text-warm-gray py-4 text-center">No slow-moving inventory detected.</p>
              ) : (
                slowMoving.map((p) => (
                  <div key={p.id || p._id} className="flex justify-between items-center p-2.5 bg-amber-50/40 rounded-xl text-xs border border-amber-200/60">
                    <div>
                      <p className="font-semibold text-charcoal">{p.name}</p>
                      <p className="text-[10px] text-warm-gray">Cat: {p.category}</p>
                    </div>
                    <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      Stock: {p.stock} {p.unit || 'pc'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* REPORT 3: Stock & Inventory */}
      {activeReportTab === 'stock' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-stone rounded-[20px] shadow-subtle p-5 space-y-3">
            <h2 className="text-sm font-bold text-charcoal border-b border-stone pb-2">Low Stock Products ({lowStockProds.length})</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {lowStockProds.map((p) => (
                <div key={p.id || p._id} className="flex justify-between items-center p-2 bg-amber-50 rounded-xl text-xs">
                  <span>{p.name} ({p.category})</span>
                  <span className="font-bold text-amber-800">Stock: {p.stock}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-stone rounded-[20px] shadow-subtle p-5 space-y-3">
            <h2 className="text-sm font-bold text-charcoal border-b border-stone pb-2">Out of Stock Products ({outOfStockProds.length})</h2>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {outOfStockProds.map((p) => (
                <div key={p.id || p._id} className="flex justify-between items-center p-2 bg-red-50 text-red-800 rounded-xl text-xs font-semibold">
                  <span>{p.name}</span>
                  <span>OUT OF STOCK</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* REPORT 4: Xerox & Print */}
      {activeReportTab === 'xerox' && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-[18px] border border-stone shadow-subtle text-center">
            <span className="text-xs font-semibold text-warm-gray uppercase">B/W Xerox Copies</span>
            <h3 className="text-2xl font-bold text-charcoal mt-2">{bwCopies} pages</h3>
          </div>
          <div className="bg-white p-5 rounded-[18px] border border-stone shadow-subtle text-center">
            <span className="text-xs font-semibold text-warm-gray uppercase">Color Printouts</span>
            <h3 className="text-2xl font-bold text-teal-700 mt-2">{colorCopies} pages</h3>
          </div>
          <div className="bg-white p-5 rounded-[18px] border border-stone shadow-subtle text-center">
            <span className="text-xs font-semibold text-warm-gray uppercase">Lamination Jobs</span>
            <h3 className="text-2xl font-bold text-blue-700 mt-2">{laminationCount} sheets</h3>
          </div>
          <div className="bg-teal-700 text-white p-5 rounded-[18px] shadow-card text-center">
            <span className="text-xs font-semibold uppercase text-teal-100">Total Xerox Revenue</span>
            <h3 className="text-2xl font-bold mt-2">₹{xeroxRevenueTotal.toLocaleString('en-IN')}</h3>
          </div>
        </div>
      )}

      {/* REPORT 5: School Orders */}
      {activeReportTab === 'school' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-[18px] border border-stone shadow-subtle">
            <span className="text-xs font-semibold text-warm-gray uppercase">Pending School Orders</span>
            <h3 className="text-2xl font-bold text-green-bottle mt-2">{pendingSchool.length} orders</h3>
          </div>
          <div className="bg-white p-5 rounded-[18px] border border-stone shadow-subtle">
            <span className="text-xs font-semibold text-warm-gray uppercase">Delivered Orders</span>
            <h3 className="text-2xl font-bold text-emerald-700 mt-2">{deliveredSchool.length} orders</h3>
          </div>
          <div className="bg-white p-5 rounded-[18px] border border-stone shadow-subtle">
            <span className="text-xs font-semibold text-warm-gray uppercase">Unpaid School Credit</span>
            <h3 className="text-2xl font-bold text-terracotta mt-2">{unpaidSchool.length} orders</h3>
          </div>
        </div>
      )}
    </div>
  );
}
