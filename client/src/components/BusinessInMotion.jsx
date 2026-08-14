import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors,
  UtensilsCrossed,
  ShoppingBag,
  Boxes,
  BookOpen,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Users,
  Clock,
  Zap,
  BarChart3,
  Calendar,
  Layers,
  Printer,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

const INDUSTRIES = [
  {
    id: 'salon',
    name: 'Salon',
    icon: Scissors,
    tagline: 'Stylist chairs, walk-in queue & client ledger',
    demoRoute: '/app/appointments',
    chaos: [
      { text: '2 appointment overlaps', count: '10:30 AM slot' },
      { text: 'Stylist schedule unbalanced', count: 'Riya at 95% capacity' },
      { text: 'Keratin product stock running low', count: '2 bottles left' },
    ],
    organized: [
      { label: 'Today\'s Bookings', val: '12 Confirmed', status: 'Optimal' },
      { label: 'Stylist Chair Utilization', val: 'Balanced Across 4 Chairs', status: 'Active' },
      { label: 'Client History & Reminders', val: 'Automated WhatsApp Sent', status: 'Synced' },
    ],
    bizzInsight: 'Bizz: You have 8 appointments tomorrow. Senior Stylist Riya is near capacity, while Kavya has open slots to balance your schedule.',
    miniData: {
      title: 'Silk & Shine Studio',
      kpi1: { label: 'Daily Revenue', val: '₹14,800' },
      kpi2: { label: 'Active Chairs', val: '4 / 4 Busy' },
      items: [
        { name: 'Priya Patel · Haircut + Blow Dry', time: '10:00 AM', status: 'In Progress' },
        { name: 'Meera Shah · Keratin Treatment', time: '11:30 AM', status: 'Confirmed' },
        { name: 'Nisha Mehta · Spa Manicure', time: '02:00 PM', status: 'Confirmed' },
      ],
    },
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    icon: UtensilsCrossed,
    tagline: 'Table booking, kitchen KDS & POS billing',
    demoRoute: '/app/tables',
    chaos: [
      { text: 'Ingredient stock low', count: 'Cheese & Paneer low' },
      { text: '3 pending table orders', count: 'Table #4 & #8 waiting' },
      { text: 'Kitchen KDS peak queue', count: '14 mins avg prep' },
    ],
    organized: [
      { label: 'Live Table Occupation', val: '8 Tables Active (72%)', status: 'Live' },
      { label: 'Kitchen KDS Ticket Time', val: '6.5 Mins Avg Prep', status: 'Fast' },
      { label: 'Automatic Recipe Deductions', val: 'Stock Reorder Auto-Queued', status: 'Organized' },
    ],
    bizzInsight: 'Bizz: Cheese & Paneer consumption is trending 24% higher than expected. Consider placing a bulk raw order before dinner peak.',
    miniData: {
      title: 'Flavors Cafe & Bistro',
      kpi1: { label: 'Today\'s Sales', val: '₹28,450' },
      kpi2: { label: 'Open Tables', val: '8 / 12 Occupied' },
      items: [
        { name: 'Table #4 · Paneer Butter Masala + Naan', time: 'Order #108', status: 'In Kitchen' },
        { name: 'Table #2 · Cold Coffee & Pizza', time: 'Order #109', status: 'Ready' },
        { name: 'Table #7 · Family Dinner Combo', time: 'Order #110', status: 'Served' },
      ],
    },
  },
  {
    id: 'retail',
    name: 'Retail',
    icon: ShoppingBag,
    tagline: 'GST barcode billing, stock alerts & credit ledger',
    demoRoute: '/app/pos',
    chaos: [
      { text: '3 fast-moving SKUs running low', count: 'Reorder alert' },
      { text: '2 customer payments pending', count: '₹6,400 overdue' },
      { text: 'Barcode scan mismatch', count: 'Item price check' },
    ],
    organized: [
      { label: 'GST Invoices Generated', val: '48 Invoices Issued', status: '100% Tax Compliant' },
      { label: 'Low Stock Auto-Trigger', val: 'Purchase Orders Drafted', status: 'Stock Reordered' },
      { label: 'Overdue Credit Follow-ups', val: 'UPI Payment Link Sent', status: 'Cleared' },
    ],
    bizzInsight: 'Bizz: Fast-moving retail items are approaching low stock thresholds. Auto-generating purchase orders for your main distributor.',
    miniData: {
      title: 'Apex Retail Mart',
      kpi1: { label: 'Gross Sales', val: '₹42,100' },
      kpi2: { label: 'Items Scanned', val: '184 SKUs' },
      items: [
        { name: 'Rajesh Kumar · GST Bill #INV-1042', time: '₹3,450', status: 'Paid UPI' },
        { name: 'Ankita Shah · Retail Counter', time: '₹1,200', status: 'Paid Cash' },
        { name: 'Jayesh Traders · Wholesale Invoice', time: '₹12,500', status: 'Credit' },
      ],
    },
  },
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    icon: Boxes,
    tagline: 'Raw material BOM, production orders & QC',
    demoRoute: '/app/production-orders',
    chaos: [
      { text: 'Raw material stock running low', count: 'SS 304 sheets low' },
      { text: 'Production Order #104 delayed', count: 'Machine MC-02 pause' },
      { text: 'QC inspection pending', count: '400 units queued' },
    ],
    organized: [
      { label: 'Material Requirement Plan', val: 'Raw Material Allocated', status: 'Sufficient' },
      { label: 'Shop Floor Machines', val: 'MC-01 & MC-02 Running', status: '94% Efficiency' },
      { label: 'Finished Goods Transfer', val: 'QC Cleared & Batch Stocked', status: 'Completed' },
    ],
    bizzInsight: 'Bizz: Production Order #104 requires 120kg SS 304. Raw material inventory is available and allocated for shop floor dispatch.',
    miniData: {
      title: 'Apex Metal Works',
      kpi1: { label: 'Shop Floor Output', val: '1,450 Units' },
      kpi2: { label: 'Machine Efficiency', val: '94% OEE' },
      items: [
        { name: 'PO-2026-104 · Valve Body Batch', time: '500 Units', status: 'In Production' },
        { name: 'PO-2026-105 · SS Flange Assembly', time: '800 Units', status: 'QC Passed' },
        { name: 'RM-SS-304 · Stainless Steel Sheet', time: '1,200 Kg', status: 'Allocated' },
      ],
    },
  },
  {
    id: 'stationery',
    name: 'Stationery',
    icon: BookOpen,
    tagline: 'School supply kits, Xerox/print & POS billing',
    demoRoute: '/stationery/billing',
    chaos: [
      { text: 'Notebook stock running low', count: 'A4 Notebooks low' },
      { text: 'School kit order unassigned', count: 'Class 8 kit pending' },
      { text: 'Xerox paper stock low', count: '2 rims left' },
    ],
    organized: [
      { label: 'Bundled School Supply Kits', val: '18 Kits Prepared', status: 'Ready for Dispatch' },
      { label: 'Xerox & Print Billing', val: '1,400 Pages Billed', status: 'Automated' },
      { label: 'Vendor Purchase Log', val: 'Paper Stock Replenished', status: 'Restocked' },
    ],
    bizzInsight: 'Bizz: School Kit season peak detected. 4 bulk school orders are pending quotation approval. Paper inventory is optimal.',
    miniData: {
      title: 'PageCraft Stationery',
      kpi1: { label: 'Counter Revenue', val: '₹19,300' },
      kpi2: { label: 'Xerox Pages Billed', val: '1,420 Pages' },
      items: [
        { name: 'St. Xavier School · Class 6 Kit', time: '5 Kits', status: 'Packed' },
        { name: 'Document Printing · A4 B&W', time: '350 Pages', status: 'Completed' },
        { name: 'Camlin Geometry Sets & Pens', time: '12 Items', status: 'Billed' },
      ],
    },
  },
];

