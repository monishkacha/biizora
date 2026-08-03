import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  Sparkles,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  FileText,
  CreditCard,
  ShieldCheck,
  Zap,
  Users,
  BarChart3,
  ChevronRight,
  Star,
  DollarSign
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingHome() {
  const navigate = useNavigate();
  const [calcMonthlyRev, setCalcMonthlyRev] = useState(500000);
  const [calcAvgDelay, setCalcAvgDelay] = useState(25);

  // Instant calculation widget
  const potentialSavings = Math.round((calcMonthlyRev * 0.08)); // 8% saved in faster liquidity & reduced leakage
  const daysReduced = Math.max(5, calcAvgDelay - 18);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Glowing backdrop elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill Tag */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Next-Gen AI Financial Operating System for Indian Businesses</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]"
            >
              Smarter Invoicing.{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 bg-clip-text text-transparent">
                Better Cash Flow.
              </span>{' '}
              Powered by AI.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed font-normal"
            >
              Create GST-compliant invoices in seconds, predict cash flow 90 days out, automate payment follow-ups, and eliminate accounting headaches—built for Indian SMEs, agencies & freelancers.
            </motion.p>

            {/* Hero CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-base shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <span>Start 14-Day Free Trial</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/app"
                className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Explore Live Workspace</span>
                <Sparkles className="w-4 h-4 text-teal-500" />
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400 pt-2"
            >
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> No Credit Card Required</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> 100% GST & UPI Compliant</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Razorpay Integrated</span>
            </motion.div>
          </div>

          {/* Hero Dashboard Preview Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-12 lg:mt-16 rounded-3xl p-3 sm:p-4 bg-gradient-to-b from-slate-200/80 to-slate-300/40 dark:from-slate-800/80 dark:to-slate-900/40 border border-slate-300/80 dark:border-slate-700/80 shadow-2xl backdrop-blur-md"
          >
            <div className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
              {/* Window Controls Bar */}
              <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-xs font-mono text-slate-400 ml-2">amexora.app/workspace/demo</span>
                </div>
                <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> AI Health Score: 92/100
                </div>
              </div>

              {/* Mock Dashboard Hero Snapshot */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50/60 dark:bg-slate-950/60">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-xs text-slate-400 font-medium">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">₹4,85,000</p>
                  <span className="text-[10px] text-emerald-500 font-semibold">↑ +18.4% vs last month</span>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-xs text-slate-400 font-medium">Pending Invoices</p>
                  <p className="text-2xl font-bold text-amber-500 mt-1">₹1,09,250</p>
                  <span className="text-[10px] text-amber-600 font-semibold">2 overdue invoices</span>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <p className="text-xs text-slate-400 font-medium">Predicted Cash (30d)</p>
                  <p className="text-2xl font-bold text-teal-500 mt-1">₹6,40,000</p>
                  <span className="text-[10px] text-teal-600 font-semibold">AI Confidence: 94%</span>
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow-md">
                  <p className="text-xs opacity-90 font-medium">AI Smart Action</p>
                  <p className="text-xs font-semibold mt-1">Send WhatsApp reminder to Nova Retail for ₹94.9k</p>
                  <button onClick={() => navigate('/app')} className="mt-2 text-xs px-3 py-1 bg-white text-blue-700 font-bold rounded-lg hover:bg-blue-50">
                    Execute Action ⚡
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Customer Logos Bar */}
      <section className="py-8 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">
            Trusted by 5,000+ Indian Businesses, Freelancers & Agencies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
            <span className="text-lg font-bold tracking-tighter text-slate-700 dark:text-slate-300">APEX GLOBAL</span>
            <span className="text-lg font-bold tracking-wider text-slate-700 dark:text-slate-300">ZENITH MEDIA</span>
            <span className="text-lg font-bold tracking-tight text-slate-700 dark:text-slate-300">NOVA RETAIL</span>
            <span className="text-lg font-bold tracking-widest text-slate-700 dark:text-slate-300">KAVERI ENG</span>
            <span className="text-lg font-bold tracking-tighter text-slate-700 dark:text-slate-300">INNOVATE TECH</span>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Everything You Need</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Built to Compete with Global Standards. Designed for India.
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Stop juggling spreadsheet templates, manual WhatsApp texts, and slow GST tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card hover:border-blue-500 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">GST Invoice Generator</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Auto-calculate CGST, SGST, IGST. Print PDF, share via WhatsApp, auto-attach UPI QR codes, and generate Razorpay payment links.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card hover:border-teal-500 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">AI Cash Flow Predictor</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                OpenAI-powered algorithms forecast your cash balance for 7, 30, and 90 days out so you never get surprised by working capital shortages.
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card hover:border-indigo-500 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Expense & Receipt Tracking</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload receipts, track claimable GST ITC, monitor office & salary costs, and generate monthly P&L statements effortlessly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Interactive ROI Calculator */}
      <section className="py-16 bg-gradient-to-br from-slate-900 to-blue-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-4">
              <span className="text-xs font-bold text-teal-400 uppercase tracking-widest">Interactive Calculator</span>
              <h2 className="text-3xl font-extrabold">Calculate How Much Cash Amexora Will Unlock</h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                By accelerating customer collections with AI automated WhatsApp reminders and preventing inventory leakage, Amexora delivers immediate ROI.
              </p>
              
              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Monthly Business Billing (₹)</span>
                    <span className="text-teal-400 font-bold">₹{calcMonthlyRev.toLocaleString('en-IN')}</span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="5000000"
                    step="50000"
                    value={calcMonthlyRev}
                    onChange={(e) => setCalcMonthlyRev(Number(e.target.value))}
                    className="w-full accent-teal-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Current Average Payment Delay (Days)</span>
                    <span className="text-teal-400 font-bold">{calcAvgDelay} Days</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="1"
                    value={calcAvgDelay}
                    onChange={(e) => setCalcAvgDelay(Number(e.target.value))}
                    className="w-full accent-teal-400"
                  />
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-800/80 rounded-3xl border border-slate-700 shadow-2xl text-center space-y-6">
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Estimated Annual Liquidity Unlocked</p>
                <p className="text-4xl font-extrabold text-teal-400 mt-2">₹{(potentialSavings * 12).toLocaleString('en-IN')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                <div>
                  <p className="text-xs text-slate-400">Payment Cycle Reduction</p>
                  <p className="text-xl font-bold text-white mt-1">-{daysReduced} Days Faster</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Estimated ROI</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">32x Plan Cost</p>
                </div>
              </div>

              <Link
                to="/register"
                className="w-full block py-3 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl shadow-lg transition-all"
              >
                Claim Your Free Trial Now
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Ready to Take Control of Your Cash Flow?
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            Join thousands of Indian businesses generating professional GST invoices, tracking expenses, and predicting revenue with Amexora AI.
          </p>
          <div className="pt-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 rounded-2xl font-bold text-lg shadow-2xl transition-all"
            >
              <span>Get Started Free for 14 Days</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
