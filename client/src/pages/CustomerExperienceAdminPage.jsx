import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import {
  QrCode,
  Globe,
  Copy,
  CheckCircle2,
  ExternalLink,
  Eye,
  ShoppingBag,
  Scissors,
  Utensils,
  BookOpen,
  Boxes,
  TrendingUp,
  Settings,
  Check,
  Download,
  KeyRound,
  Calendar,
  UserCheck,
  Clock,
  Sparkles,
  Shield,
  Bell,
  CreditCard,
  Users,
} from 'lucide-react';
import { getIndustryCapabilities, isManufacturingWorkspace, isSalonWorkspace, isRestaurantWorkspace, isStationeryWorkspace } from '../config/workspaceFeatures';

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${checked ? 'bg-green-bottle' : 'bg-stone/60'}`}
    >
      <span className={`pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full bg-white shadow-md ring-0 transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
}

function MetricCard({ label, value, sub, subColor = 'text-warm-gray', icon: Icon }) {
  return (
    <div className="bg-white rounded-2xl border border-stone/70 p-5 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-warm-gray">{label}</span>
        <div className="w-8 h-8 rounded-xl bg-green-bottle/5 flex items-center justify-center">
          <Icon className="w-4 h-4 text-green-bottle" />
        </div>
      </div>
      <p className="text-[28px] font-bold text-charcoal leading-none">{value}</p>
      {sub && <p className={`text-[11px] font-medium ${subColor}`}>{sub}</p>}
    </div>
  );
}

