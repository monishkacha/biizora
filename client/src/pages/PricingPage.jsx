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
    <div className="min-h-screen bg-cream/30 text-charcoal flex flex-col font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <span className="text-xs font-bold text-green-bottle uppercase tracking-widest bg-green-bottle/10 px-3 py-1 rounded-full border border-green-bottle/20">
            Transparent Subscription Plans
          </span>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-charcoal tracking-tight">Simple Plans for Every Stage of Growth</h1>
          <p className="text-warm-gray text-sm">All plans include a 14-day free trial. Cancel anytime with zero commitment.</p>
          
          {/* Annual vs Monthly Switch */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-sm font-semibold ${!annualBilling ? 'text-charcoal' : 'text-warm-gray'}`}>Monthly</span>
            <button
              onClick={() => setAnnualBilling(!annualBilling)}
              className="w-12 h-6 bg-green-bottle rounded-full p-1 transition-colors relative"
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${annualBilling ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm font-semibold ${annualBilling ? 'text-charcoal' : 'text-warm-gray'}`}>
              Annual <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((p, i) => (
            <div
              key={i}
              className={`p-6 rounded-[22px] bg-white border flex flex-col justify-between relative shadow-card transition-all hover:shadow-md ${
                p.popular ? 'border-green-bottle ring-2 ring-green-bottle/20' : 'border-stone'
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-green-bottle text-white text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1 shadow-subtle">
                  <Sparkles className="w-3 h-3" /> Most Popular
                </span>
              )}

              <div>
                <h3 className="text-xl font-bold font-display text-charcoal">{p.name}</h3>
                <p className="text-xs text-warm-gray mt-1">{p.desc}</p>
                <div className="my-6">
                  <span className="text-3xl sm:text-4xl font-extrabold text-charcoal font-display">{p.price}</span>
                  <span className="text-xs text-warm-gray ml-1.5">{p.period}</span>
                </div>
                <ul className="space-y-3 text-xs text-charcoal font-medium">
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-bottle shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Link
                  to="/register"
                  className={`w-full block text-center py-3 rounded-xl font-bold text-xs transition-all ${
                    p.popular
                      ? 'bg-green-bottle hover:bg-green-forest text-white shadow-subtle'
                      : 'bg-cream border border-stone hover:bg-stone/20 text-charcoal'
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
