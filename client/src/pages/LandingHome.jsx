import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SupportTopBar from '../components/SupportTopBar';
import BusinessInMotion from '../components/BusinessInMotion';
import GrowthEngineShowcase from '../components/GrowthEngineShowcase';
import BiizoraBrandLogo from '../components/ui/BiizoraBrandLogo';
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  TrendingUp,
  Users,
  Package,
  Sparkles,
  ShieldCheck,
  Boxes,
  BarChart3,
  Zap,
  Building2,
  Headphones,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const showcaseModules = [
  {
    id: 'invoicing',
    icon: FileText,
    label: 'GST Invoicing',
    title: 'Bills that stay compliant',
    body: 'Create professional GST invoices with HSN/SAC, CGST/SGST/IGST logic, PDF export, and payment tracking — without spreadsheet chaos.',
    points: ['Auto tax split', 'Branded PDFs', 'WhatsApp & UPI ready'],
  },
  {
    id: 'cashflow',
    icon: TrendingUp,
    label: 'Cash Flow',
    title: 'Know what money is doing',
    body: 'Live receivables, expenses, and runway in one calm overview so you can act before cash gets tight.',
    points: ['Receivables pulse', 'Expense clarity', 'Health score'],
  },
  {
    id: 'customers',
    icon: Users,
    label: 'Customers',
    title: 'A real client ledger',
    body: 'Keep GSTINs, balances, and history organized. Spot overdue accounts and follow up in seconds.',
    points: ['Outstanding balances', 'GSTIN profiles', 'Payment history'],
  },
  {
    id: 'inventory',
    icon: Boxes,
    label: 'Inventory',
    title: 'Stock that stays honest',
    body: 'Products, services, stock levels, and low-stock signals tied directly to what you invoice.',
    points: ['SKU & HSN', 'Low-stock alerts', 'Service + goods'],
  },
  {
    id: 'ai',
    icon: Sparkles,
    label: 'AI Copilot',
    title: 'Ask your business anything',
    body: 'Query revenue, unpaid clients, GST rules, and growth advice in plain English or Gujarati.',
    points: ['Live data answers', 'GST guidance', 'Bilingual help'],
  },
  {
    id: 'teams',
    icon: Building2,
    label: 'Teams & Business',
    title: 'One business, one account',
    body: 'Invite teammates, assign roles, and keep every ledger cleanly isolated.',
    points: ['Role-based access', 'Activity log', 'Single business access'],
  },
];

const serviceRows = [
  {
    icon: ShieldCheck,
    title: 'Built for Indian GST from day one',
    desc: 'Intrastate and interstate tax, invoice themes, bank & UPI details on every bill — ready for real SME workflows, not generic global templates.',
  },
  {
    icon: BarChart3,
    title: 'Analytics without the noise',
    desc: 'Revenue, expenses, pending collections, and inventory health surface as clear signals so founders spend less time reconciling and more time selling.',
  },
  {
    icon: Zap,
    title: 'AI that reads your ledger',
    desc: 'Biizora AI sits on top of your live books — not a disconnected chatbot — so answers reflect actual invoices, customers, and cash position.',
  },
  {
    icon: Package,
    title: 'From quote to collection',
    desc: 'Products, invoices, expenses, and team collaboration live in one operating system. Fewer tabs. Fewer missed payments.',
  },
];

const founders = [
  {
    name: 'Monish Kacha',
    role: 'Co-founder',
    seed: 'Monish%20Kacha',
    why: 'Saw growing businesses juggling GST portals, WhatsApp reminders, and messy sheets — and wanted one calm system that actually matches how Indian teams work.',
  },
  {
    name: 'Krish Patel',
    role: 'Co-founder',
    seed: 'Krish%20Patel',
    why: 'Believed cash flow clarity should feel premium, not overwhelming. Built Biizora so founders can see money, clients, and compliance in the same breath.',
  },
];