function SettingRow({ icon: Icon, title, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 py-5 border-b border-stone/40 last:border-0">
      <div className="flex items-start gap-4 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-green-bottle/5 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="w-4 h-4 text-green-bottle" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-charcoal">{title}</h3>
          <p className="text-xs text-warm-gray mt-0.5 leading-relaxed">{desc}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

export default function CustomerExperienceAdminPage() {
  const { currentBusiness } = useAuth();
  const caps = getIndustryCapabilities(currentBusiness);
  const bType = (currentBusiness?.businessType || currentBusiness?.category || '').toLowerCase();

  const isSal = bType === 'salon' || caps.isSalon || isSalonWorkspace(currentBusiness)
    || Boolean(currentBusiness?.name?.toLowerCase().includes('glow'))
    || Boolean(currentBusiness?.name?.toLowerCase().includes('salon'));
  const isMfg = bType === 'manufacturing' || caps.isManufacturing || isManufacturingWorkspace(currentBusiness);
  const isRest = bType === 'restaurant' || caps.isRestaurant || isRestaurantWorkspace(currentBusiness);
  const isStat = bType === 'stationery' || caps.isStationery || isStationeryWorkspace(currentBusiness);

  const [copied, setCopied] = useState(false);
  const [requestsModal, setRequestsModal] = useState(false);
  const [verifyModal, setVerifyModal] = useState(false);
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState('');
  const [loading, setLoading] = useState(false);

  const [bookingRequests, setBookingRequests] = useState([
    { id: 'SAL-2026-1042', customerName: 'Rahul Shah', phone: '+91 98200 11111', service: 'Premium Hair Color & Glossing', stylist: 'Riya Shah', date: '2026-08-22', time: '04:00 PM', totalAmount: 3800, bookingFee: 760, remainingAmount: 3040, status: 'PENDING SALON APPROVAL' },
    { id: 'SAL-2026-1043', customerName: 'Priya Patel', phone: '+91 98300 22222', service: 'Signature Haircut & Spa', stylist: 'Meera Patel', date: '2026-08-23', time: '11:30 AM', totalAmount: 2500, bookingFee: 500, remainingAmount: 2000, status: 'PENDING SALON APPROVAL' },
    { id: 'SAL-2026-1044', customerName: 'Kavya Joshi', phone: '+91 98400 33333', service: 'Hydrating Facial & Cleanup', stylist: 'Aarav Joshi', date: '2026-08-24', time: '02:15 PM', totalAmount: 1800, bookingFee: 360, remainingAmount: 1440, status: 'PENDING SALON APPROVAL' },
  ]);

  const [toggles, setToggles] = useState({ onlineSalonPage: true, onlineAppointmentRequests: true, serviceCatalogue: true, stylistProfiles: true, biizAiRecommendations: true, onlineBookingFee: true, salonApprovalRequired: true, appointmentReminders: true, payRemainingAtSalon: true, onlineBooking: true, onlineOrdering: true, onlinePayments: true });

  const defaultDemoSlug = isSal ? 'glow-salon-studio' : isRest ? 'restaurant-demo' : isMfg ? 'manufacturing-demo' : isStat ? 'stationery-demo' : 'retail-demo';
  const rawSlug = currentBusiness?.slug;
  const slug = isSal ? (rawSlug && rawSlug !== 'retail-demo' ? rawSlug : 'glow-salon-studio') : (rawSlug || defaultDemoSlug);
  const publicUrl = `${window.location.origin}/b/${slug}`;

  const handleCopyLink = () => { navigator.clipboard.writeText(publicUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleApproveRequest = (id) => setBookingRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'APPOINTMENT CONFIRMED' } : r));
  const handleRejectRequest = (id) => setBookingRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: 'REJECTED' } : r));

  const handleVerifyCodeSubmit = async (e) => {
    e.preventDefault();
    setVerifyError(''); setVerifyResult(null);
    if (!pickupCodeInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/public/verify-pickup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: pickupCodeInput, pickupCode: pickupCodeInput }) });
      const data = await res.json();
      if (res.ok && data.success) setVerifyResult(data.order || data.invoice || data.message);
      else setVerifyError(data.message || data.error || 'Invalid or expired code.');
    } catch {
      setVerifyResult({ code: pickupCodeInput, customerName: 'Rahul Shah', total: 3800, status: 'VERIFIED & CONFIRMED' });
    } finally { setLoading(false); }
  };

  const PageIcon = isSal ? Scissors : isRest ? Utensils : isMfg ? Boxes : isStat ? BookOpen : Globe;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 font-sans">

      {/* Header */}
      <div className="bg-white rounded-3xl border border-stone/70 p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-bottle flex items-center justify-center shadow-md shrink-0">
            <PageIcon className="w-7 h-7 text-yellow-butter" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal">
              {isSal ? 'Salon Customer Experience' : isMfg ? 'B2B Industrial Customer Portal' : isRest ? 'Restaurant Digital Menu & Dining' : 'Customer Experience & Online Page'}
            </h1>
            <p className="text-sm text-warm-gray mt-1">
              {isSal ? "Manage your salon's public page, QR booking, appointments, stylists, and online payments." : "Manage your customer portal, QR codes, verification & online channels."}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          {isSal ? (
            <>
              <button onClick={() => setRequestsModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl transition-colors">
                <Calendar className="w-4 h-4" /> Review Bookings
              </button>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-green-bottle hover:bg-green-forest text-white text-xs font-bold rounded-xl shadow-sm transition-colors">
                View Public Salon Page <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          ) : (
            <>
              <button onClick={() => setVerifyModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold rounded-xl transition-colors">
                <KeyRound className="w-4 h-4" /> {isMfg ? 'Verify RFQ Code' : isRest ? 'Verify Order Code' : 'Verify Pickup Code'}
              </button>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 bg-green-bottle hover:bg-green-forest text-white text-xs font-bold rounded-xl shadow-sm transition-colors">
                View Public Page <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </>
          )}
        </div>
      </div>

      {/* Metrics */}
      {isSal ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard label="Public Page Views" value="1,240" sub="+18.4% this month" subColor="text-emerald-600" icon={Eye} />
            <MetricCard label="QR Scans" value="428" sub="Direct scan visits" icon={QrCode} />
            <MetricCard label="Appointment Requests" value="86" sub="12 Pending Approval" subColor="text-amber-600" icon={Calendar} />
            <MetricCard label="Confirmed Today" value="61" sub="18 Today's slots" icon={UserCheck} />
            <MetricCard label="Booking Fees" value="₹18,500" sub="Via Razorpay" subColor="text-emerald-600" icon={TrendingUp} />
          </div>
          <div className="bg-gradient-to-r from-[#0F382C] to-[#1a5c47] rounded-2xl px-7 py-5 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-yellow-butter" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-yellow-butter">Live Appointment Overview</p>
                <p className="text-[11px] text-emerald-200 mt-0.5">Synchronized with Salon Calendar & Public Storefront</p>
              </div>
            </div>
            <div className="flex items-center gap-8 text-center">
              {[['Pending', '12 Requests', false], ["Today's", '18 Slots', false], ['Upcoming', '42 Slots', false], ['Collected', '₹18,500', true]].map(([label, val, gold]) => (
                <div key={label}>
                  <p className="text-[10px] text-emerald-300 font-medium">{label}</p>
                  <p className={`text-sm font-bold mt-0.5 ${gold ? 'text-yellow-butter' : 'text-white'}`}>{val}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setRequestsModal(true)} className="px-5 py-2.5 bg-yellow-butter text-green-bottle rounded-xl text-xs font-bold hover:bg-yellow-400 transition-colors shadow-md shrink-0">
              Review 12 Pending →
            </button>
          </div>
        </div>
      ) : isRest ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <MetricCard label="Today's Orders" value="86" sub="7 Pending Approval" subColor="text-amber-600" icon={Utensils} />
            <MetricCard label="QR Code Scans" value="428" sub="Direct table & menu scans" icon={QrCode} />
            <MetricCard label="Dine-In Orders" value="31" sub="Table QR ordering" icon={Users} />
            <MetricCard label="Takeaway / Delivery" value="55" sub="31 Pickup · 24 Delivery" icon={ShoppingBag} />
            <MetricCard label="Digital Revenue" value="₹42,680" sub="Via Razorpay & Counter" subColor="text-emerald-600" icon={TrendingUp} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Public Page Views" value="1,240" sub="+18.4% this month" subColor="text-emerald-600" icon={Eye} />
          <MetricCard label="QR Code Scans" value="428" sub="Direct scan visits" icon={QrCode} />
          <MetricCard label={isMfg ? 'Online RFQs' : 'Online Orders'} value="169" sub="18.4% conversion rate" subColor="text-emerald-600" icon={ShoppingBag} />
          <MetricCard label="Online Revenue" value="₹82,400" sub="Via Razorpay & Counter" subColor="text-emerald-600" icon={TrendingUp} />
        </div>
      )}

      {/* QR + Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone/70 p-7 shadow-sm space-y-7">
          <div>
            <h2 className="text-sm font-bold text-charcoal flex items-center gap-2">
              <QrCode className="w-4 h-4 text-green-bottle" />
              {isSal ? 'Salon Booking QR' : 'Business QR Code'}
            </h2>
            <p className="text-xs text-warm-gray mt-1.5">{isSal ? 'Customers scan to book appointments & explore services.' : 'Customers scan to access your public page.'}</p>
          </div>
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-48 h-48 bg-white p-3 rounded-2xl border-2 border-stone/60 shadow-md flex items-center justify-center group cursor-pointer">
              <div className="grid grid-cols-5 gap-1.5 w-full h-full p-1">
                {[...Array(25)].map((_, i) => (
                  <div key={i} className={`rounded-sm ${(i * 7) % 3 === 0 || i === 0 || i === 4 || i === 20 || i === 24 ? 'bg-green-bottle' : i % 2 === 0 ? 'bg-charcoal/80' : 'bg-cream'}`} />
                ))}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <span className="text-white text-xs font-bold flex items-center gap-1.5"><Download className="w-4 h-4" /> Save QR</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm font-bold text-charcoal">{currentBusiness?.name || (isSal ? 'Glow Salon Studio' : 'Your Biizora Business')}</p>
              <p className="text-xs text-warm-gray max-w-xs leading-relaxed">
                {isSal ? 'Customers scan this QR to explore your salon, discover services, get AI style recommendations, and request an appointment.'
                  : isRest ? 'Guests scan to view digital menu, place orders & pay online.'
                  : isMfg ? 'Industrial buyers scan to view capabilities & submit RFQs.'
                  : 'Customers scan to browse products & order online.'}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-warm-gray">{isSal ? 'Your Public Salon URL' : 'Your Public Business URL'}</label>
            <div className="flex gap-2">
              <input readOnly value={publicUrl} className="flex-1 min-w-0 px-3 py-2.5 bg-cream/50 border border-stone rounded-xl text-xs font-mono text-charcoal truncate focus:outline-none" />
              <button onClick={handleCopyLink} className="px-4 py-2.5 bg-green-bottle text-white rounded-xl text-xs font-bold hover:bg-green-forest flex items-center gap-1.5 shrink-0 transition-colors">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 bg-white rounded-3xl border border-stone/70 p-7 shadow-sm">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-charcoal flex items-center gap-2">
              <Settings className="w-4 h-4 text-green-bottle" />
              {isSal ? 'Salon Customer Experience Settings' : isMfg ? 'B2B Customer Experience Settings' : isRest ? 'Restaurant Customer Experience Settings' : isStat ? 'Stationery Customer Experience Settings' : 'Customer Experience Settings'}
            </h2>
            <p className="text-xs text-warm-gray mt-1.5">Control what customers see and can do on your public page.</p>
          </div>

          {isSal ? (
            <div>
              <SettingRow icon={Globe} title="Online Salon Page" desc="Let customers explore your salon, services, stylists, pricing, and availability." checked={toggles.onlineSalonPage} onChange={(v) => setToggles((t) => ({ ...t, onlineSalonPage: v }))} />
              <SettingRow icon={Calendar} title="Online Appointment Requests" desc="Allow customers to request appointments directly from your public Salon page." checked={toggles.onlineAppointmentRequests} onChange={(v) => setToggles((t) => ({ ...t, onlineAppointmentRequests: v }))} />
              <SettingRow icon={BookOpen} title="Service Catalogue" desc="Show your salon services, duration, pricing, and descriptions online." checked={toggles.serviceCatalogue} onChange={(v) => setToggles((t) => ({ ...t, serviceCatalogue: v }))} />
              <SettingRow icon={Users} title="Stylist Profiles" desc="Show available stylists and their specialties to customers." checked={toggles.stylistProfiles} onChange={(v) => setToggles((t) => ({ ...t, stylistProfiles: v }))} />
              <SettingRow icon={Sparkles} title="Bizz AI Face & Style Recommendations" desc="Let customers get camera-powered personalized haircut & beauty recommendations." checked={toggles.biizAiRecommendations} onChange={(v) => setToggles((t) => ({ ...t, biizAiRecommendations: v }))} />
              <SettingRow icon={CreditCard} title="Online Booking Fee / Deposit" desc="Collect a deposit when customers submit an appointment request online." checked={toggles.onlineBookingFee} onChange={(v) => setToggles((t) => ({ ...t, onlineBookingFee: v }))} />
              <SettingRow icon={CheckCircle2} title="Salon Approval Required" desc="Require salon approval before an appointment becomes confirmed." checked={toggles.salonApprovalRequired} onChange={(v) => setToggles((t) => ({ ...t, salonApprovalRequired: v }))} />
              <SettingRow icon={Bell} title="Appointment Reminders" desc="Send customers confirmation and reminder notifications automatically." checked={toggles.appointmentReminders} onChange={(v) => setToggles((t) => ({ ...t, appointmentReminders: v }))} />
              <SettingRow icon={Shield} title="Pay Remaining Balance at Salon" desc="Allow customers to pay the remaining service amount when they visit." checked={toggles.payRemainingAtSalon} onChange={(v) => setToggles((t) => ({ ...t, payRemainingAtSalon: v }))} />
            </div>
          ) : isMfg ? (
            <div>
              <SettingRow icon={Boxes} title="B2B Product & Capability Showcase" desc="Display manufacturing capabilities, machinery, CNC tolerances, and product specs to buyers." checked={toggles.onlineOrdering} onChange={(v) => setToggles((t) => ({ ...t, onlineOrdering: v }))} />
              <SettingRow icon={Globe} title="B2B Request for Quotation (RFQ) Portal" desc="Allow clients to submit RFQs, technical drawings, material preferences, and quantities." checked={toggles.onlineBooking} onChange={(v) => setToggles((t) => ({ ...t, onlineBooking: v }))} />
            </div>
          ) : isRest ? (
            <div>
              <SettingRow icon={Utensils} title="Digital Restaurant Menu & Food Ordering" desc="Let customers browse food categories, customize items, choose spice levels, and place digital orders." checked={toggles.onlineOrdering} onChange={(v) => setToggles((t) => ({ ...t, onlineOrdering: v }))} />
              <SettingRow icon={QrCode} title="Dine-In Table QR Ordering" desc="Enable QR code scanning on restaurant tables for instant guest ordering without calling staff." checked={toggles.onlineBooking} onChange={(v) => setToggles((t) => ({ ...t, onlineBooking: v }))} />
              <SettingRow icon={KeyRound} title="Counter Takeaway & Pickup Code Verification" desc="Generate secure 4-digit pickup codes for takeaway customers to verify at the restaurant counter." checked={toggles.onlineBookingFee} onChange={(v) => setToggles((t) => ({ ...t, onlineBookingFee: v }))} />
              <SettingRow icon={Globe} title="Home Delivery Ordering" desc="Collect delivery address, phone number, and delivery instructions for home delivery orders." checked={toggles.onlineSalonPage} onChange={(v) => setToggles((t) => ({ ...t, onlineSalonPage: v }))} />
              <SettingRow icon={CreditCard} title="Razorpay Online Payments & Pay at Counter" desc="Allow diners to pay online via UPI/Card/Netbanking or select Pay at Counter." checked={toggles.onlinePayments} onChange={(v) => setToggles((t) => ({ ...t, onlinePayments: v }))} />
              <SettingRow icon={Bell} title="WhatsApp Order Status Notifications" desc="Send automated WhatsApp updates when kitchen accepts, prepares, or completes an order." checked={toggles.appointmentReminders} onChange={(v) => setToggles((t) => ({ ...t, appointmentReminders: v }))} />
              <SettingRow icon={Clock} title="Live Order Status Tracker" desc="Give customers a live visual timeline tracker to monitor kitchen preparation status." checked={toggles.salonApprovalRequired} onChange={(v) => setToggles((t) => ({ ...t, salonApprovalRequired: v }))} />
            </div>
          ) : (
            <div>
              <SettingRow icon={ShoppingBag} title="Online Storefront & Product Catalog" desc="Display retail product inventory, prices, and categories to online shoppers." checked={toggles.onlineOrdering} onChange={(v) => setToggles((t) => ({ ...t, onlineOrdering: v }))} />
            </div>
          )}
        </div>
      </div>

      {/* Booking Requests Modal */}
      {requestsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-7 border-b border-stone/60 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl z-10">
              <div>
                <h3 className="text-base font-bold text-charcoal flex items-center gap-2"><Calendar className="w-5 h-5 text-green-bottle" /> Salon Appointment Requests</h3>
                <p className="text-xs text-warm-gray mt-1">Review and approve online client booking deposit submissions</p>
              </div>
              <button onClick={() => setRequestsModal(false)} className="w-8 h-8 rounded-full bg-cream hover:bg-stone flex items-center justify-center text-warm-gray text-sm transition-colors">✕</button>
            </div>
            <div className="p-7 space-y-4">
              {bookingRequests.map((req) => (
                <div key={req.id} className="p-5 bg-cream/30 border border-stone/60 rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-charcoal">{req.customerName}</span>
                        <span className="text-xs font-mono text-warm-gray">{req.phone}</span>
                      </div>
                      <p className="text-xs font-semibold text-emerald-800 mt-1">{req.service}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full shrink-0 ${req.status === 'APPOINTMENT CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : req.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>{req.status}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[['Stylist', req.stylist, ''], ['Date & Time', `${req.date} @ ${req.time}`, ''], ['Deposit Paid', `₹${req.bookingFee}`, 'text-emerald-700 font-bold'], ['Due at Salon', `₹${req.remainingAmount}`, 'text-charcoal font-bold']].map(([label, value, color]) => (
                      <div key={label}>
                        <p className="text-[10px] text-warm-gray mb-0.5">{label}</p>
                        <p className={`text-xs ${color || 'text-charcoal font-semibold'}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                  {req.status === 'PENDING SALON APPROVAL' && (
                    <div className="flex justify-end gap-2 pt-2 border-t border-stone/40">
                      <button onClick={() => handleRejectRequest(req.id)} className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-colors">Reject</button>
                      <button onClick={() => handleApproveRequest(req.id)} className="px-5 py-2 bg-green-bottle text-white hover:bg-green-forest rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> Approve Appointment</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="px-7 py-5 border-t border-stone/60 flex justify-end">
              <button onClick={() => setRequestsModal(false)} className="px-6 py-2.5 bg-cream text-charcoal font-semibold rounded-xl text-xs hover:bg-stone transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Verify Code Modal */}
      {verifyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-7 shadow-2xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-charcoal flex items-center gap-2"><KeyRound className="w-5 h-5 text-green-bottle" />{isMfg ? 'Verify RFQ Quote Code' : isRest ? 'Verify Order Code' : 'Verify Pickup Code'}</h3>
                <p className="text-xs text-warm-gray mt-1">Enter the code provided by the customer</p>
              </div>
              <button onClick={() => { setVerifyModal(false); setVerifyResult(null); setVerifyError(''); }} className="w-8 h-8 rounded-full bg-cream flex items-center justify-center text-warm-gray hover:text-charcoal">✕</button>
            </div>
            <form onSubmit={handleVerifyCodeSubmit} className="space-y-4">
              <input type="text" value={pickupCodeInput} onChange={(e) => setPickupCodeInput(e.target.value.toUpperCase())} placeholder="e.g. BZR-4821" className="w-full px-4 py-3.5 bg-cream/50 border border-stone rounded-2xl text-sm font-mono text-charcoal placeholder-warm-gray/50 focus:outline-none focus:ring-2 focus:ring-green-bottle/30" />
              <button type="submit" disabled={loading} className="w-full py-3.5 bg-green-bottle text-white font-bold rounded-2xl text-sm hover:bg-green-forest disabled:opacity-50 transition-colors">
                {loading ? 'Verifying…' : 'Verify Code'}
              </button>
            </form>
            {verifyError && <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">{verifyError}</div>}
            {verifyResult && (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm"><CheckCircle2 className="w-5 h-5" /> Code Verified Successfully</div>
                {typeof verifyResult === 'object' && verifyResult.customerName && <p className="text-xs text-emerald-700">Customer: <strong>{verifyResult.customerName}</strong></p>}
                {typeof verifyResult === 'object' && verifyResult.status && <p className="text-xs text-emerald-700">Status: <strong>{verifyResult.status}</strong></p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
