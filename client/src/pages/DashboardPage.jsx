import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Package,
  FileText,
  Clock,
  Sparkles,
  ArrowUpRight,
  Plus,
  AlertTriangle,
  CheckCircle,
  CreditCard,
  Building2,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { metrics, invoices, customers, expenses, aiInsights, updateInvoiceStatus, company } = useBusiness();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Recharts Chart Mock Data
  const monthlyTrendData = [
    { month: 'Mar', revenue: 280000, expense: 140000, profit: 140000 },
    { month: 'Apr', revenue: 320000, expense: 165000, profit: 155000 },
    { month: 'May', revenue: 390000, expense: 180000, profit: 210000 },
    { month: 'Jun', revenue: 410000, expense: 210000, profit: 200000 },
    { month: 'Jul', revenue: metrics.totalRevenue || 485000, expense: metrics.totalExpenses || 278800, profit: metrics.netProfit || 206200 },
    { month: 'Aug (Pred)', revenue: Math.round(metrics.totalRevenue * 1.15), expense: 290000, profit: Math.round(metrics.totalRevenue * 1.15) - 290000 }
  ];

  const invoicePieData = [
    { name: 'Paid Invoices', value: invoices.filter(i => i.status === 'paid').length || 2, color: '#22C55E' },
    { name: 'Pending Invoices', value: invoices.filter(i => i.status === 'pending').length || 1, color: '#F59E0B' },
    { name: 'Overdue Invoices', value: invoices.filter(i => i.status === 'overdue').length || 1, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Executive Welcome Banner */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/20 text-blue-300 text-[11px] font-bold rounded-md">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" /> AI Executive Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs text-slate-300">
            {company.name} • GSTIN: <span className="font-mono text-teal-300">{company.gstin}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => navigate('/app/invoices/new')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/30 transition-all"
          >
            <Plus className="w-4 h-4" /> Create GST Invoice
          </button>
          <button
            onClick={() => navigate('/app/ai-suite')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-xs font-bold shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" /> AI Cash Flow Forecast
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Revenue */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Paid Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            ₹{metrics.totalRevenue.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[11px] mt-2 text-emerald-600 font-medium">
            <span>↑ +18.4% vs last month</span>
            <span className="text-slate-400">Yearly: ₹32.4L</span>
          </div>
        </div>

        {/* Pending & Overdue Invoices */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Receivables</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            ₹{metrics.pendingRevenue.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[11px] mt-2 text-slate-500">
            <span className="text-amber-600 font-semibold">{metrics.pendingInvoicesCount} invoices pending</span>
            <button onClick={() => navigate('/app/invoices')} className="text-blue-600 hover:underline">View All</button>
          </div>
        </div>

        {/* Net Profit & Expenses */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Net Profit</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            ₹{metrics.netProfit.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[11px] mt-2 text-slate-500">
            <span>Expenses: ₹{metrics.totalExpenses.toLocaleString('en-IN')}</span>
            <span className="text-emerald-500 font-bold">Margin: {((metrics.netProfit / (metrics.totalRevenue || 1)) * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Financial Health & Cash Balance */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Predicted Cash Balance</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-2">
            ₹{metrics.cashBalance.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center justify-between text-[11px] mt-2 text-slate-500">
            <span>Health Score: <strong className="text-blue-600">{metrics.healthScore}/100</strong></span>
            <span className="text-teal-600 font-semibold">90-Day Outlook: Strong</span>
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue & Profit Growth Trend (2 cols) */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue & Net Profit Trajectory</h3>
              <p className="text-xs text-slate-400">Includes 30-day AI predictive forecasting for August 2026</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-600 inline-block" /> Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-teal-400 inline-block" /> Profit</span>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, '']} />
                <Area type="monotone" dataKey="revenue" stroke="#1D4ED8" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Invoice Status Distribution (1 col) */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Invoice Portfolio Status</h3>
            <p className="text-xs text-slate-400">Distribution across Paid, Pending, and Overdue</p>
          </div>

          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={invoicePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {invoicePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            {invoicePieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{item.name}</span>
                </span>
                <span className="font-bold text-slate-900 dark:text-white">{item.value} Invoices</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lower Section: AI Recommendations & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Invoices Table (2 cols) */}
        <div className="lg:col-span-2 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent GST Invoices</h3>
            <button onClick={() => navigate('/app/invoices')} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              View All Invoices
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3 px-2">Invoice #</th>
                  <th className="py-3 px-2">Customer</th>
                  <th className="py-3 px-2">Amount</th>
                  <th className="py-3 px-2">Due Date</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
                {invoices.slice(0, 4).map((inv) => {
                  const isPaid = inv.status === 'paid';
                  const isOverdue = inv.status === 'overdue';

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3.5 px-2 font-mono font-bold text-blue-600 dark:text-blue-400">{inv.invoiceNumber}</td>
                      <td className="py-3.5 px-2 font-medium">{inv.customerName}</td>
                      <td className="py-3.5 px-2 font-bold text-slate-900 dark:text-white">₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 px-2 text-slate-400">{inv.dueDate}</td>
                      <td className="py-3.5 px-2">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          isPaid ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400' :
                          isOverdue ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400' :
                          'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-2 text-right">
                        {!isPaid ? (
                          <button
                            onClick={() => updateInvoiceStatus(inv.id, 'paid')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition-colors"
                          >
                            Mark Paid
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Action Ticker (1 col) */}
        <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 shadow-card flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> AI Advisor Highlights
            </div>
            <h4 className="text-lg font-bold">Actionable Cash Flow Insights</h4>
          </div>

          <div className="space-y-3">
            {aiInsights.map((insight) => (
              <div key={insight.id} className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-teal-300">{insight.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-teal-500/20 text-teal-300 rounded">{insight.confidence} Confidence</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{insight.message}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/app/ai-suite')}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <span>Open Full AI Financial Suite</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
}
