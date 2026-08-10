import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';
import { PoweredByBizora } from '../../components/ui/PoweredByBizora';
import {
  Receipt,
  Printer,
  FileDown,
  Share2,
  CheckCircle2,
  CreditCard,
  QrCode,
  DollarSign,
  Percent,
  Sparkles,
  ArrowLeft,
  Phone,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function RestaurantBillingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramOrderId = searchParams.get('orderId');

  const {
    company,
    orders,
    tables,
    processOrderPayment,
    showToast,
  } = useBusiness();

  const [selectedOrderId, setSelectedOrderId] = useState(paramOrderId || '');
  const [applyGst, setApplyGst] = useState(true);
  const [applyServiceCharge, setApplyServiceCharge] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponCode, setCouponCode] = useState('');
  const [tipAmount, setTipAmount] = useState(0);

  const [paymentMode, setPaymentMode] = useState('UPI'); // Cash, Card, UPI, Split
  const [cashPart, setCashPart] = useState(0);
  const [upiPart, setUpiPart] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const printRef = useRef(null);

  const activeOrders = orders.filter((o) => o.orderStatus === 'active');
  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || activeOrders[0] || null;

  useEffect(() => {
    if (paramOrderId) setSelectedOrderId(paramOrderId);
    else if (activeOrders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(activeOrders[0].id);
    }
  }, [paramOrderId, activeOrders]);

  if (!selectedOrder) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-stone space-y-4">
        <Receipt className="w-12 h-12 text-warm-gray mx-auto" />
        <h2 className="text-xl font-bold text-charcoal">No Active Unpaid Orders Found</h2>
        <p className="text-sm text-warm-gray">Create an order from POS to generate billing receipts.</p>
        <button
          onClick={() => navigate('/app/orders')}
          className="px-5 py-2.5 bg-green-bottle text-white font-bold text-sm rounded-xl"
        >
          Go to POS / Order Entry
        </button>
      </div>
    );
  }

  // Financial Calculations
  const subtotal = selectedOrder.subtotal || 0;
  const tax = applyGst ? Math.round(subtotal * 0.05) : 0;
  const serviceCharge = applyServiceCharge ? Math.round(subtotal * 0.05) : 0;
  const discount = Number(discountAmount || 0);
  const tip = Number(tipAmount || 0);
  const grandTotal = Math.max(0, Math.round(subtotal - discount + tax + serviceCharge + tip));

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'WELCOME10') {
      const disc = Math.round(subtotal * 0.1);
      setDiscountAmount(disc);
      showToast('10% Welcome discount applied!');
    } else if (couponCode.toUpperCase() === 'OLIVE200') {
      setDiscountAmount(200);
      showToast('₹200 Discount applied!');
    } else {
      showToast('Invalid coupon code', 'error');
    }
  };

  const handleCompletePayment = async () => {
    if (selectedOrder.paymentStatus === 'paid') {
      showToast('This bill has already been settled.', 'error');
      return;
    }

    if (paymentMode === 'Split' && Number(cashPart) + Number(upiPart) < grandTotal) {
      showToast(`Split payment total (₹${Number(cashPart) + Number(upiPart)}) is less than Grand Total ₹${grandTotal}`, 'error');
      return;
    }

    setIsProcessing(true);
    try {
      await processOrderPayment(selectedOrder.id, {
        paidAmount: grandTotal,
        paymentMethod: paymentMode === 'Split' ? `Split (Cash ₹${cashPart} + UPI ₹${upiPart})` : paymentMode,
        discountAmount: discount,
        serviceChargeAmount: serviceCharge,
        tipAmount: tip,
      });

      setIsProcessing(false);
    } catch (err) {
      setIsProcessing(false);
      showToast(err.message || 'Payment processing failed', 'error');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const safeBizName = (company?.name || 'The-Olive-Table').replace(/[^a-zA-Z0-9]/g, '-');
      pdf.save(`${safeBizName}-Invoice-${selectedOrder.orderNumber}.pdf`);
      showToast('PDF Invoice downloaded successfully!');
    } catch (err) {
      showToast('Failed to generate PDF', 'error');
    }
  };

  const handleSendWhatsApp = () => {
    const phoneNum = (selectedOrder.phone || '').replace(/[^0-9]/g, '');
    const bizName = company?.name || 'The Olive Table';
    const text = encodeURIComponent(
      `Hello ${selectedOrder.customerName},\nThank you for dining at ${bizName}!\n\nOrder #: ${selectedOrder.orderNumber}\nTotal Amount: ₹${grandTotal}\nPayment Status: ${selectedOrder.paymentStatus.toUpperCase()}\n\nWe look forward to serving you again!`
    );

    if (phoneNum) {
      window.open(`https://wa.me/${phoneNum}?text=${text}`, '_blank');
      showToast('WhatsApp opened with invoice details.');
    } else {
      showToast('No customer phone number available.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone/40 shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/orders')}
            className="p-2 rounded-xl bg-cream hover:bg-stone-200 text-charcoal"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-charcoal">POS & Billing Settlement</h1>
            <p className="text-sm text-warm-gray mt-0.5">
              Review order items, apply taxes/service charges, process payments, and dispatch receipts.
            </p>
          </div>
        </div>

        {/* Order Selector Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedOrderId}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="p-2.5 rounded-xl border border-stone text-xs font-bold bg-cream"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                {o.orderNumber} - {o.tableName || o.orderType} (₹{o.grandTotal}) [{o.paymentStatus}]
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Billing Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-4 print:hidden">
          <div className="bg-white p-6 rounded-3xl border border-stone/40 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-charcoal border-b border-stone/40 pb-3 flex justify-between items-center">
              <span>Bill Details ({selectedOrder.orderNumber})</span>
              <span className="text-xs text-warm-gray">{selectedOrder.tableName || selectedOrder.orderType}</span>
            </h2>

            {/* Tax & Charges Toggles */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3 rounded-xl bg-cream/50 border border-stone/40">
                <span className="text-xs font-bold text-charcoal">Apply GST (5%)</span>
                <input
                  type="checkbox"
                  checked={applyGst}
                  onChange={(e) => setApplyGst(e.target.checked)}
                  className="w-4 h-4 accent-green-bottle cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-cream/50 border border-stone/40">
                <span className="text-xs font-bold text-charcoal">Apply Service Charge (5%)</span>
                <input
                  type="checkbox"
                  checked={applyServiceCharge}
                  onChange={(e) => setApplyServiceCharge(e.target.checked)}
                  className="w-4 h-4 accent-green-bottle cursor-pointer"
                />
              </div>
            </div>

            {/* Coupon Code input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-charcoal">Apply Offer / Coupon Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME10 or OLIVE200"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 p-2.5 border border-stone rounded-xl text-xs uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="px-4 py-2.5 bg-green-bottle text-white text-xs font-bold rounded-xl hover:bg-green-bottle/90"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-warm-gray uppercase tracking-wider">Payment Method</label>
              <div className="grid grid-cols-4 gap-2">
                {['UPI', 'Cash', 'Card', 'Split'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${
                      paymentMode === mode
                        ? 'bg-green-bottle text-white border-green-bottle shadow-sm'
                        : 'bg-cream text-charcoal border-stone hover:bg-stone-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Payment inputs */}
            {paymentMode === 'Split' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/30">
                <div>
                  <label className="text-[11px] font-bold text-amber-900">Cash Amount (₹)</label>
                  <input
                    type="number"
                    value={cashPart}
                    onChange={(e) => setCashPart(e.target.value)}
                    className="w-full mt-1 p-2 border border-amber-400 rounded-xl text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-amber-900">UPI Amount (₹)</label>
                  <input
                    type="number"
                    value={upiPart}
                    onChange={(e) => setUpiPart(e.target.value)}
                    className="w-full mt-1 p-2 border border-amber-400 rounded-xl text-xs bg-white"
                  />
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2">
              {selectedOrder.paymentStatus === 'paid' ? (
                <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 rounded-2xl text-center text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Payment Complete & Settled
                </div>
              ) : (
                <button
                  onClick={handleCompletePayment}
                  disabled={isProcessing}
                  className="w-full py-3.5 bg-green-bottle text-white font-extrabold text-sm rounded-2xl hover:bg-green-bottle/90 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-5 h-5" /> Settle & Pay ₹{grandTotal}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Receipt Preview & Print Renderer (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center print:hidden">
            <span className="text-xs font-bold text-warm-gray uppercase tracking-wider">Invoice Receipt Preview</span>
            <div className="flex gap-2">
              <button
                onClick={handlePrintReceipt}
                className="px-3 py-1.5 bg-stone-100 text-charcoal text-xs font-bold rounded-xl hover:bg-stone-200 flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-3 py-1.5 bg-stone-100 text-charcoal text-xs font-bold rounded-xl hover:bg-stone-200 flex items-center gap-1"
              >
                <FileDown className="w-3.5 h-3.5" /> PDF
              </button>
              <button
                onClick={handleSendWhatsApp}
                className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 flex items-center gap-1"
              >
                <Share2 className="w-3.5 h-3.5" /> WhatsApp
              </button>
            </div>
          </div>

          {/* Printable Invoice Container */}
          <div
            ref={printRef}
            className="bg-white p-8 rounded-3xl border border-stone/60 shadow-xl space-y-6 text-charcoal print:border-none print:shadow-none print:p-0"
          >
            {/* Header / Logo */}
            <div className="border-b border-stone/50 pb-4 text-center space-y-1">
              <h2 className="text-2xl font-black text-charcoal">{company?.name || 'The Olive Table'}</h2>
              <p className="text-xs text-warm-gray">Fine Dining & Modern Cuisine</p>
              {company?.address && <p className="text-[11px] text-warm-gray">{company.address}</p>}
              {company?.phone && <p className="text-[11px] text-warm-gray">Phone: {company.phone}</p>}
              {company?.gstin && <p className="text-[11px] font-mono font-bold text-warm-gray">GSTIN: {company.gstin}</p>}
            </div>

            {/* Meta */}
            <div className="flex justify-between text-xs font-semibold text-charcoal border-b border-stone/30 pb-3">
              <div>
                <div>Invoice #: <span className="font-bold text-green-bottle">{selectedOrder.orderNumber}</span></div>
                <div>Table: <span className="font-bold">{selectedOrder.tableName || selectedOrder.orderType}</span></div>
              </div>
              <div className="text-right">
                <div>Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
                <div>Server: {selectedOrder.serverName || 'Staff'}</div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-stone text-warm-gray font-bold uppercase">
                  <th className="py-2">Item</th>
                  <th className="py-2 text-center">Qty</th>
                  <th className="py-2 text-right">Price</th>
                  <th className="py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/20 font-medium">
                {selectedOrder.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2">
                      <div className="font-bold">{it.name}</div>
                      {it.notes && <div className="text-[10px] text-rose-700 italic">Note: {it.notes}</div>}
                    </td>
                    <td className="py-2 text-center">{it.quantity}</td>
                    <td className="py-2 text-right">₹{it.price}</td>
                    <td className="py-2 text-right font-bold">₹{it.price * it.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-stone/50 pt-3 space-y-1.5 text-xs text-charcoal font-semibold">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              {applyGst && (
                <div className="flex justify-between text-warm-gray">
                  <span>GST (5%)</span>
                  <span>₹{tax}</span>
                </div>
              )}
              {applyServiceCharge && (
                <div className="flex justify-between text-warm-gray">
                  <span>Service Charge (5%)</span>
                  <span>₹{serviceCharge}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-green-bottle pt-2 border-t border-stone">
                <span>Grand Total</span>
                <span>₹{grandTotal}</span>
              </div>
              <div className="flex justify-between text-[11px] text-warm-gray pt-1">
                <span>Payment Method</span>
                <span className="font-bold uppercase text-charcoal">{selectedOrder.paymentMethod || paymentMode}</span>
              </div>
            </div>

            {/* Footer Powered By */}
            <div className="pt-4 border-t border-stone/40 text-center space-y-2">
              <p className="text-xs font-semibold text-warm-gray">Thank you for dining with us!</p>
              <PoweredByBizora className="justify-center" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
