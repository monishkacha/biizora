import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Amexora</span>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400 max-w-sm">
              Smarter Invoicing. Better Cash Flow. Powered by AI.
              The financial operating system built specifically for Indian SMEs, agencies, freelancers, and growing businesses.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> GST Compliant & 256-Bit SSL Encrypted
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/features" className="hover:text-white transition-colors">GST Invoicing</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Expense Management</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Inventory Control</Link></li>
              <li><Link to="/ai-features" className="hover:text-white text-teal-400 font-medium transition-colors">AI Cash Flow Predictor</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Razorpay Payments</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing Plans</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog & Guides</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ & Support</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Sales</Link></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><a href="#security" className="hover:text-white transition-colors">Security Overview</a></li>
              <li><a href="#compliance" className="hover:text-white transition-colors">GST Compliance</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Amexora Technologies Private Limited. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> for Indian SMEs & Founders
          </p>
        </div>
      </div>
    </footer>
  );
}
