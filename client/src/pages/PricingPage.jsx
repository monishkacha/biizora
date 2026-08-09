import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Check, Sparkles, ArrowRight } from 'lucide-react';

export default function PricingPage() {
  const [annualBilling, setAnnualBilling] = useState(true);

  const plans = [
    {
      name: "Free Trial",
      price: "₹0",
      period: "for 14 days",
      desc: "Perfect for exploring Biizora features.",
      features: ["Up to 15 GST Invoices", "Customer Management", "Basic Expense Tracking", "1 Team Seat", "Community Support"],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Starter",
      price: annualBilling ? "₹799" : "₹999",
      period: "per month",
      desc: "Ideal for freelancers & sole proprietors.",
      features: ["50 Invoices / month", "Unlimited Customers", "GST & UPI QR Code Support", "AI Cash Flow (7-Day)", "2 Team Seats", "Email Support"],
      cta: "Choose Starter",
      popular: false
    },
    {
      name: "Pro Tier",
      price: annualBilling ? "₹1,999" : "₹2,499",
      period: "per month",
      desc: "For growing SMEs, agencies & retailers.",
      features: ["Unlimited GST Invoices", "Razorpay Payment Gateway", "Full 7-Pillar AI Suite", "Inventory & Stock Alerts", "5 Team Seats + RBAC", "Priority WhatsApp Support"],
      cta: "Upgrade to Pro",
      popular: true
    },
    {
      name: "Enterprise",
      price: annualBilling ? "₹3,999" : "₹4,999",
      period: "per month",
      desc: "For multi-firm businesses & large teams.",
      features: ["Unlimited Team Seats", "Dedicated AI Business Advisor", "Custom API & Webhooks", "Dedicated Account Manager", "99.9% Uptime SLA"],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-bold text-accent dark:text-text-muted uppercase tracking-widest">Transparent Pricing</span>
          <h1 className="text-4xl font-extrabold tracking-tight">Simple Plans for Every Stage of Growth</h1>
          <p className="text-slate-600 dark:text-slate-400">All plans include a 14-day free trial. Cancel anytime with zero commitment.</p>
          
          {/* Annual vs Monthly Switch */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-sm font-medium ${!annualBilling ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Monthly</span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-12 h-6 bg-accent rounded-full p-1 transition-colors relative"
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${annualBilling ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-medium ${annualBilling ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
              Annual <span className="text-xs font-bold text-accent-soft bg-emerald-100 dark:bg-bg-secondary px-2 py-0.5 rounded-full">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((p, i) => (
            <div
              key={i}
              className={`p-6 rounded-[20px] bg-white dark:bg-slate-900 border flex flex-col justify-between relative shadow-card ${
                p.popular ? 'border-blue-600 ring-2 ring-blue-600/20' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-white text-[11px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </span>
              )}

              <div>
                <h3 className="text-xl font-bold">{p.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{p.desc}</p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold">{p.price}</span>
                  <span className="text-xs text-slate-500 ml-1.5">{p.period}</span>
                </div>
                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-accent-soft shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  to="/register"
                  className={`w-full block text-center py-3 rounded-xl font-bold text-sm transition-all ${
                    p.popular
                      ? 'bg-accent hover:bg-text text-white shadow-lg shadow-subtle'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                  }`}
                >
                  {p.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
      <Footer />
    </div>
  );
}
