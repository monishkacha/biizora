import React, { useState } from 'react';
import {
  Award,
  Plus,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Card } from '../../components/ui/Badge';

export default function SalonMembershipsPage() {
  const [plans] = useState([
    { id: 'silver', name: 'Glow Silver', price: '₹999 / month', discount: '10% Service discount', features: ['Priority booking slots', 'Free wash on birthdays'], activeCount: 18 },
    { id: 'gold', name: 'Glow Gold', price: '₹2,499 / month', discount: '15% Service discount', features: ['Free Hair Spa every month', 'Complimentary welcome mocktails', 'Dedicated booking hotline'], activeCount: 24 },
    { id: 'bridal', name: 'Glow Bridal Elite', price: '₹7,999 / 3 months', discount: '20% Service discount', features: ['Complete bridal consultation sessions', 'Dedicated expert stylist', 'Priority weekend styling'], activeCount: 6 },
  ]);

  const [reminders] = useState([
    { name: 'Karan Malhotra', tier: 'Glow Silver', date: '15 Aug 2026', type: 'Renewal' },
    { name: 'Ananya Sen', tier: 'Glow Gold', date: '18 Aug 2026', type: 'Renewal' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-green-forest">Club & Loyalty</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-charcoal">
            Memberships
          </h1>
          <p className="text-sm text-warm-gray">Configure subscription plans, discount percentages, and active subscriber lists</p>
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 bg-green-bottle hover:bg-green-forest text-white rounded-xl text-xs font-bold transition-all">
          <Plus className="w-4 h-4" /> Add Membership Tier
        </button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p) => (
          <Card key={p.id} className="p-5 border border-stone bg-white flex flex-col justify-between space-y-4 hover:border-green-bottle transition-all relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-yellow-butter/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-green-bottle">{p.name}</span>
                <span className="text-[10px] font-bold text-charcoal bg-cream px-2 py-0.5 rounded border border-stone">
                  {p.activeCount} active members
                </span>
              </div>
              <p className="text-lg font-bold text-charcoal">{p.price}</p>
              <p className="text-xs font-semibold text-green-forest bg-green-sage/10 p-2 rounded-lg border border-green-bottle/15">
                🏷️ {p.discount}
              </p>
              <ul className="text-xs text-warm-gray space-y-1.5 pt-2 border-t border-stone/50 leading-relaxed font-sans">
                {p.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-bottle shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <button className="w-full py-2 bg-ivory border border-stone hover:bg-cream rounded-xl text-xs font-bold text-charcoal transition-colors">
              Manage Members &rarr;
            </button>
          </Card>
        ))}
      </div>

      {/* Renewal alerts */}
      <Card className="p-5 border border-stone bg-white space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-mustard animate-pulse" /> Renewal Reminders
        </h2>
        <div className="divide-y divide-stone/50">
          {reminders.map((r, i) => (
            <div key={i} className="py-2.5 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-charcoal block">{r.name}</span>
                <span className="text-[10px] text-warm-gray">{r.tier} · Due on {r.date}</span>
              </div>
              <button className="px-3 py-1 bg-green-bottle text-white text-[10px] font-bold rounded-lg hover:bg-green-forest transition-colors">
                Send Alert
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