export default function BusinessInMotion() {
  const [activeIndustryId, setActiveIndustryId] = useState('retail');
  const [stage, setStage] = useState('chaos'); // 'chaos' | 'organized'

  const activeIndustry = INDUSTRIES.find((i) => i.id === activeIndustryId) || INDUSTRIES[2];
  const IconComponent = activeIndustry.icon;

  const handleIndustryChange = (id) => {
    setActiveIndustryId(id);
    setStage('chaos');
  };

  const handleSolveChaos = () => {
    setStage('organized');
  };

  return (
    <section className="py-20 sm:py-28 border-t border-stone bg-cream/40 relative overflow-hidden">
      {/* Background Subtle Accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-yellow-butter/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-green-bottle/5 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-10 sm:space-y-12">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-green-bottle/10 text-green-bottle text-xs font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-green-bottle" /> Business in Motion
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-charcoal">
            RUN YOUR BUSINESS
          </h2>
          <p className="text-base sm:text-lg text-warm-gray leading-relaxed max-w-xl mx-auto font-light">
            See what happens when everything finally works together. Select your industry to experience Biizora in action.
          </p>
        </div>

        {/* Industry Selector Tabs */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          {INDUSTRIES.map((ind) => {
            const IndIcon = ind.icon;
            const isSelected = ind.id === activeIndustryId;

            return (
              <button
                key={ind.id}
                type="button"
                onClick={() => handleIndustryChange(ind.id)}
                className={`px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl border text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-2.5 shadow-xs ${
                  isSelected
                    ? 'bg-green-bottle text-white border-green-bottle shadow-subtle scale-[1.02]'
                    : 'bg-white text-charcoal border-stone hover:bg-cream/80 hover:border-stone/80'
                }`}
              >
                <IndIcon className={`w-4 h-4 ${isSelected ? 'text-yellow-butter' : 'text-green-bottle'}`} />
                <span>{ind.name}</span>
              </button>
            );
          })}
        </div>

        {/* Mini Business Simulation Card Container */}
        <div className="rounded-[28px] border border-stone bg-white shadow-card overflow-hidden">
          {/* Header Bar of Mini Business */}
          <div className="px-6 py-4 bg-cream/70 border-b border-stone flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-green-bottle text-white flex items-center justify-center shrink-0 shadow-xs">
                <IconComponent className="w-5 h-5 text-yellow-butter" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-charcoal">{activeIndustry.miniData.title}</h3>
                <p className="text-xs text-warm-gray">{activeIndustry.tagline}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-warm-gray mr-1">
                State:
              </span>
              {stage === 'chaos' ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5 animate-pulse">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700" /> Needs Attention
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Biizora Organized
                </span>
              )}
            </div>
          </div>

          {/* Interactive Simulation Dashboard Grid */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-cream/30 border border-stone/80">
                <p className="text-xs text-warm-gray font-medium">{activeIndustry.miniData.kpi1.label}</p>
                <p className="text-2xl font-bold font-display text-charcoal mt-0.5">{activeIndustry.miniData.kpi1.val}</p>
              </div>
              <div className="p-4 rounded-2xl bg-cream/30 border border-stone/80">
                <p className="text-xs text-warm-gray font-medium">{activeIndustry.miniData.kpi2.label}</p>
                <p className="text-2xl font-bold font-display text-green-bottle mt-0.5">{activeIndustry.miniData.kpi2.val}</p>
              </div>
            </div>

            {/* STAGE COMPARISON VIEW WITH FRAMER MOTION */}
            <AnimatePresence mode="wait">
              {stage === 'chaos' ? (
                <motion.div
                  key="chaos-stage"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5"
                >
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-700" /> Daily Operational Friction Detected
                      </p>
                      <span className="text-[11px] font-semibold text-amber-800">3 Alerts</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {activeIndustry.chaos.map((c, i) => (
                        <motion.div
                          key={c.text}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08 }}
                          className="p-3 bg-white rounded-xl border border-amber-200 shadow-xs space-y-1"
                        >
                          <p className="text-xs font-bold text-charcoal">{c.text}</p>
                          <p className="text-[11px] text-amber-800 font-medium">{c.count}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Operational Records List */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-warm-gray uppercase tracking-wider">Live Activity Stream</p>
                    <div className="divide-y divide-stone/50 border border-stone/70 rounded-2xl bg-cream/20 overflow-hidden text-xs">
                      {activeIndustry.miniData.items.map((item, idx) => (
                        <div key={idx} className="p-3 flex items-center justify-between">
                          <span className="font-semibold text-charcoal">{item.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-warm-gray font-mono">{item.time}</span>
                            <span className="px-2 py-0.5 rounded bg-white text-charcoal font-bold border border-stone text-[10px]">
                              {item.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* STAGE 2 -> STAGE 3 CTA BUTTON */}
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={handleSolveChaos}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-green-bottle hover:bg-green-forest text-white font-bold text-sm shadow-subtle transition-all duration-200 inline-flex items-center justify-center gap-2 group"
                    >
                      <span>Let Biizora handle it</span>
                      <ArrowRight className="w-4 h-4 text-yellow-butter group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="organized-stage"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  {/* Organized State Summary */}
                  <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Operations Transformed & Synchronized
                      </p>
                      <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
                        100% Clear
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {activeIndustry.organized.map((org, i) => (
                        <motion.div
                          key={org.label}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-xs space-y-1"
                        >
                          <p className="text-[11px] text-warm-gray font-medium">{org.label}</p>
                          <p className="text-xs font-bold text-charcoal">{org.val}</p>
                          <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                            {org.status}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Bizz AI Intelligence Layer Moment */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="p-5 rounded-2xl bg-green-bottle text-white border border-green-forest shadow-subtle space-y-2 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <Sparkles className="w-20 h-20 text-yellow-butter" />
                    </div>

                    <div className="flex items-center gap-2 text-xs font-bold text-yellow-butter uppercase tracking-widest">
                      <Sparkles className="w-4 h-4 text-yellow-butter" /> Bizz AI Copilot Insight
                    </div>
                    <p className="text-sm sm:text-base font-medium text-white/95 leading-relaxed relative z-10">
                      "{activeIndustry.bizzInsight}"
                    </p>
                  </motion.div>

                  {/* End Stage Brand Moment & Direct Demo Link */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-stone">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg font-bold text-charcoal">That's Biizora.</span>
                      <span className="text-xs text-warm-gray">No chaos. Just clarity.</span>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setStage('chaos')}
                        className="px-4 py-2.5 rounded-xl border border-stone bg-cream/50 text-charcoal font-semibold text-xs hover:bg-cream transition-all flex items-center justify-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Re-play
                      </button>
                      <Link
                        to={activeIndustry.demoRoute}
                        className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-yellow-butter hover:bg-yellow-honey text-charcoal font-bold text-xs shadow-yellow transition-all text-center inline-flex items-center justify-center gap-2"
                      >
                        Explore the full demo <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
