import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, DollarSign, MessageSquare, ShieldCheck, FileCheck, ArrowRight, Bot } from 'lucide-react';

export default function AIFeaturesPage() {
  const aiSuite = [
    { title: "AI Business Advisor", desc: "Diagnostic recommendations analyzing your margins, costs, and pricing strategies in real time.", icon: Sparkles },
    { title: "AI Cash Flow Predictor", desc: "Forecast 7-day, 30-day, and 90-day cash positions with confidence scores to prevent working capital shortfalls.", icon: TrendingUp },
    { title: "AI Expense Analyzer", desc: "Identifies wasteful spending, duplicate software subscriptions, and cost-optimization opportunities.", icon: DollarSign },
    { title: "AI Invoice Reminder Generator", desc: "Crafts custom, polite or firm payment reminders for WhatsApp, SMS, and Email tailored to payment delay.", icon: MessageSquare },
    { title: "AI Financial Health Score", desc: "Calculates an executive score out of 100 assessing liquidity, solvency, growth, and payment risks.", icon: ShieldCheck },
    { title: "AI Monthly Executive Summary", desc: "Generates a structured narrative executive summary of monthly revenue, profit, loss, and top client trends.", icon: FileCheck },
    { title: "AI Floating Assistant", desc: "Always-available floating chat assistant on every page answering live questions on your business data.", icon: Bot }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 text-xs font-bold rounded-full">
            <Sparkles className="w-4 h-4 text-accent-soft" /> Biizora Intelligence Engine
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">The 7 AI Pillars of Biizora</h1>
          <p className="text-slate-600 dark:text-slate-400">Put your financial accounting on autopilot with OpenAI-powered models fine-tuned for Indian SMEs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aiSuite.map((ai, i) => {
            const Icon = ai.icon;
            return (
              <div key={i} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 hover:border-teal-500 transition-all">
                <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950 text-accent-soft dark:text-text-muted flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">{ai.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{ai.desc}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 p-8 bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-[20px] text-center space-y-4">
          <h2 className="text-2xl font-bold">Experience AI-Driven Financial Freedom</h2>
          <Link to="/app/ai-suite" className="inline-flex items-center gap-2 px-6 py-3 bg-accent-soft text-slate-900 font-bold rounded-xl shadow-lg hover:bg-accent">
            <span>Launch Live AI Workspace</span> <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
