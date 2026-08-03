import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, Clock, Calendar } from 'lucide-react';

export default function BlogPage() {
  const posts = [
    { title: "How Indian SMEs Can Reduce Invoice Payment Delays by 45%", category: "Cash Flow", date: "August 1, 2026", readTime: "5 min read", excerpt: "Learn how automated WhatsApp reminders and UPI QR codes on invoices dramatically speed up client payments." },
    { title: "Understanding GST Input Tax Credit (ITC) for Agency Owners", category: "GST & Tax", date: "July 28, 2026", readTime: "7 min read", excerpt: "A step-by-step guide to claiming maximum ITC on cloud hosting, office rent, and software subscriptions." },
    { title: "Predicting Cash Flow: Why 90-Day Forecasting Matters in 2026", category: "AI & Finance", date: "July 15, 2026", readTime: "6 min read", excerpt: "How AI predictive models outperform traditional static balance sheets for working capital management." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-16 flex-1 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-bold text-accent uppercase tracking-widest">Insights & Guides</span>
          <h1 className="text-4xl font-extrabold">Biizora Financial Blog</h1>
          <p className="text-slate-600 dark:text-slate-400">Actionable advice on GST compliance, cash flow optimization, and AI automation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map((post, i) => (
            <article key={i} className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:border-blue-500 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="px-2 py-0.5 bg-bg-secondary dark:bg-bg-secondary text-accent dark:text-blue-300 font-semibold rounded">{post.category}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
                </div>
                <h3 className="font-bold text-lg leading-snug">{post.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{post.excerpt}</p>
              </div>
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-accent">
                <span>Read Full Guide</span> <ArrowRight className="w-4 h-4" />
              </div>
            </article>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}
