import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-16 flex-1 space-y-6">
        <h1 className="text-3xl font-extrabold">Privacy Policy</h1>
        <p className="text-xs text-slate-400">Last updated: August 2, 2026</p>
        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed space-y-4 text-slate-600 dark:text-slate-300">
          <p>At Biizora Technologies Private Limited, we prioritize your financial data privacy. This policy outlines how we collect, use, and protect your company information, customer ledgers, and invoice data.</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">1. Data Collection & Security</h3>
          <p>We process company details, GSTIN, PAN numbers, and transaction logs solely to provide invoicing, cash flow forecasting, and accounting services. All data is encrypted in transit via TLS 1.3 and at rest using 256-Bit AES encryption.</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">2. AI Models & Business Data Confidentiality</h3>
          <p>Your business transaction records are never shared with external model trainers or third parties. OpenAI models integrated into Biizora process prompt tokens strictly within zero-retention private enterprise sessions.</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">3. Payment Gateway Integrity</h3>
          <p>All Razorpay & UPI transactions are tokenized following RBI compliance standards. We never store raw credit card credentials or banking passwords.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
