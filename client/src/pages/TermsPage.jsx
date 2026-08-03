import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 flex-1 space-y-6">
        <h1 className="text-3xl font-extrabold">Terms of Service</h1>
        <p className="text-xs text-slate-400">Last updated: August 2, 2026</p>
        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed space-y-4 text-slate-600 dark:text-slate-300">
          <p>Welcome to Amexora. By accessing or using our financial operating system web application, you agree to bound by these terms.</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Subscription & Account Access</h3>
          <p>Amexora provides software services under monthly or annual subscription plans. Free trial accounts automatically convert to chosen plan tiers unless cancelled prior to trial expiration.</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. GST Filing Disclaimer</h3>
          <p>Amexora facilitates automated GSTR-1 and GSTR-3B summary calculations based on user inputs. Users remain responsible for submitting final tax returns to the GSTN portal.</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">3. Termination & Data Export</h3>
          <p>You may cancel your subscription at any time. Upon cancellation, you retain 60 days to export your customer ledgers, invoices, and expense reports in CSV/PDF formats.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
