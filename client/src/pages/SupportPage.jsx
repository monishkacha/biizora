import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SupportTopBar, { WhatsAppIcon, AnyDeskIcon } from '../components/SupportTopBar';
import {
  Phone,
  Monitor,
  Copy,
  Check,
  Headphones,
  Send,
  MessageSquare,
  Clock,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Download,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function SupportPage() {
  const location = useLocation();
  const isWorkspace = location.pathname.startsWith('/app');

  const [copiedId, setCopiedId] = useState(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    anydeskId: '',
    issueType: 'Technical Support & Remote Assistance',
    message: '',
  });

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  const content = (
    <div className="space-y-12 pb-16">
      {/* Hero Header Banner */}
      <div className="relative rounded-[28px] overflow-hidden bg-gradient-to-br from-[#1F2A26] via-[#2F5D50] to-[#1F2A26] text-white p-8 sm:p-12 shadow-elev border border-white/10">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(246,217,122,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(246,217,122,0.4) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-yellow-butter/15 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-yellow-butter text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
            Live Customer Support & Remote Engineering
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-semibold tracking-tight text-white">
            Customer Support & Remote Help Center
          </h1>

          <p className="text-white/80 text-base sm:text-lg leading-relaxed max-w-2xl font-light">
              Need immediate help setting up GST, solving an invoice discrepancy, or configuring your business?
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-yellow-butter" /> Mon – Sat: 9:00 AM – 8:00 PM IST
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-yellow-butter" /> 100% Secure Remote Assistance
            </span>
          </div>
        </div>
      </div>

      {/* Main Support Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Card 1: Direct Phone & WhatsApp Support */}
        <div className="bg-white rounded-[24px] border border-stone p-7 sm:p-8 shadow-card flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-[16px] bg-[#25D366]/10 text-[#25D366] flex items-center justify-center border border-[#25D366]/20">
              <WhatsAppIcon className="w-6 h-6" />
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-charcoal">Call & WhatsApp Support</h2>
              <p className="text-warm-gray text-sm mt-1 leading-relaxed">
                Connect instantly with our support team via direct phone line or WhatsApp message for quick questions and onboarding help.
              </p>
            </div>

            {/* Numbers List */}
            <div className="space-y-3 pt-2">
              {/* Number 1 */}
              <div className="p-4 rounded-[18px] bg-cream/70 border border-stone flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[12px] bg-white border border-stone flex items-center justify-center text-green-bottle shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray block">Support Line 1</span>
                    <strong className="text-charcoal font-mono text-base">+91 9904914513</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="tel:+919904914513"
                    className="p-2.5 rounded-[12px] bg-white border border-stone hover:bg-ivory text-charcoal transition-colors"
                    title="Call +91 9904914513"
                  >
                    <Phone className="w-4 h-4 text-green-bottle" />
                  </a>
                  <a
                    href="https://wa.me/919904914513"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
              </div>

              {/* Number 2 */}
              <div className="p-4 rounded-[18px] bg-cream/70 border border-stone flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[12px] bg-white border border-stone flex items-center justify-center text-green-bottle shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray block">Support Line 2</span>
                    <strong className="text-charcoal font-mono text-base">+91 9081051240</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="tel:+919081051240"
                    className="p-2.5 rounded-[12px] bg-white border border-stone hover:bg-ivory text-charcoal transition-colors"
                    title="Call +91 9081051240"
                  >
                    <Phone className="w-4 h-4 text-green-bottle" />
                  </a>
                  <a
                    href="https://wa.me/919081051240"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    <WhatsAppIcon className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-[16px] bg-green-bottle/5 border border-green-bottle/15 flex items-center gap-3 text-xs text-green-bottle">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-bottle" />
            <span>Average response time: <strong>under 5 minutes</strong> during working hours.</span>
          </div>
        </div>

        {/* Card 2: AnyDesk Remote Assistance */}
        <div className="bg-white rounded-[24px] border border-stone p-7 sm:p-8 shadow-card flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-[16px] bg-terracotta/10 text-terracotta flex items-center justify-center border border-terracotta/20">
              <Monitor className="w-6 h-6" />
            </div>

            <div>
              <h2 className="font-display text-2xl font-semibold text-charcoal">AnyDesk Remote Troubleshooting</h2>
              <p className="text-warm-gray text-sm mt-1 leading-relaxed">
                Allow our support engineers to securely connect to your PC remotely and solve complex issues live right on your screen.
              </p>
            </div>

            {/* AnyDesk Desk IDs */}
            <div className="space-y-3 pt-2">
              {/* ID 1 */}
              <div className="p-4 rounded-[18px] bg-cream/70 border border-stone flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray block">AnyDesk Support Desk 1</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <strong className="text-charcoal font-mono text-lg tracking-wider">1452019780</strong>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-bottle/10 text-green-bottle">Active</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard('1452019780', 'anydesk1')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-[12px] bg-white border border-stone hover:bg-ivory text-charcoal text-xs font-semibold transition-all shadow-subtle"
                >
                  {copiedId === 'anydesk1' ? (
                    <>
                      <Check className="w-4 h-4 text-green-forest" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-warm-gray" /> Copy ID
                    </>
                  )}
                </button>
              </div>

              {/* ID 2 */}
              <div className="p-4 rounded-[18px] bg-cream/70 border border-stone flex items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-warm-gray block">AnyDesk Support Desk 2</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <strong className="text-charcoal font-mono text-lg tracking-wider">1439051108</strong>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-bottle/10 text-green-bottle">Active</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyToClipboard('1439051108', 'anydesk2')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-[12px] bg-white border border-stone hover:bg-ivory text-charcoal text-xs font-semibold transition-all shadow-subtle"
                >
                  {copiedId === 'anydesk2' ? (
                    <>
                      <Check className="w-4 h-4 text-green-forest" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-warm-gray" /> Copy ID
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-[16px] bg-yellow-champagne/40 border border-yellow-butter/60 flex items-center justify-between gap-3">
            <span className="text-xs text-charcoal/80 font-medium">Don&apos;t have AnyDesk installed yet?</span>
            <a
              href="https://anydesk.com/en/downloads"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-green-bottle hover:underline shrink-0"
            >
              Download AnyDesk <Download className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* How AnyDesk Remote Assistance Works */}
      <div className="bg-white rounded-[24px] border border-stone p-7 sm:p-10 shadow-card space-y-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-green-bottle mb-1">Step by Step Guide</p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-charcoal">
            How AnyDesk Remote Resolution Works
          </h2>
          <p className="text-warm-gray text-sm mt-2 leading-relaxed">
            Follow these 3 simple steps to let our engineers solve your problem live on your system safely.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-[20px] bg-cream/50 border border-stone space-y-3 relative">
            <span className="w-8 h-8 rounded-[10px] bg-green-bottle text-white font-mono text-sm font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="font-semibold text-charcoal text-base">Download AnyDesk</h3>
            <p className="text-xs text-warm-gray leading-relaxed">
              Download the free AnyDesk application for Windows or Mac from official website <strong>anydesk.com</strong> and run it.
            </p>
          </div>

          <div className="p-6 rounded-[20px] bg-cream/50 border border-stone space-y-3 relative">
            <span className="w-8 h-8 rounded-[10px] bg-green-bottle text-white font-mono text-sm font-bold flex items-center justify-center">
              2
            </span>
            <h3 className="font-semibold text-charcoal text-base">Share Desk ID or Connect</h3>
            <p className="text-xs text-warm-gray leading-relaxed">
              Share your AnyDesk 9-digit ID with our support agent on WhatsApp, or connect to our official support Desk IDs: <strong>1452019780</strong> or <strong>1439051108</strong>.
            </p>
          </div>

          <div className="p-6 rounded-[20px] bg-cream/50 border border-stone space-y-3 relative">
            <span className="w-8 h-8 rounded-[10px] bg-green-bottle text-white font-mono text-sm font-bold flex items-center justify-center">
              3
            </span>
            <h3 className="font-semibold text-charcoal text-base">Accept Remote Session</h3>
            <p className="text-xs text-warm-gray leading-relaxed">
              Click &lsquo;Accept&rsquo; on the AnyDesk prompt. Our support engineer will inspect your screen, fix any GST or invoice issue, and assist you in real time.
            </p>
          </div>
        </div>
      </div>

      {/* Instant Support Request Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-white rounded-[24px] border border-stone p-7 sm:p-10 shadow-card">
          {formSubmitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-green-bottle/10 text-green-bottle flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-charcoal">Support Request Submitted!</h3>
              <p className="text-warm-gray text-sm max-w-md mx-auto leading-relaxed">
                Thank you! Our support engineers have received your request. We will reach out to you via call or WhatsApp shortly.
              </p>
              <button
                type="button"
                onClick={() => setFormSubmitted(false)}
                className="mt-4 px-6 py-2.5 rounded-[14px] bg-green-bottle hover:bg-[#264A41] text-white text-xs font-semibold"
              >
                Submit another query
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="font-display text-2xl font-semibold text-charcoal">Request Remote Assistance or Support</h2>
                <p className="text-xs text-warm-gray mt-1">
                  Fill in your details below and our team will get in touch immediately.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">Your Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-ivory border border-stone rounded-[14px] text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-green-bottle/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">Phone / WhatsApp Number</label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-ivory border border-stone rounded-[14px] text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-green-bottle/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">Email Address</label>
                  <input
                    required
                    type="email"
                    placeholder="rahul@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-ivory border border-stone rounded-[14px] text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-green-bottle/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal mb-1.5">AnyDesk Desk ID (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 1452019780"
                    value={formData.anydeskId}
                    onChange={(e) => setFormData({ ...formData, anydeskId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-ivory border border-stone rounded-[14px] text-xs font-mono text-charcoal focus:outline-none focus:ring-2 focus:ring-green-bottle/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1.5">Describe your issue or request</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Tell us what you need help with (e.g., GST rate setup, invoice PDF generation, remote AnyDesk session...)"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-ivory border border-stone rounded-[14px] text-xs text-charcoal focus:outline-none focus:ring-2 focus:ring-green-bottle/20"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-yellow-butter hover:bg-yellow-honey text-charcoal font-semibold text-xs rounded-[14px] shadow-yellow transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Submit Support Request
              </button>
            </form>
          )}
        </div>

        {/* Support Info Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-[24px] border border-stone p-6 shadow-card space-y-4">
            <h3 className="font-display text-lg font-semibold text-charcoal flex items-center gap-2">
              <Headphones className="w-5 h-5 text-green-bottle" /> Contact Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 bg-ivory rounded-[14px] border border-stone">
                <WhatsAppIcon className="w-4 h-4 text-[#25D366] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-charcoal">WhatsApp & Phone Lines</p>
                  <p className="font-mono text-warm-gray mt-0.5">+91 9904914513</p>
                  <p className="font-mono text-warm-gray">+91 9081051240</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-ivory rounded-[14px] border border-stone">
                <Monitor className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-charcoal">AnyDesk Desk IDs</p>
                  <p className="font-mono text-warm-gray mt-0.5">Desk 1: 1452019780</p>
                  <p className="font-mono text-warm-gray">Desk 2: 1439051108</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-ivory rounded-[14px] border border-stone">
                <Clock className="w-4 h-4 text-green-bottle shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-charcoal">Operating Hours</p>
                  <p className="text-warm-gray mt-0.5">Monday – Saturday</p>
                  <p className="text-warm-gray">9:00 AM to 8:00 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cream to-yellow-champagne/40 rounded-[24px] border border-stone p-6 shadow-card space-y-3">
            <div className="flex items-center gap-2 text-green-bottle text-xs font-semibold">
              <Sparkles className="w-4 h-4" /> Need Immediate Assistance?
            </div>
            <p className="text-xs text-warm-gray leading-relaxed">
              If your invoice or GST filing is urgent, message us directly on WhatsApp for priority support.
            </p>
            <a
              href="https://wa.me/919904914513"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-[12px] bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold shadow-sm transition-all"
            >
              <WhatsAppIcon className="w-4 h-4" /> Priority WhatsApp Chat
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  const publicContent = (
    <div className="space-y-10 pb-16 max-w-2xl mx-auto text-center">
      <div className="rounded-[28px] bg-gradient-to-br from-[#1F2A26] via-[#2F5D50] to-[#1F2A26] text-white p-10 shadow-elev">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight">Business Enquiries</h1>
        <p className="mt-3 text-white/80 text-sm sm:text-base leading-relaxed font-light">
          For subscriptions, partnerships, and product questions, email our team. Live phone and remote support are
          available after you sign in to your Biizora account.
        </p>
        <a
          href="mailto:biizora@gmail.com"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-yellow-butter text-charcoal font-semibold text-sm hover:bg-yellow-honey"
        >
          biizora@gmail.com
        </a>
      </div>
      <p className="text-sm text-warm-gray">
        Already a customer?{' '}
        <a href="/login" className="text-green-bottle font-medium hover:underline">
          Sign in
        </a>{' '}
        to open the Support center.
      </p>
    </div>
  );

  if (isWorkspace) {
    return content;
  }

  return (
    <div className="min-h-screen bg-ivory text-charcoal flex flex-col font-sans">
      <SupportTopBar />
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {publicContent}
      </main>
      <Footer />
    </div>
  );
}
