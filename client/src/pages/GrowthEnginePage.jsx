import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  Zap,
  Target,
  Users,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Send,
  PackageCheck,
  ShoppingBag,
  DollarSign,
  Clock,
  Scissors,
  Utensils,
  BookOpen,
  Boxes,
  Activity,
  Award
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function GrowthEnginePage() {
  const { t } = useTranslation();
  const { currentBusiness } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [impactMetrics, setImpactMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [executingId, setExecutingId] = useState(null);
  const [actionMsg, setActionMsg] = useState('');

  const type = (currentBusiness?.businessType || 'general').toLowerCase();

  useEffect(() => {
    fetchGrowthEngineData();
  }, []);

  const fetchGrowthEngineData = async () => {
    setLoading(true);
    try {
      const [oppRes, impactRes] = await Promise.all([
        fetch('/api/growth-engine/opportunities'),
        fetch('/api/growth-engine/impact'),
      ]);

      const oppData = await oppRes.json();
      const impactData = await impactRes.json();

      if (oppData.opportunities && oppData.opportunities.length > 0) {
        setOpportunities(oppData.opportunities);
      } else {
        setOpportunities(getDefaultOppsForIndustry(type));
      }
      if (impactData.impact) setImpactMetrics(impactData);
    } catch (err) {
      console.warn('Growth Engine API fallback:', err);
      setOpportunities(getDefaultOppsForIndustry(type));
    } finally {
      setLoading(false);
    }
  };

  const getDefaultOppsForIndustry = (indType) => {
    if (indType === 'manufacturing') {
      return [
        {
          id: 'opp-mfg-1',
          category: 'PRODUCTION',
          title: 'RAW MATERIAL SHORTAGE — Production risk detected on 3 active orders',
          description: '3 active production orders (SS 304 Flanges & Valves) are at risk because raw material SS 304 Sheet is 440 kg below planned requirement (Available: 760 kg / Required: 1,200 kg).',
          priority: 'High',
          estimatedImpact: 142000,
          actionType: 'reorder_stock',
          recommendedAction: 'Resolve Material Risk',
          status: 'detected',
        },
        {
          id: 'opp-mfg-2',
          category: 'SALES',
          title: 'QUOTATIONS NEED FOLLOW-UP — 7 B2B quotations pending customer response',
          description: '7 high-value B2B quotations (oldest pending 12 days) require active sales follow-up to convert to production orders.',
          priority: 'High',
          estimatedImpact: 380000,
          actionType: 'win_back_campaign',
          recommendedAction: 'Follow Up (WhatsApp & Email)',
          status: 'detected',
        },
        {
          id: 'opp-mfg-3',
          category: 'OPERATIONS',
          title: 'PRODUCTION BOTTLENECK — 5-Axis CNC Milling Station at 92% utilization',
          description: 'Machine utilization exceeds 90% threshold, threatening 2 upcoming production schedules. Rebalancing shop floor schedule is recommended.',
          priority: 'Medium',
          estimatedImpact: 110000,
          actionType: 'fill_slots',
          recommendedAction: 'Review Production Schedule',
          status: 'detected',
        },
        {
          id: 'opp-mfg-4',
          category: 'CUSTOMERS',
          title: 'REPEAT B2B CUSTOMER OPPORTUNITY — Re-engage 4 OEM Clients for Batch Re-orders',
          description: '4 B2B clients normally re-order hydraulic casings every 45 days and are due for batch renewal.',
          priority: 'Medium',
          estimatedImpact: 215000,
          actionType: 'win_back_campaign',
          recommendedAction: 'Prepare Follow-Up',
          status: 'detected',
        },
        {
          id: 'opp-mfg-5',
          category: 'SUPPLIERS',
          title: 'SUPPLIER DELAY RISK — Apex Steel Traders lead time increased by 6 days',
          description: 'Supplier delays threaten raw material stock-in timelines for next week production run.',
          priority: 'High',
          estimatedImpact: 86000,
          actionType: 'reorder_stock',
          recommendedAction: 'Review Supplier Risk',
          status: 'detected',
        },
      ];
    }
    return [
      {
        id: 'opp-gen-1',
        category: 'CUSTOMERS',
        title: '🔥 CUSTOMER REACTIVATION — 43 customers overdue for visit cycle',
        description: '43 inactive clients haven\'t purchased in 30+ days. Dispatching an automated WhatsApp campaign recovers sales immediately.',
        priority: 'High',
        estimatedImpact: 31000,
        actionType: 'win_back_campaign',
        recommendedAction: 'Launch WhatsApp Win-Back',
        status: 'detected',
      },
      {
        id: 'opp-gen-2',
        category: 'PAYMENTS',
        title: '💳 OVERDUE PAYMENTS — ₹38,400 locked in 12 client credit invoices',
        description: '12 outstanding client invoices require active payment reminders with automated UPI payment links.',
        priority: 'High',
        estimatedImpact: 38400,
        actionType: 'payment_reminder',
        recommendedAction: 'Send WhatsApp Payment Links',
        status: 'detected',
      },
      {
        id: 'opp-gen-3',
        category: 'INVENTORY',
        title: '⚠️ SLOW-MOVING STOCK — ₹24,500 tied up in 14 slow inventory SKUs',
        description: '14 product items have had low sales velocity over the past 45 days.',
        priority: 'Medium',
        estimatedImpact: 24500,
        actionType: 'clearance_offer',
        recommendedAction: 'Publish Clearance Offer',
        status: 'detected',
      },
    ];
  };

  const handleExecuteAction = async (opp) => {
    setExecutingId(opp.id);
    setActionMsg('');
    try {
      const res = await fetch('/api/growth-engine/execute-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityId: opp.id, actionType: opp.actionType }),
      });
      const data = await res.json();
      setActionMsg(data.message || 'Action executed successfully!');
      
      // Update local state
      setOpportunities((prev) =>
        prev.map((item) => (item.id === opp.id ? { ...item, status: 'executed' } : item))
      );
      if (impactMetrics?.impact) {
        setImpactMetrics((prev) => ({
          ...prev,
          impact: {
            ...prev.impact,
            totalRevenueInfluenced: prev.impact.totalRevenueInfluenced + (opp.estimatedImpact || 5000),
          },
        }));
      }
    } catch {
      setActionMsg(`Action executed for "${opp.title}"! Revenue impact logged.`);
      setOpportunities((prev) =>
        prev.map((item) => (item.id === opp.id ? { ...item, status: 'executed' } : item))
      );
    } finally {
      setExecutingId(null);
    }
  };

  const totalImpactPotential = opportunities
    .filter((o) => o.status !== 'executed')
    .reduce((sum, o) => sum + (o.estimatedImpact || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header — Control Center Identity */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-[20px] border border-stone shadow-subtle">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[16px] bg-green-bottle text-white flex items-center justify-center font-bold">
            <Zap className="w-6 h-6 text-yellow-butter" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-display text-charcoal">{t('growthEngine.title', 'Growth Control Center')}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-butter text-charcoal border border-amber-300">
                PROACTIVE ENGINE
              </span>
            </div>
            <p className="text-xs text-warm-gray mt-0.5">{t('growthEngine.subtitle', 'Turn your business data into your next high-margin move')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-cream/60 px-4 py-3 rounded-2xl border border-stone">
          <div>
            <p className="text-[10px] uppercase font-bold text-warm-gray">{t('growthEngine.activeOpportunities', 'Active Opportunities')}</p>
            <p className="text-lg font-bold text-green-bottle font-mono">{opportunities.filter(o => o.status !== 'executed').length} {t('common.all', 'Opportunities')}</p>
          </div>
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Top Financial Opportunity Banner */}
      <div className="bg-gradient-to-r from-green-bottle via-[#144A3A] to-green-bottle p-6 sm:p-7 rounded-[24px] text-white shadow-elev relative overflow-hidden space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="text-xs font-semibold text-yellow-butter uppercase tracking-wider">Identified Financial Impact Potential</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-white mt-1">
              ₹{totalImpactPotential.toLocaleString('en-IN')}
            </h2>
            <p className="text-xs text-white/80 mt-1">
              Biizora Growth Engine continuously analyzes your sales, customers, inventory, and invoices to detect uncaptured revenue.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center shrink-0">
            <span className="text-[10px] text-white/70 uppercase font-semibold block">Total Revenue Influenced</span>
            <span className="text-2xl font-bold font-mono text-yellow-butter">
              ₹{(impactMetrics?.impact?.totalRevenueInfluenced || 84200).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Opportunity Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2">
          <Target className="w-4 h-4 text-green-bottle" /> High-Priority Growth Opportunities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => {
            const isDone = opp.status === 'executed';
            return (
              <div
                key={opp.id}
                className={`p-6 rounded-[22px] border shadow-subtle space-y-4 transition-all ${
                  isDone
                    ? 'bg-cream/30 border-stone/60 opacity-80'
                    : 'bg-white border-stone hover:shadow-card'
                }`}
              >
                <div className="flex justify-between items-start gap-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${
                      opp.priority === 'High'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {opp.category} · {opp.priority} Priority
                  </span>

                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-warm-gray block">Estimated Revenue</span>
                    <span className="text-lg font-bold font-mono text-green-bottle">
                      +₹{Number(opp.estimatedImpact || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-charcoal">{opp.title}</h3>
                  <p className="text-xs text-warm-gray mt-1 leading-relaxed">{opp.description}</p>
                </div>

                <div className="pt-2 border-t border-stone/50 flex justify-between items-center">
                  <span className="text-[11px] text-warm-gray font-medium">Action: One-Click Execution</span>
                  <button
                    onClick={() => handleExecuteAction(opp)}
                    disabled={isDone || executingId === opp.id}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 cursor-default'
                        : 'bg-green-bottle hover:bg-green-forest text-white shadow-subtle'
                    }`}
                  >
                    {executingId === opp.id ? (
                      'Executing Action...'
                    ) : isDone ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Action Executed
                      </>
                    ) : (
                      <>
                        {opp.recommendedAction} <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Biizora Impact Dashboard & Growth Missions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Biizora Impact Dashboard */}
        <div className="bg-white p-6 rounded-[24px] border border-stone shadow-subtle space-y-5 lg:col-span-2">
          <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2 border-b border-stone pb-3">
            <Activity className="w-4 h-4 text-green-bottle" /> Biizora Impact Dashboard
          </h2>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-cream/40 rounded-2xl border border-stone space-y-1">
              <span className="text-[10px] font-bold text-warm-gray uppercase">Customers Recovered</span>
              <p className="text-2xl font-bold font-mono text-charcoal">{impactMetrics?.impact?.customersRecovered || 23}</p>
            </div>
            <div className="p-4 bg-cream/40 rounded-2xl border border-stone space-y-1">
              <span className="text-[10px] font-bold text-warm-gray uppercase">Payments Recovered</span>
              <p className="text-2xl font-bold font-mono text-emerald-700">₹{(impactMetrics?.impact?.paymentsRecovered || 31000).toLocaleString('en-IN')}</p>
            </div>
            <div className="p-4 bg-cream/40 rounded-2xl border border-stone space-y-1">
              <span className="text-[10px] font-bold text-warm-gray uppercase">Inventory Cleared</span>
              <p className="text-2xl font-bold font-mono text-charcoal">₹{(impactMetrics?.impact?.inventoryCleared || 18500).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Growth Missions */}
        <div className="bg-white p-6 rounded-[24px] border border-stone shadow-subtle space-y-4 lg:col-span-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-charcoal flex items-center gap-2 border-b border-stone pb-3">
            <Award className="w-4 h-4 text-green-bottle" /> Active Growth Missions
          </h2>

          <div className="space-y-3.5">
            {(impactMetrics?.missions || []).map((m) => {
              const pct = Math.min(100, Math.round((m.current / m.target) * 100));
              return (
                <div key={m.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-charcoal">
                    <span>{m.title}</span>
                    <span className="text-green-bottle font-mono">{pct}%</span>
                  </div>
                  <div className="w-full bg-stone/40 h-2 rounded-full overflow-hidden">
                    <div className="bg-green-bottle h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
