import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { Sliders, ShieldCheck, Check, Sparkles, Users, Building, ArrowRight } from 'lucide-react';

export default function SaaSBillingPage() {
  const { user, activeWorkspace, workspaces, switchWorkspace } = useAuth();
  const { invoices } = useBusiness();

  const plans = [
    { name: "Starter", price: "₹999 / mo", invoices: "50 Invoices/mo", seats: "2 Team Seats", active: false },
    { name: "Pro Tier", price: "₹2,499 / mo", invoices: "Unlimited GST Invoices", seats: "5 Team Seats + RBAC", active: true },
    { name: "Enterprise", price: "₹4,999 / mo", invoices: "Unlimited + Multi-Company", seats: "Unlimited Seats", active: false }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sliders className="w-6 h-6 text-accent" /> SaaS Subscription & Workspaces
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Manage plan tier, usage limits, team member seats, and organization workspaces.</p>
      </div>

      {/* Current Plan Overview Card */}
      <div className="p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-[20px] border border-border shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-soft/20 text-teal-300 text-xs font-bold rounded-full border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" /> Active Plan Tier: {user?.subscriptionPlan}
          </div>
          <h2 className="text-2xl font-bold">{activeWorkspace.name}</h2>
          <p className="text-xs text-slate-300">14-Day Free Trial Active • {user?.trialDaysLeft} days remaining before auto-billing.</p>
        </div>

        <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2 text-xs">
          <p className="font-bold text-slate-200">Usage Meter</p>
          <div className="space-y-1">
            <div className="flex justify-between text-[11px]">
              <span>Invoices Created:</span>
              <span className="font-bold text-teal-300">{invoices.length} / Unlimited</span>
            </div>
            <div className="w-48 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="w-1/4 h-full bg-teal-400" />
            </div>
          </div>
        </div>

      </div>

      {/* Plan Tier Upgrade Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((p, idx) => (
          <div
            key={idx}
            className={`p-6 bg-white dark:bg-slate-900 rounded-[20px] border shadow-card flex flex-col justify-between ${
              p.active ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div>
              {p.active && <span className="text-[10px] font-bold text-accent uppercase tracking-widest block mb-1">CURRENT PLAN</span>}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{p.name}</h3>
              <p className="text-2xl font-extrabold text-accent mt-2">{p.price}</p>
              
              <ul className="my-6 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-soft" /> {p.invoices}</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-soft" /> {p.seats}</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-soft" /> Razorpay & UPI Enabled</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-accent-soft" /> OpenAI Financial Advisor</li>
              </ul>
            </div>

            <button
              className={`w-full py-2.5 rounded-xl font-bold text-xs ${
                p.active ? 'bg-slate-100 text-slate-500 cursor-default' : 'bg-accent text-white hover:bg-text shadow-md'
              }`}
            >
              {p.active ? 'Current Active Tier' : 'Upgrade Plan'}
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