function FeatureShowcase() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % showcaseModules.length);
    }, 4200);
    return () => clearInterval(id);
  }, []);

  const mod = showcaseModules[active];
  const Icon = mod.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
      <div className="lg:col-span-5 space-y-2">
        {showcaseModules.map((m, i) => {
          const MIcon = m.icon;
          const isOn = i === active;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setActive(i)}
              className={`w-full text-left px-4 py-3.5 rounded-[16px] border transition-all duration-[220ms] flex items-center gap-3 ${
                isOn
                  ? 'bg-white border-green-bottle/30 shadow-subtle'
                  : 'bg-transparent border-transparent hover:bg-white/70 hover:border-stone'
              }`}
            >
              <span
                className={`w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0 transition-colors duration-[220ms] ${
                  isOn ? 'bg-green-bottle text-white' : 'bg-cream text-green-bottle border border-stone'
                }`}
              >
                <MIcon className="w-4 h-4" strokeWidth={1.75} />
              </span>
              <span className={`text-sm font-medium ${isOn ? 'text-charcoal' : 'text-warm-gray'}`}>{m.label}</span>
              {isOn ? (
                <span className="ml-auto h-1 w-8 rounded-full bg-yellow-butter overflow-hidden">
                  <motion.span
                    key={m.id}
                    className="block h-full bg-green-bottle rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 4.1, ease: 'linear' }}
                  />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="lg:col-span-7 relative">
        <div className="relative h-full min-h-[320px] rounded-[24px] overflow-hidden border border-stone bg-[#1F2A26] text-white shadow-elev">
          <div
            className="absolute inset-0 opacity-[0.18]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(246,217,122,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(246,217,122,0.35) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-green-moss/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-yellow-butter/15 blur-3xl" />

          <motion.div
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-yellow-butter/70 to-transparent"
            animate={{ top: ['8%', '88%', '8%'] }}
            transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
          />

          <div className="relative z-10 p-7 sm:p-10 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-yellow-champagne/80">
                <span className="w-1.5 h-1.5 rounded-full bg-green-moss animate-pulse" />
                Live module
              </div>
              <span className="text-[11px] font-mono text-white/40">biizora / {mod.id}</span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={mod.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-5 py-8"
              >
                <div className="w-12 h-12 rounded-[14px] bg-white/10 border border-white/15 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-yellow-butter" strokeWidth={1.75} />
                </div>
                <div className="space-y-3 max-w-md">
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white">{mod.title}</h3>
                  <p className="text-sm sm:text-base text-white/65 leading-relaxed">{mod.body}</p>
                </div>
                <ul className="flex flex-wrap gap-2 pt-1">
                  {mod.points.map((p) => (
                    <li
                      key={p}
                      className="px-3 py-1.5 rounded-full text-[11px] font-medium bg-white/8 border border-white/12 text-yellow-champagne"
                    >
                      {p}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center gap-2 text-[11px] text-white/35">
              <span className="font-mono">01</span>
              <span className="h-px flex-1 bg-white/10" />
              <span>Hover or wait — modules rotate automatically</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingHome() {
  return (
    <div className="min-h-screen flex flex-col text-charcoal">
      <SupportTopBar />
      <Navbar />

      {/* Hero — brand first, quiet composition */}
      <section className="relative overflow-hidden pt-16 pb-16 sm:pt-24 sm:pb-20">
        <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-stone to-transparent" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <div className="max-w-4xl mx-auto text-center space-y-7 sm:space-y-8 flex flex-col items-center">
            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-light text-[4.5rem] leading-[0.9] tracking-[-0.04em] text-charcoal sm:text-[7rem] sm:tracking-[-0.045em] md:text-[9rem] lg:text-[11rem] lg:tracking-[-0.05em] lowercase select-none py-2 sm:py-4"
            >
              biizora
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
              className="text-base sm:text-xl font-light text-warm-gray tracking-[-0.01em]"
            >
              The AI business operating system for Indian SMEs.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16, duration: 0.45 }}
              className="text-sm sm:text-base text-warm-gray/90 leading-relaxed max-w-xl mx-auto"
            >
              Invoicing, cash flow, inventory, teams, and AI guidance — designed to feel premium and stay simple.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.45 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3.5 rounded-[16px] bg-yellow-butter hover:bg-yellow-honey text-charcoal text-sm font-semibold shadow-yellow transition-all duration-[220ms] inline-flex items-center justify-center gap-2"
              >
                Start free trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3.5 rounded-[16px] bg-white border border-stone hover:bg-cream text-charcoal text-sm font-semibold transition-all duration-[220ms] inline-flex items-center justify-center"
              >
                Explore demo account
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-warm-gray pt-1"
            >
              {['GST ready', 'Single business access', 'No credit card'].map((t) => (
                <span key={t} className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-forest" strokeWidth={1.75} /> {t}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive services showcase — replaces graph */}
      <section className="pb-24 sm:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12 sm:mb-14">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-green-bottle mb-3">What you get</p>
            <h2 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight">
              Services that run the back office
            </h2>
            <p className="mt-4 text-warm-gray text-sm sm:text-base leading-relaxed">
              Biizora is not a single tool bolted together. It is a connected workspace for billing, collections,
              stock, reporting, and AI help — so every part of your business speaks the same language.
            </p>
          </div>

          <FeatureShowcase />
        </div>
      </section>

      {/* Business in Motion — Interactive Simulation */}
      <BusinessInMotion />

      {/* Layer 3B Growth Engine & Ecosystem Loop Showcase */}
      <GrowthEngineShowcase />

      {/* Spacious feature narrative */}
      <section className="py-24 sm:py-28 border-y border-stone bg-white/55">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-16 sm:mb-20">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-green-bottle mb-3">Why Biizora</p>
            <h2 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight">
              Built for how Indian businesses actually operate
            </h2>
          </div>

          <div className="space-y-14 sm:space-y-20">
            {serviceRows.map((row, i) => {
              const Icon = row.icon;
              return (
                <motion.div
                  key={row.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45, delay: i * 0.04 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start"
                >
                  <div className="md:col-span-1">
                    <div className="w-11 h-11 rounded-[14px] bg-cream border border-stone flex items-center justify-center">
                      <Icon className="w-5 h-5 text-green-bottle" strokeWidth={1.75} />
                    </div>
                  </div>
                  <div className="md:col-span-4">
                    <h3 className="font-display text-xl sm:text-2xl font-semibold tracking-tight">{row.title}</h3>
                  </div>
                  <div className="md:col-span-7">
                    <p className="text-warm-gray text-sm sm:text-base leading-relaxed max-w-xl">{row.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Founders — room to breathe */}
      <section className="py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-14 sm:mb-16">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-green-bottle mb-3">Founders</p>
            <h2 className="font-display text-2xl sm:text-4xl font-semibold tracking-tight">
              Why we built Biizora
            </h2>
            <p className="mt-4 text-warm-gray text-sm sm:text-base leading-relaxed">
              Two builders. One frustration with fragmented finance tools. Biizora started as a bet that Indian
              founders deserve software that feels as considered as the businesses they run.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
            {founders.map((f, i) => (
              <motion.article
                key={f.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${f.seed}&backgroundColor=2f5d50&textColor=faf9f5`}
                    alt={f.name}
                    className="w-16 h-16 rounded-[18px] border border-stone bg-cream"
                  />
                  <div>
                    <h3 className="font-display text-xl font-semibold tracking-tight">{f.name}</h3>
                    <p className="text-sm text-warm-gray mt-0.5">{f.role}</p>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-warm-gray leading-relaxed border-l-2 border-yellow-butter pl-5">
                  {f.why}
                </p>
              </motion.article>
            ))}
          </div>

          <p className="mt-16 sm:mt-20 max-w-2xl text-sm sm:text-base text-charcoal/80 leading-relaxed font-light">
            We are building Biizora so creating an invoice, chasing a payment, checking stock, and asking “how is
            cash this month?” never requires five different apps again.
          </p>
        </div>
      </section>

      {/* Business Enquiries */}
      <section className="py-20 sm:py-24 border-t border-stone bg-gradient-to-b from-white via-cream/40 to-ivory">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mx-auto text-center space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-bottle/10 text-green-bottle text-xs font-semibold">
              <Headphones className="w-3.5 h-3.5" /> Business Enquiries
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-charcoal">
              Talk to Biizora
            </h2>
            <p className="text-warm-gray text-sm sm:text-base leading-relaxed">
              For subscriptions, partnerships, and product questions, email our team. Signed-in customers can access
              remote support and live assistance from the in-app Support center.
            </p>
            <a
              href="mailto:biizoraos@gmail.com"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-green-bottle text-white font-semibold text-sm hover:opacity-90 shadow-subtle"
            >
              biizoraos@gmail.com
            </a>
            <div className="pt-2">
              <Link
                to="/contact"
                className="text-sm font-medium text-green-bottle hover:underline inline-flex items-center gap-1"
              >
                Contact form <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA — pricing lives on /pricing, not here */}
      <section className="pb-24 sm:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="rounded-[28px] border border-stone bg-gradient-to-br from-white via-cream/80 to-yellow-champagne/30 px-8 py-12 sm:px-14 sm:py-16">
            <div className="max-w-xl">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight">
                Open your business in minutes
              </h2>
              <p className="mt-3 text-warm-gray text-sm sm:text-base leading-relaxed">
                Try the Manufacturing demo to see a live sample business, or start your own trial. Plans and billing
                details live on our pricing page — kept off the homepage so this story stays clear.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[16px] bg-green-bottle hover:bg-[#264A41] text-white text-sm font-semibold transition-all duration-[220ms]"
                >
                  Create your business <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center px-6 py-3.5 rounded-[16px] bg-white border border-stone hover:bg-cream text-charcoal text-sm font-semibold transition-all duration-[220ms]"
                >
                  View pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
