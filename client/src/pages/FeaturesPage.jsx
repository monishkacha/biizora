import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { FileText, Users, Package, CreditCard, ShieldCheck, Zap, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export default function FeaturesPage() {
  const featureList = [
    { title: "GST Invoice Generator", desc: "Support CGST, SGST, IGST with auto HSN/SAC codes, instant PDF export, printing, and UPI QR codes.", icon: FileText },
    { title: "Customer Ledger & CRM", desc: "Manage customer contacts, GSTIN verification, outstanding balances, and automated payment histories.", icon: Users },
    { title: "Smart Product & Inventory", desc: "Track stock levels, low-stock threshold alerts, cost vs selling prices, and HSN tax slabs.", icon: Package },
    { title: "Expense & Bill Scanner", desc: "Categorize office, rent, marketing, and salary costs. Claim maximum Input Tax Credit (ITC).", icon: CreditCard },
    { title: "Razorpay Online Payments", desc: "Accept UPI, Cards, NetBanking, and Wallets with automatic invoice reconciliation.", icon: Zap },
    { title: "Financial Health Score", desc: "Multi-pillar liquidity, solvency, and growth rating system out of 100.", icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Complete Feature Matrix</span>
          <h1 className="text-4xl font-extrabold tracking-tight">Designed for Maximum Financial Clarity</h1>
          <p className="text-slate-600 dark:text-slate-400">Everything Indian SMEs, freelancers, and growing agencies need to streamline cash flow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureList.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">{f.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 p-8 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-3xl text-center space-y-4">
          <h2 className="text-2xl font-bold">Ready to test these features in your business?</h2>
          <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-bold rounded-xl shadow-lg">
            <span>Start Free 14-Day Trial</span> <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
