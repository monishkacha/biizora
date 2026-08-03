import React from 'react';
import { useBusiness } from '../context/BusinessContext';
import { TrendingUp, Users, Package, DollarSign, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export default function AnalyticsPage() {
  const { customers, products, invoices, metrics } = useBusiness();

  const customerSpendData = customers.map(c => ({
    name: c.name.split(' ')[0],
    spent: c.totalSpent,
    outstanding: c.outstandingBalance
  }));

  const paymentMethodData = [
    { name: 'UPI / QR', value: 45, color: '#2563EB' },
    { name: 'NEFT / Bank', value: 35, color: '#14B8A6' },
    { name: 'Razorpay Cards', value: 20, color: '#F59E0B' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" /> Advanced Financial Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Deep-dive analysis into client acquisition, revenue concentration, and payment channels.</p>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Customer Lifetime Spend Chart */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Customer Revenue Concentration</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerSpendData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Lifetime Spent']} />
                <Bar dataKey="spent" fill="#2563EB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Channel Breakdown */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Payment Method Distribution</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentMethodData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs font-semibold">
            {paymentMethodData.map((p, idx) => (
              <span key={idx} className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                <span>{p.name} ({p.value}%)</span>
              </span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
