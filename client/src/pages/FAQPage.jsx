import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChevronDown, HelpCircle } from 'lucide-react';

export default function FAQPage() {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    { q: "Is Biizora compliant with Indian GST laws?", a: "Yes, 100%. Biizora automatically calculates CGST (9%), SGST (9%), and IGST (18%) depending on whether your customer is intra-state or inter-state. It also auto-populates HSN/SAC codes and supports GSTR-1 & GSTR-3B report exports." },
    { q: "How does the AI Cash Flow Predictor work?", a: "Biizora uses historical invoice payment cycles, recurring retainer timelines, and expense patterns powered by OpenAI models to project your net cash positions for 7, 30, and 90 days out with a confidence score." },
    { q: "Can I collect payments directly via Razorpay & UPI?", a: "Absolutely! Every GST invoice automatically embeds a dynamic UPI QR Code and a Razorpay Payment Link button so your customers can pay instantly via Google Pay, PhonePe, Paytm, Cards, or NetBanking." },
    { q: "Can I invite my accountant or team members?", a: "Yes. Biizora includes Role-Based Access Control (RBAC) supporting Owner, Manager, Accountant, and Employee roles with granular permissions." },
    { q: "Is there a free trial?", a: "Yes! All new accounts get full access to the Pro tier for 14 days without requiring a credit card." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-16 flex-1 space-y-10">
        <div className="text-center space-y-3">
          <HelpCircle className="w-10 h-10 text-accent mx-auto" />
          <h1 className="text-4xl font-extrabold">Frequently Asked Questions</h1>
          <p className="text-slate-600 dark:text-slate-400">Everything you need to know about Biizora AI & GST Invoicing.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <button
                onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                className="w-full p-5 text-left font-bold text-base flex items-center justify-between gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openIdx === idx ? 'rotate-180' : ''}`} />
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
