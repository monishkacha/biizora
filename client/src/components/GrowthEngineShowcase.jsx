import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  TrendingUp,
  Target,
  ArrowRight,
  QrCode,
  CheckCircle2,
  Users,
  Boxes,
  ShieldCheck,
  Sparkles,
  Repeat,
  DollarSign
} from 'lucide-react';

export default function GrowthEngineShowcase() {
  const [activeTab, setActiveTab] = useState('reactivation');

  const demoOpportunities = {
    reactivation: {
      title: '43 customers are overdue for their usual appointment',
      revenue: '₹31,000',
      category: 'CUSTOMERS',
      action: 'Launch Win-Back Campaign',
      impact: '7 bookings generated · ₹8,400 recovered within 48h',
      description: 'Growth Engine identified clients whose usual 30-day visit cycle was exceeded and automatically prepared a personalized notification offer.',
    },
    inventory: {
      title: '₹38,000 is locked in slow-moving inventory',
      revenue: '₹15,200',
      category: 'INVENTORY',
      action: 'Create Clearance Campaign',
      impact: '18 items sold · ₹12,000 working capital unlocked',
      description: 'Growth Engine detected SKUs with zero sales in 45 days and generated a bundle offer to clear stock before expiration.',
    },
    receivables: {
      title: '₹24,500 locked in 5 overdue client invoices',
      revenue: '₹24,500',
      category: 'PAYMENTS',
      action: 'Send UPI Reminders',
      impact: '4 invoices collected · ₹19,800 paid directly to bank',
      description: 'Growth Engine detected overdue payment terms and dispatched automated reminders with instant UPI payment links.',
    },
  };

  const activeOpp = demoOpportunities[activeTab];

  return (
    <section className="py-20 bg-cream/40 border-y border-stone relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-yellow-butter text-charcoal text-xs font-extrabold tracking-wide uppercase shadow-subtle border border-amber-300">
            <Zap className="w-4 h-4 text-green-bottle" /> Layer 3B · Growth Engine vs Bizz AI
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-charcoal">
            Bizz answers your questions.<br />
            <span className="text-green-bottle">Growth Engine grows your business automatically.</span>
          </h2>
          <p className="text-sm text-warm-gray leading-relaxed">
            While Bizz answers what happened yesterday, the Growth Engine proactively monitors your business data to detect uncaptured revenue, overdue customers, and slow inventory—and gives you one-click execution.
          </p>
        </div>

        {/* The Complete Biizora Ecosystem Loop Diagram */}
        <div className="bg-white p-7 sm:p-8 rounded-[28px] border border-stone shadow-card space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-extrabold uppercase tracking-wider text-green-bottle">The Complete Biizora Growth Loop</span>
            <h3 className="text-xl font-bold font-display text-charcoal">How Biizora turns every customer transaction into recurring revenue</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 text-center pt-2">
            {[
              { step: '1', title: 'Customer QR', desc: 'Scan link / QR code', icon: QrCode },
              { step: '2', title: 'Experience', desc: 'Book, Order or Buy', icon: Users },
              { step: '3', title: 'Payment', desc: 'Secure Razorpay', icon: DollarSign },
              { step: '4', title: 'Business OS', desc: 'Fulfill transaction', icon: CheckCircle2 },
              { step: '5', title: 'Growth Engine', desc: 'Detect opportunity', icon: Zap },
              { step: '6', title: 'Reactivate', desc: 'One-click campaign', icon: Repeat },
              { step: '7', title: 'More Revenue', desc: 'Customer returns', icon: TrendingUp },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="p-3.5 bg-cream/50 rounded-2xl border border-stone/70 space-y-2 flex flex-col justify-between items-center group hover:bg-green-bottle hover:text-white transition-all">
                  <div className="w-8 h-8 rounded-xl bg-green-bottle text-yellow-butter group-hover:bg-yellow-butter group-hover:text-green-bottle flex items-center justify-center font-bold text-xs">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold font-display">{item.title}</p>
                    <p className="text-[10px] text-warm-gray group-hover:text-white/80">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Growth Engine Demonstration */}
        <div className="bg-gradient-to-br from-green-bottle via-[#0D3328] to-green-bottle text-white rounded-[32px] p-6 sm:p-10 shadow-elev space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/15 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-butter animate-pulse" />
                <span className="text-xs font-bold text-yellow-butter uppercase tracking-wider">Live Proactive Opportunity Command Center</span>
              </div>
              <h3 className="text-2xl font-bold font-display text-white mt-1">Growth Engine Command View</h3>
            </div>

            {/* Tab Selector */}
            <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/15 gap-1">
              {[
                { key: 'reactivation', label: 'Customer Win-Back' },
                { key: 'inventory', label: 'Slow Inventory' },
                { key: 'receivables', label: 'Overdue Invoices' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === tab.key
                      ? 'bg-yellow-butter text-charcoal shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Opportunity Showcase Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-yellow-butter text-charcoal uppercase tracking-wider font-mono">
                  {activeOpp.category} OPPORTUNITY
                </span>
                <span className="text-xs text-white/70">Detected in Real-Time Business Data</span>
              </div>

              <h4 className="text-2xl sm:text-3xl font-bold font-display text-white leading-tight">
                {activeOpp.title}
              </h4>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                {activeOpp.description}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/register"
                  className="px-6 py-3 bg-yellow-butter hover:bg-yellow-butter/90 text-charcoal font-bold text-xs rounded-xl shadow-subtle flex items-center gap-2 transition-all"
                >
                  {activeOpp.action} <ArrowRight className="w-4 h-4" />
                </Link>
                <span className="text-xs text-white/70 italic">One-click execution preserved in Biizora OS</span>
              </div>
            </div>

            {/* Financial Impact Metric Card */}
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-[24px] border border-white/20 text-center space-y-4 lg:col-span-1">
              <span className="text-xs font-bold text-yellow-butter uppercase tracking-wider block">Estimated Opportunity Impact</span>
              <p className="text-4xl font-extrabold font-mono text-white tracking-tight">{activeOpp.revenue}</p>
              <div className="p-3 bg-black/20 rounded-xl text-left border border-white/10 space-y-1">
                <span className="text-[10px] text-white/60 uppercase font-semibold block">Measured Outcome</span>
                <p className="text-xs font-bold text-yellow-butter">{activeOpp.impact}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
