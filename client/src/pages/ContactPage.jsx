import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, MapPin, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-16 flex-1 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-xs font-bold text-accent uppercase tracking-widest">Get In Touch</span>
          <h1 className="text-4xl font-extrabold">We'd Love to Hear From You</h1>
          <p className="text-slate-600 dark:text-slate-400">Questions about enterprise plans, GST customization, or API access? Reach out!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Contact Details</h3>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <Mail className="w-5 h-5 text-accent shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Business Enquiries</p>
                  <a href="mailto:biizora@gmail.com" className="text-xs hover:underline">
                    biizora@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <MapPin className="w-5 h-5 text-indigo-500 shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Customer Support</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Phone and remote assistance are available inside the signed-in dashboard Support center.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-card">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-accent-soft mx-auto" />
                <h3 className="text-xl font-bold">Message Sent!</h3>
                <p className="text-xs text-slate-500">Our financial solutions team will reply within 2 business hours.</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                <h3 className="text-xl font-bold mb-4">Send a Message</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Full Name</label>
                  <input required type="text" placeholder="e.g. Rahul Sharma" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:shadow-focus" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Business Email</label>
                  <input required type="email" placeholder="rahul@company.com" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:shadow-focus" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">How can we help?</label>
                  <textarea required rows={4} placeholder="Tell us about your business billing needs..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:shadow-focus" />
                </div>

                <button type="submit" className="w-full py-3 bg-accent hover:bg-text text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
