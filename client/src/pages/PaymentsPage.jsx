import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '../context/BusinessContext';
import { Zap, CreditCard, CheckCircle, RefreshCw, QrCode, ShieldCheck, Lock } from 'lucide-react';

export default function PaymentsPage() {
  const { t, i18n } = useTranslation();
  const isGu = i18n.language?.startsWith('gu');
  const { invoices, updateInvoiceStatus, showToast, company } = useBusiness();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInv, setSelectedInv] = useState(invoices.find(i => i.status !== 'paid') || invoices[0]);
  const [paying, setPaying] = useState(false);

  const handleSimulateRazorpay = () => {
    setPaying(true);
    setTimeout(() => {
      updateInvoiceStatus(selectedInv.id, 'paid', 'Razorpay / UPI');
      setPaying(false);
      setModalOpen(false);
      showToast(`Razorpay Payment of ₹${selectedInv.grandTotal.toLocaleString('en-IN')} verified & recorded!`);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[22px] border border-stone shadow-card">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-green-forest uppercase tracking-wider mb-1">
            <span>Payment Infrastructure</span>
            <span>•</span>
            <span>Razorpay Secure Gateway</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-charcoal flex items-center gap-2.5">
            <Zap className="w-7 h-7 text-green-bottle" /> {isGu ? 'રેઝરપે પેમેન્ટ્સ અને ગેટવે' : 'Razorpay Payments & Gateway'}
          </h1>
          <p className="text-xs text-warm-gray mt-1">
            {isGu ? 'UPI, કાર્ડ્સ, નેટબેંકિંગ અને વોલેટ્સ સ્વીકારો ત્વરિત મેળ સાથે.' : 'Accept UPI, Cards, NetBanking & Wallets with instant invoice reconciliation.'}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-bottle hover:bg-green-forest text-white rounded-xl text-xs font-bold shadow-subtle transition-all"
        >
          <CreditCard className="w-4 h-4" /> {isGu ? 'રેઝરપે ચેકઆઉટ સિમ્યુલેટ કરો' : 'Simulate Razorpay Checkout'}
        </button>
      </div>

      {/* Payment Gateway Status Banner */}
      <div className="p-5 bg-cream/70 rounded-[22px] border border-stone shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-green-bottle text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-charcoal">{isGu ? 'રેઝરપે સંકલન સક્રિય છે' : 'Razorpay Integration Active'}</h3>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                Verified
              </span>
            </div>
            <p className="text-xs text-warm-gray mt-0.5">
              Live Key ID: <span className="font-mono font-semibold text-charcoal">rzp_live_******98321</span> • Webhook Endpoint: <span className="font-semibold text-green-bottle">Active</span>
            </p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 bg-white text-green-bottle font-bold text-xs rounded-xl border border-stone shadow-xs flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          {isGu ? 'ગેટવે તૈયાર છે (0.9% UPI દર)' : 'Gateway Ready (0.9% UPI Rate)'}
        </span>
      </div>

      {/* Payment History Log */}
      <div className="bg-white rounded-[22px] border border-stone shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-stone bg-cream/30 flex items-center justify-between">
          <h3 className="text-sm font-bold text-charcoal">{isGu ? 'ટ્રાન્ઝેક્શન લોગ અને રસીદો' : 'Transaction Logs & Receipts'}</h3>
          <span className="text-xs text-warm-gray font-medium">Auto-reconciled with Razorpay API</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone text-warm-gray font-bold uppercase tracking-wider bg-cream/50">
                <th className="py-3.5 px-4">{isGu ? 'ટ્રાન્ઝેક્શન ID' : 'Transaction ID'}</th>
                <th className="py-3.5 px-4">{isGu ? 'ઇનવોઇસ #' : 'Invoice #'}</th>
                <th className="py-3.5 px-4">{isGu ? 'ગ્રાહક' : 'Customer'}</th>
                <th className="py-3.5 px-4">{isGu ? 'ચુકવણી પદ્ધતિ' : 'Payment Method'}</th>
                <th className="py-3.5 px-4">{isGu ? 'રકમ' : 'Amount'}</th>
                <th className="py-3.5 px-4">{isGu ? 'સ્થિતિ' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone text-charcoal font-medium">
              {invoices.filter(i => i.status === 'paid').map((inv, idx) => (
                <tr key={inv.id} className="hover:bg-cream/20 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-green-bottle font-bold">pay_LXZ9832{idx+10}</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-charcoal">{inv.invoiceNumber}</td>
                  <td className="py-3.5 px-4 font-semibold text-charcoal">{inv.customerName}</td>
                  <td className="py-3.5 px-4 text-warm-gray">{inv.paymentMethod || 'Razorpay UPI'}</td>
                  <td className="py-3.5 px-4 font-extrabold text-charcoal">₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center justify-center whitespace-nowrap px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full text-[10px] uppercase tracking-wider border border-emerald-200">
                      Captured
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Razorpay Test Payment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-[24px] shadow-2xl border border-stone p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone">
              <h3 className="text-base font-bold text-charcoal flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-bottle" /> Razorpay Checkout Simulation
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-warm-gray hover:text-charcoal">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-charcoal mb-1">Select Invoice to Collect Payment For</label>
                <select
                  value={selectedInv?.id}
                  onChange={(e) => setSelectedInv(invoices.find(i => i.id === e.target.value))}
                  className="w-full px-3 py-2.5 bg-cream/40 border border-stone rounded-xl font-bold text-charcoal"
                >
                  {invoices.map(i => (
                    <option key={i.id} value={i.id}>{i.invoiceNumber} - {i.customerName} (₹{i.grandTotal.toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>

              <div className="p-5 bg-cream/40 rounded-2xl border border-stone space-y-2 text-center">
                <QrCode className="w-16 h-16 mx-auto text-charcoal" />
                <p className="font-bold text-charcoal text-xs">UPI QR ID: <span className="font-mono text-green-bottle">{company?.bankDetails?.upiId || 'biizora@icici'}</span></p>
                <p className="text-[10px] text-warm-gray">Scan via Google Pay / PhonePe / Paytm or click button below</p>
              </div>

              <button
                onClick={handleSimulateRazorpay}
                disabled={paying}
                className="w-full py-3 bg-green-bottle hover:bg-green-forest disabled:opacity-50 text-white font-bold rounded-xl shadow-subtle transition-all flex items-center justify-center gap-2"
              >
                {paying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Razorpay Webhook Signature...
                  </>
                ) : (
                  `Pay ₹${selectedInv?.grandTotal?.toLocaleString('en-IN')} via Razorpay`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
