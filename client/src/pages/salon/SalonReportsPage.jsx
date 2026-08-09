import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Scissors,
  Users,
} from 'lucide-react';
import { Card } from '../../components/ui/Badge';

export default function SalonReportsPage() {
  const [activeReport, setActiveReport] = useState('revenue');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-green-forest">Analytics Hub</p>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-charcoal">
          Reports & Insights
        </h1>
        <p className="text-sm text-warm-gray">Monitor stylist commissions, peak hours, service distributions, and client metrics</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-ivory border border-stone p-1 rounded-xl text-xs font-semibold self-start">
        {[
          { id: 'revenue', label: 'Revenue Analysis', icon: DollarSign },
          { id: 'commission', label: 'Stylist Commissions', icon: Scissors },
          { id: 'retention', label: 'Client Retention', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`px-5 py-2.5 rounded-lg capitalize transition-colors flex items-center gap-1.5 ${
                activeReport === tab.id ? 'bg-green-bottle text-white shadow-subtle' : 'text-charcoal/80 hover:bg-cream'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content based on Active Report */}
      {activeReport === 'revenue' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 border border-stone bg-white space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">Daily Revenue Report</h3>
              <p className="text-[11px] text-warm-gray mt-0.5">Aug 2026</p>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { date: '10 Aug', total: '₹18,450', appointments: '24' },
                { date: '09 Aug', total: '₹14,200', appointments: '18' },
                { date: '08 Aug', total: '₹22,100', appointments: '28' },
                { date: '07 Aug', total: '₹12,850', appointments: '15' },
              ].map((row, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-stone/50 last:border-0">
                  <span className="font-semibold text-charcoal">{row.date} ({row.appointments} bookings)</span>
                  <span className="font-mono font-bold text-green-forest">{row.total}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 border border-stone bg-white space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">Service-wise Revenue</h3>
              <p className="text-[11px] text-warm-gray mt-0.5">Lifetime share</p>
            </div>
            <div className="space-y-3 text-xs">
              {[
                { service: 'Haircut', share: '₹145,000 (42%)', color: 'bg-green-bottle' },
                { service: 'Hair Color', share: '₹96,000 (28%)', color: 'bg-blue-500' },
                { service: 'Hair Spa', share: '₹62,000 (18%)', color: 'bg-yellow-butter' },
                { service: 'Nails & Beauty', share: '₹41,000 (12%)', color: 'bg-purple-500' },
              ].map((row, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-charcoal">{row.service}</span>
                    <span className="font-mono text-green-forest">{row.share}</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: row.share.match(/\d+%/)[0] }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeReport === 'commission' && (
        <Card className="p-5 border border-stone bg-white space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">Stylist Shift & Commission Ledger</h3>
            <p className="text-[11px] text-warm-gray mt-0.5">Today's payouts</p>
          </div>
          <div className="space-y-2 text-xs">
            {[
              { name: 'Riya Sharma', rate: '20%', bookings: 8, gross: '₹6,200', pay: '₹1,240' },
              { name: 'Anjali Shah', rate: '18%', bookings: 5, gross: '₹4,850', pay: '₹873' },
              { name: 'Kavya Rao', rate: '15%', bookings: 4, gross: '₹3,400', pay: '₹510' },
            ].map((row, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-stone/50 last:border-0 items-center">
                <div>
                  <span className="font-bold text-charcoal block">{row.name}</span>
                  <span className="text-[10px] text-warm-gray">{row.bookings} bookings · Rate: {row.rate}</span>
                </div>
                <div className="text-right">
                  <span className="text-charcoal block">Gross: {row.gross}</span>
                  <span className="font-mono font-bold text-green-forest">Payout: {row.pay}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeReport === 'retention' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 border border-stone bg-white space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">Retention & Conversion Rate</h3>
              <p className="text-[11px] text-warm-gray mt-0.5">Summary metrics</p>
            </div>
            <div className="space-y-4 text-xs font-semibold text-charcoal">
              <div className="flex justify-between">
                <span className="text-warm-gray font-medium">Customer Retention Rate</span>
                <span className="text-green-forest text-sm font-bold">84%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-gray font-medium">Online booking Conversion</span>
                <span className="text-green-forest text-sm font-bold">72%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-gray font-medium">Loyalty membership growth</span>
                <span className="text-green-forest text-sm font-bold">+15% MoM</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 border border-stone bg-white space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">Peak Floor Hours</h3>
              <p className="text-[11px] text-warm-gray mt-0.5">Booking density by hour</p>
            </div>
            <div className="space-y-2 text-xs font-semibold">
              {[
                { range: '09 AM - 11 AM', density: 'Moderate', color: 'bg-yellow-honey', percent: 45 },
                { range: '11 AM - 02 PM', density: 'High Density (Peak)', color: 'bg-terracotta', percent: 90 },
                { range: '02 PM - 05 PM', density: 'Moderate', color: 'bg-yellow-honey', percent: 55 },
                { range: '05 PM - 08 PM', density: 'High', color: 'bg-green-bottle', percent: 80 },
              ].map((row, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-charcoal">{row.range} ({row.density})</span>
                    <span className="text-warm-gray">{row.percent}% busy</span>
                  </div>
                  <div className="w-full h-2 bg-stone rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
