import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import {
  BarChart3,
  Download,
  FileText,
  Printer,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Building,
  DollarSign
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import SalonReportsPage from './salon/SalonReportsPage';

export default function ReportsPage() {
  const { activeWorkspace } = useAuth();
  const { metrics, invoices, expenses, company } = useBusiness();

  if (activeWorkspace?.businessType === 'salon') {
    return <SalonReportsPage />;
  }
  const [activeTab, setActiveTab] = useState('pnl');

  const totalGstOutput = invoices.reduce((sum, i) => sum + (i.status === 'paid' ? (i.totalTax || 0) : 0), 0);
  const totalGstInput = expenses.reduce((sum, e) => sum + (e.gstClaimable ? (e.gstAmount || 0) : 0), 0);
  const netGstPayable = Math.max(0, totalGstOutput - totalGstInput);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-accent" /> Executive Financial Reports & GST Filing
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Generate P&L statements, GSTR-1 / GSTR-3B tax summaries, and cash flow reports.</p>
        </div>

        <button
          onClick={handlePrintReport}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-text text-white rounded-xl text-xs font-bold shadow-md shadow-subtle transition-all"
        >
          <Printer className="w-4 h-4" /> Print / Export Report PDF
        </button>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 no-print">
        {[
          { id: 'pnl', label: 'Profit & Loss Statement' },
          { id: 'gst', label: 'GST GSTR-1 / 3B Summary' },
          { id: 'cashflow', label: 'Cash Flow Statement' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-accent text-white shadow-md shadow-subtle'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Printable Content Container */}
      <div id="printable-report" className="p-8 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-card space-y-6">
        
        {/* Report Company Banner */}
        <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{company.name}</h2>
            <p className="text-xs text-slate-400">GSTIN: <span className="font-mono text-accent">{company.gstin}</span></p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-bg-secondary dark:bg-bg-secondary text-blue-700 dark:text-blue-300 text-xs font-bold rounded-lg uppercase">
              Financial Period: FY 2026-27 (Q2)
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Generated: {new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        {/* Tab 1: P&L Statement */}
        {activeTab === 'pnl' && (
          <div className="space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">PROFIT AND LOSS STATEMENT</h3>
            
            <div className="space-y-3 text-xs">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-2">
                <h4 className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[11px]">1. Operating Revenue</h4>
                <div className="flex justify-between pl-4 text-slate-600 dark:text-slate-300">
                  <span>Gross Sales & Retainer Fees:</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{metrics.totalRevenue.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-2">
                <h4 className="font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[11px]">2. Operating Expenses</h4>
                {expenses.map(e => (
                  <div key={e.id} className="flex justify-between pl-4 text-slate-600 dark:text-slate-300">
                    <span>{e.title} ({e.category}):</span>
                    <span>₹{Number(e.amount).toLocaleString('en-IN')}</span>
                  </div>
                ))}
                <div className="flex justify-between pl-4 pt-2 border-t border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">
                  <span>Total Operating Cost:</span>
                  <span className="text-accent-soft">₹{metrics.totalExpenses.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="p-5 bg-bg-secondary dark:bg-bg-secondary/60 rounded-2xl border border-border dark:border-border flex justify-between items-center text-sm font-extrabold">
                <span className="text-slate-900 dark:text-white">NET PROFIT BEFORE TAX:</span>
                <span className="text-2xl text-accent dark:text-text-muted">₹{metrics.netProfit.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: GST Summary */}
        {activeTab === 'gst' && (
          <div className="space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">GSTR-1 & GSTR-3B TAX RETURN SUMMARY</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400">Output GST Collected (Sales)</span>
                <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">₹{totalGstOutput.toLocaleString('en-IN')}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-400">Input Tax Credit (ITC Claimed)</span>
                <p className="text-xl font-bold text-accent-soft dark:text-text-muted mt-1">₹{totalGstInput.toLocaleString('en-IN')}</p>
              </div>

              <div className="p-4 bg-bg-secondary dark:bg-bg-secondary rounded-2xl border border-border dark:border-border">
                <span className="text-xs text-blue-700 dark:text-blue-300 font-bold">Net GST Liability Owed</span>
                <p className="text-xl font-extrabold text-accent dark:text-text-muted mt-1">₹{netGstPayable.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="p-4 bg-bg-hover dark:bg-bg-hover/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs text-amber-800 dark:text-amber-200 space-y-1">
              <p className="font-bold flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Compliance Filing Deadline Reminder</p>
              <p>GSTR-1 (Outward Supplies) due on 11th. GSTR-3B (Summary Return) due on 20th of this month.</p>
            </div>
          </div>
        )}

        {/* Tab 3: Cash Flow Statement */}
        {activeTab === 'cashflow' && (
          <div className="space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">CASH FLOW STATEMENT</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span>Opening Cash Balance:</span>
                <span className="font-bold">₹3,50,000</span>
              </div>
              <div className="flex justify-between p-3 bg-bg-secondary dark:bg-bg-secondary/40 rounded-xl text-emerald-700 dark:text-emerald-300">
                <span>Operating Cash Inflow (Customer Payments):</span>
                <span className="font-bold">+ ₹{metrics.totalRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between p-3 bg-bg-hover dark:bg-red-950/40 rounded-xl text-red-700 dark:text-red-300">
                <span>Operating Cash Outflow (Vendor Costs & Salaries):</span>
                <span className="font-bold">- ₹{metrics.totalExpenses.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between p-4 bg-teal-50 dark:bg-teal-950 rounded-2xl border border-teal-200 font-extrabold text-sm text-teal-800 dark:text-teal-200">
                <span>NET CLOSING CASH POSITION:</span>
                <span className="text-xl">₹{metrics.cashBalance.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
