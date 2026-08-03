import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Sparkles, Target, Users, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 flex-1 space-y-12">
        <div className="text-center space-y-4">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Our Mission</span>
          <h1 className="text-4xl font-extrabold tracking-tight">Empowering 63 Million Indian SMEs with AI Financial Clarity</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            Amexora was built to eliminate manual bookkeeping friction, delayed payments, and cash flow uncertainty for business owners across India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <Target className="w-8 h-8 text-blue-600 mx-auto" />
            <h3 className="font-bold text-lg">Mission Driven</h3>
            <p className="text-xs text-slate-500">Accelerate working capital liquidity for Indian startups and SMEs.</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-teal-500 mx-auto" />
            <h3 className="font-bold text-lg">AI First Architecture</h3>
            <p className="text-xs text-slate-500">Continuous 90-day predictive cash flow forecasting.</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-lg">100% Compliant</h3>
            <p className="text-xs text-slate-500">Full Indian GST tax rules, HSN/SAC validation & Razorpay UPI security.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
