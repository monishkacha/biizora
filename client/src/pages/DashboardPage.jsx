import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  Clock,
  FileText,
  Sparkles,
  Plus,
  ArrowUpRight,
  ChevronRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/Button';
import { Badge, Card } from '../components/ui/Badge';

export default function DashboardPage() {
  const { metrics, invoices, customers, aiInsights, company } = useBusiness();
  const { user } = useAuth();
  const navigate = useNavigate();

  const monthlyTrendData = [
    { month: 'Mar', revenue: 280000 },
    { month: 'Apr', revenue: 320000 },
    { month: 'May', revenue: 390000 },
    { month: 'Jun', revenue: 410000 },
    { month: 'Jul', revenue: metrics.totalRevenue || 485000 },
    { month: 'Aug', revenue: Math.round((metrics.totalRevenue || 485000) * 1.12) },
  ];

  const invoicePieData = [
    { name: 'Paid', value: invoices.filter((i) => i.status === 'paid').length || 1, color: '#2F5D50' },
    { name: 'Pending', value: invoices.filter((i) => i.status === 'pending').length || 1, color: '#F6D97A' },
    { name: 'Overdue', value: invoices.filter((i) => i.status === 'overdue').length || 1, color: '#A7C4A0' },
  ];

  const kpis = [
    {
      label: 'Paid revenue',
      value: `₹${metrics.totalRevenue.toLocaleString('en-IN')}`,
      hint: 'Collected this period',
      icon: TrendingUp,
      tint: 'bg-green-sage/25 text-green-bottle',
    },
    {
      label: 'Receivables',
      value: `₹${metrics.pendingRevenue.toLocaleString('en-IN')}`,
      hint: `${metrics.pendingInvoicesCount} open invoices`,
      icon: Clock,
      tint: 'bg-yellow-champagne text-mustard',
    },
    {
      label: 'Net profit',
      value: `₹${metrics.netProfit.toLocaleString('en-IN')}`,
      hint: 'Revenue − expenses',
      icon: FileText,
      tint: 'bg-cream text-green-forest',
    },
    {
      label: 'Health score',
      value: `${metrics.healthScore}`,
      hint: 'Business operating score',
      icon: Sparkles,
      tint: 'bg-yellow-butter/40 text-green-bottle',
    },
  ];

  const recent = invoices.slice(0, 5);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5"
      >
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-green-forest">Overview</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-charcoal">
            Good to see you, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-sm text-warm-gray">
            {company?.name || 'Your business'}
            {company?.gstin ? ` · ${company.gstin}` : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate('/app/ai-suite')}>
            <Sparkles className="w-4 h-4" strokeWidth={1.75} /> Insights
          </Button>
          <Button variant="accent" onClick={() => navigate('/app/invoices/new')}>
            <Plus className="w-4 h-4" /> New invoice
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bz-kpi"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium text-warm-gray">{kpi.label}</p>
                <div className={`w-8 h-8 rounded-[10px] border border-stone flex items-center justify-center ${kpi.tint}`}>
                  <Icon className="w-4 h-4" strokeWidth={1.75} />
                </div>
              </div>
              <p className="mt-3 font-display text-2xl font-semibold tracking-tight text-charcoal">{kpi.value}</p>
              <p className="mt-1.5 text-[11px] text-warm-gray">{kpi.hint}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 p-5 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-semibold text-charcoal">Revenue trend</h2>
              <p className="text-xs text-warm-gray mt-0.5">Last six months</p>
            </div>
            <Badge tone="info">INR</Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2F5D50" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#F6D97A" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6E6E6E', fontSize: 11 }} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E6E2D9',
                    borderRadius: 12,
                    boxShadow: '0 10px 28px -14px rgba(47,93,80,0.16)',
                    fontSize: 12,
                  }}
                  formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2F5D50" strokeWidth={2.25} fill="url(#revFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-charcoal">Invoice mix</h2>
            <p className="text-xs text-warm-gray mt-0.5">Status distribution</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={invoicePieData} dataKey="value" innerRadius={48} outerRadius={72} paddingAngle={3}>
                  {invoicePieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#FFFFFF',
                    border: '1px solid #E6E2D9',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {invoicePieData.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-warm-gray">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-medium text-charcoal">{d.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="xl:col-span-2 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone flex items-center justify-between bg-ivory/50">
            <h2 className="text-sm font-semibold text-charcoal">Recent invoices</h2>
            <button
              type="button"
              onClick={() => navigate('/app/invoices')}
              className="text-xs text-warm-gray hover:text-green-bottle inline-flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="bz-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-warm-gray py-10">No invoices yet</td>
                  </tr>
                ) : (
                  recent.map((inv) => (
                    <tr key={inv.id}>
                      <td className="font-medium text-charcoal">{inv.invoiceNumber}</td>
                      <td>{inv.customerName}</td>
                      <td>
                        <Badge tone={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : 'warning'}>
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="text-right font-medium text-charcoal">
                        ₹{Number(inv.grandTotal).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-charcoal">Insights</h2>
            <p className="text-xs text-warm-gray mt-0.5">Suggested next actions</p>
          </div>
          <div className="space-y-3">
            {(aiInsights || []).slice(0, 3).map((insight) => (
              <div key={insight.id} className="p-3.5 rounded-[14px] bg-cream/80 border border-stone">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-charcoal leading-snug">{insight.title}</p>
                  <ArrowUpRight className="w-3.5 h-3.5 text-green-olive shrink-0" />
                </div>
                <p className="mt-1.5 text-[11px] text-warm-gray leading-relaxed line-clamp-2">{insight.message}</p>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-stone">
            <p className="text-xs text-warm-gray">{customers.length} customers · {metrics.totalProducts} products</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
