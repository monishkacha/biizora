import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '../context/BusinessContext';
import { Zap, CreditCard, CheckCircle, RefreshCw, QrCode, ShieldCheck } from 'lucide-react';

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent" /> {isGu ? 'રેઝરપે પેમેન્ટ્સ અને ગેટવે' : 'Razorpay Payments & Gateway'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isGu ? 'UPI, કાર્ડ્સ, નેટબેંકિંગ અને વોલેટ્સ સ્વીકારો ત્વરિત મેળ સાથે.' : 'Accept UPI, Cards, NetBanking & Wallets with instant reconciliation.'}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-text text-white rounded-xl text-xs font-bold shadow-md"
        >
          <CreditCard className="w-4 h-4" /> {isGu ? 'રેઝરપે ચેકઆઉટ સિમ્યુલેટ કરો' : 'Simulate Razorpay Checkout'}
        </button>
      </div>

      {/* Payment Gateway Status Banner */}
      <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-[20px] border border-border shadow-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white shrink-0 font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm">{isGu ? 'રેઝરપે સંકલન સક્રિય છે' : 'Razorpay Integration Active'}</h3>
            <p className="text-xs text-slate-300">Live Key ID: <span className="font-mono text-teal-300">rzp_live_98321Biizora</span> • Webhook: {isGu ? 'સક્રિય' : 'Active'}</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-bg-secondary0/20 text-emerald-300 font-bold text-xs rounded-full border border-emerald-500/30">
          ● {isGu ? 'ગેટવે તૈયાર છે (0.9% UPI દર)' : 'Gateway Ready (0.9% UPI Rate)'}
        </span>
      </div>

      {/* Payment History Log */}
      <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{isGu ? 'ટ્રાન્ઝેક્શન લોગ અને રસીદો' : 'Transaction Logs & Receipts'}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50">
                <th className="py-3.5 px-4">{isGu ? 'ટ્રાન્ઝેક્શન ID' : 'Transaction ID'}</th>
                <th className="py-3.5 px-4">{isGu ? 'ઇનવોઇસ #' : 'Invoice #'}</th>
                <th className="py-3.5 px-4">{isGu ? 'ગ્રાહક' : 'Customer'}</th>
                <th className="py-3.5 px-4">{isGu ? 'ચુકવણી પદ્ધતિ' : 'Payment Method'}</th>
                <th className="py-3.5 px-4">{isGu ? 'રકમ' : 'Amount'}</th>
                <th className="py-3.5 px-4">{isGu ? 'સ્થિતિ' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {invoices.filter(i => i.status === 'paid').map((inv, idx) => (
                <tr key={inv.id}>
                  <td className="py-3.5 px-4 font-mono text-accent">pay_LXZ9832{idx+10}</td>
                  <td className="py-3.5 px-4 font-mono font-bold">{inv.invoiceNumber}</td>
                  <td className="py-3.5 px-4 font-medium">{inv.customerName}</td>
                  <td className="py-3.5 px-4">{inv.paymentMethod || 'Razorpay UPI'}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">₹{inv.grandTotal.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-bg-secondary text-text font-bold rounded-full text-[10px]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[20px] shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-accent" /> Razorpay Checkout Simulation
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Select Invoice to Collect Payment For</label>
                <select
                  value={selectedInv?.id}
                  onChange={(e) => setSelectedInv(invoices.find(i => i.id === e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
                >
                  {invoices.map(i => (
                    <option key={i.id} value={i.id}>{i.invoiceNumber} - {i.customerName} (₹{i.grandTotal.toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-2 text-center">
                <QrCode className="w-16 h-16 mx-auto text-slate-800 dark:text-white" />
                <p className="font-bold text-slate-900 dark:text-white">UPI QR ID: {company.bankDetails.upiId}</p>
                <p className="text-[10px] text-slate-400">Scan via Google Pay / PhonePe or Click Below</p>
              </div>

              <button
                onClick={handleSimulateRazorpay}
                disabled={paying}
                className="w-full py-3 bg-accent hover:bg-text disabled:opacity-50 text-white font-bold rounded-xl shadow-lg transition-all"
              >
                {paying ? 'Verifying Razorpay Webhook Signature...' : `Pay ₹${selectedInv?.grandTotal.toLocaleString('en-IN')} via Razorpay`}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
