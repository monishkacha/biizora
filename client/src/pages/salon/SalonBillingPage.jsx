import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useBusiness } from '../../context/BusinessContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Percent,
  Coins,
  Receipt,
  Printer,
  ChevronDown,
  X,
  Phone,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PoweredByBizora } from '../../components/ui/PoweredByBizora';
import { sendInvoiceToWhatsApp } from '../../services/whatsappService';

// Predefined fallback demo customers
const predefinedCustomers = [
  { id: 'p1', name: 'Krish Patel', phone: '9824249704' },
  { id: 'p2', name: 'Priya Patel', phone: '9876543210' },
  { id: 'p3', name: 'Riya Shah', phone: '9898989898' },
  { id: 'p4', name: 'Aarav Mehta', phone: '9811111111' },
];

// GST Constant
const GST_RATE = 0.18;

export default function SalonBillingPage() {
  const { t, i18n } = useTranslation();
  const isGu = i18n.language?.startsWith('gu');
  const location = useLocation();
  const navigate = useNavigate();
  const { customers, company } = useBusiness();
  const { addNotification } = useNotification();

  // Selected customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [clientName, setClientName] = useState('Select customer');
  const [clientPhone, setClientPhone] = useState('');

  // Cart items & Options
  const [selectedItems, setSelectedItems] = useState([
    { id: 1, name: 'Haircut & Styling', type: 'Service', rate: 800, qty: 1 },
  ]);
  const [tip, setTip] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [applyGst, setApplyGst] = useState(false); // Default unchecked
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [invoiceNumber] = useState(() => 'INV-2026-' + Date.now().toString().slice(-4));
  
  // Search dropdown filter
  const [customerSearch, setCustomerSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Combine customers from Context + Predefined list
  const combinedCustomers = [
    ...(customers || []).map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone || '',
    })),
    ...predefinedCustomers.filter(
      (pc) => !(customers || []).some((c) => c.name === pc.name)
    ),
  ];

  const filteredCustomers = combinedCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(customerSearch))
  );

  // Handle route state prefill (e.g. from appointments page)
  useEffect(() => {
    if (location.state) {
      const { client, service, stylist, price } = location.state;
      if (client) {
        setClientName(client);
        const match = combinedCustomers.find(
          (c) => c.name.toLowerCase() === client.toLowerCase()
        );
        if (match) {
          setSelectedCustomerId(match.id);
          setClientPhone(match.phone);
        }
      }
      if (service) {
        setSelectedItems([
          {
            id: Date.now(),
            name: `${service} (by ${stylist || 'Stylist'})`,
            type: 'Service',
            rate: price || 1200,
            qty: 1,
          },
        ]);
      }
    }
  }, [location.state]);

  // Catalog options
  const salonCatalog = [
    { id: 101, name: 'Premium Hair Coloring', type: 'Service', rate: 3500 },
    { id: 102, name: 'Hydrating Facial', type: 'Service', rate: 1500 },
    { id: 103, name: 'Waxing & Threading', type: 'Service', rate: 800 },
    { id: 104, name: 'L\'Oreal Hair Serum', type: 'Product', rate: 1200 },
  ];

  const handleAddItem = (item) => {
    setSelectedItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const handleQtyChange = (id, delta) => {
    setSelectedItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const handleRemoveItem = (id) => {
    setSelectedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomerId(customer.id);
    setClientName(customer.name);
    setClientPhone(customer.phone || '');
    setDropdownOpen(false);
    setCustomerSearch('');
  };

  // Consistent calculations across Screen, Print & PDF
  const subtotal = selectedItems.reduce((sum, item) => sum + item.rate * item.qty, 0);
  const taxableAmount = Math.max(0, subtotal - discount);
  const gst = applyGst ? taxableAmount * GST_RATE : 0;
  const grandTotal = taxableAmount + gst + Number(tip);

  // Billing Flow Persistence & Payment Completion
  const handleCheckout = () => {
    if (clientName === 'Select customer') {
      addNotification({ message: 'Please select a customer before completing payment', type: 'error' });
      return;
    }

    if (location.state?.apptId) {
      const savedSchedule = localStorage.getItem('salon_schedule');
      if (savedSchedule) {
        const schedule = JSON.parse(savedSchedule);
        const updated = schedule.map((s) =>
          s.id === location.state.apptId ? { ...s, status: 'Completed' } : s
        );
        localStorage.setItem('salon_schedule', JSON.stringify(updated));
      }
    }

    const savedPayments = localStorage.getItem('salon_recent_payments');
    const payments = savedPayments ? JSON.parse(savedPayments) : [];
    const newPayment = {
      id: invoiceNumber,
      client: clientName,
      phone: clientPhone,
      service: selectedItems.map((i) => i.name).join(', '),
      amount: `₹${Math.round(grandTotal).toLocaleString('en-IN')}`,
      paymentMethod,
      date: new Date().toLocaleDateString('en-IN'),
    };
    localStorage.setItem('salon_recent_payments', JSON.stringify([newPayment, ...payments]));

    const savedRevenue = localStorage.getItem('salon_revenue');
    const currentRevenue = savedRevenue ? Number(savedRevenue) : 18450;
    localStorage.setItem('salon_revenue', String(currentRevenue + grandTotal));

    addNotification({ message: 'Checkout completed! Invoice saved to records.', type: 'success' });
    navigate('/app');
  };

  const handlePrint = () => {
    if (clientName === 'Select customer') {
      addNotification({ message: 'Please select a customer before printing bill', type: 'error' });
      return;
    }
    requestAnimationFrame(() => {
      window.print();
    });
  };

  const generateInvoicePdfBlob = async () => {
    const element = document.getElementById('invoice-print');
    element.classList.remove('hidden');

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
    });

    element.classList.add('hidden');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, width, height);
    return pdf.output('blob');
  };

  const [whatsappState, setWhatsappState] = useState('Normal'); // 'Normal' | 'Generating...' | 'Sending...' | 'Invoice Sent' | 'Retry'

  const handleWhatsAppBill = async () => {
    if (clientName === 'Select customer') {
      addNotification({ message: 'Please select a customer before generating WhatsApp bill', type: 'error' });
      return;
    }

    if (!clientPhone) {
      addNotification({ message: 'This customer does not have a phone number saved', type: 'error' });
      return;
    }

    if (selectedItems.length === 0) {
      addNotification({ message: 'Cart is empty. Select services from catalog', type: 'error' });
      return;
    }

    try {
      setWhatsappState('Generating...');
      const pdfBlob = await generateInvoicePdfBlob();

      setWhatsappState('Sending...');

      const salonName = company?.name || 'Glow Salon Studio';
      const sanitizedName = clientName.replace(/\s+/g, '-');
      const filename = `${salonName.replace(/\s+/g, '-')}-${sanitizedName}-${invoiceNumber}.pdf`;

      const result = await sendInvoiceToWhatsApp({
        phone: clientPhone,
        pdfBlob,
        filename,
        customerName: clientName,
        invoiceNumber,
        totalAmount: grandTotal,
        salonName,
      });

      setWhatsappState('Invoice Sent');
      setTimeout(() => setWhatsappState('Normal'), 4000);

      if (result.apiSuccess) {
        addNotification({ message: `Invoice sent successfully to ${clientName} on WhatsApp.`, type: 'success' });
      } else {
        addNotification({ message: `Invoice PDF generated. WhatsApp opened for ${clientName}. Please attach the PDF.`, type: 'info' });
      }
    } catch (err) {
      console.error('WhatsApp PDF error:', err);
      setWhatsappState('Retry');
      addNotification({ message: 'Unable to send the invoice on WhatsApp.', type: 'error' });
    }
  };

  return (
    <div className="relative">
      {/* Print Stylesheet Injection */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body * {
              visibility: hidden !important;
            }
            #invoice-print, #invoice-print * {
              visibility: visible !important;
            }
            #invoice-print {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              display: block !important;
              background: #fff !important;
              color: #000 !important;
              padding: 20px !important;
            }
          }
        `
      }} />

      {/* Screen POS Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
        {/* Left Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-green-forest">{isGu ? 'ચેકઆઉટ ડેસ્ક' : 'Checkout Desk'}</p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-charcoal">
              {isGu ? 'સલોન POS બિલિંગ કાઉન્ટર' : 'Salon POS Billing Counter'}
            </h1>
            <p className="text-sm text-warm-gray">{isGu ? 'વોક-ઈન ગ્રાહકના બિલો બનાવો, મેમ્બર ડિસ્કાઉન્ટ ઉમેરો અને ચુકવણી સ્વીકારો' : 'Register walk-in bills, apply member discounts, and select modes'}</p>
          </div>

          {/* Customer Selection & Details */}
          <Card className="p-5 border border-stone space-y-4 bg-white">
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">{isGu ? 'ક્લાયન્ટ વિગત' : 'Client Details'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              
              {/* Customer Dropdown */}
              <div className="space-y-1 relative">
                <label className="text-warm-gray font-medium mb-1 block">{isGu ? 'ગ્રાહકનું નામ *' : 'Customer Name *'}</label>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full flex items-center justify-between px-3.5 py-3 bg-ivory/55 border border-stone rounded-xl outline-none text-left text-xs font-semibold text-charcoal h-12"
                >
                  <span>{clientName === 'Select customer' ? (isGu ? 'ગ્રાહક પસંદ કરો' : 'Select customer') : clientName}</span>
                  <ChevronDown className="w-4 h-4 text-warm-gray" />
                </button>

                {dropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-stone rounded-xl shadow-elev p-2 max-h-60 overflow-y-auto space-y-1">
                    <div className="relative mb-2">
                      <Search className="w-3.5 h-3.5 text-warm-gray absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder={isGu ? 'નામ અથવા ફોન દ્વારા શોધો...' : 'Search name or phone...'}
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-ivory/55 border border-stone rounded-lg text-xs outline-none"
                      />
                    </div>
                    {filteredCustomers.length === 0 ? (
                      <p className="text-[11px] text-warm-gray p-2 text-center">{isGu ? 'કોઈ ગ્રાહક મળ્યા નથી.' : 'No customers found.'}</p>
                    ) : (
                      filteredCustomers.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleSelectCustomer(c)}
                          className="w-full text-left px-3 py-2 hover:bg-cream rounded-lg flex justify-between items-center text-xs"
                        >
                          <span className="font-bold text-charcoal">{c.name}</span>
                          <span className="text-[10px] text-warm-gray font-mono">{c.phone || (isGu ? 'ફોન નથી' : 'No phone')}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Auto-retrieved Saved Customer Phone */}
              <div className="space-y-1">
                <label className="text-warm-gray font-medium mb-1 block">{isGu ? 'સાચવેલ ગ્રાહક ફોન' : 'Saved Customer Phone'}</label>
                <div className="w-full px-3.5 py-3 bg-ivory/55 border border-stone rounded-xl text-xs font-semibold font-mono text-charcoal h-12 flex items-center">
                  {clientPhone ? (
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-green-forest" />
                      {clientPhone}
                    </span>
                  ) : (
                    <span className="text-amber-600 text-[11px] font-sans italic flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {isGu ? 'કોઈ ફોન નંબર સાચવેલ નથી' : 'No phone number saved'}
                    </span>
                  )}
                </div>
              </div>

            </div>
          </Card>

          {/* Search catalog */}
          <Card className="p-5 border border-stone space-y-4 bg-white">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-warm-gray absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder={isGu ? 'સેવાઓ અથવા રીટેલ ઉત્પાદનો શોધો...' : 'Search services or retail products...'}
                className="w-full pl-9 pr-4 py-2.5 bg-ivory/55 border border-stone rounded-xl text-xs outline-none focus:border-green-bottle text-charcoal font-sans"
              />
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-warm-gray">{isGu ? 'ઝડપી ઉમેરો' : 'Quick add items'}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {salonCatalog.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleAddItem(item)}
                    className="p-3 bg-white hover:bg-cream border border-stone rounded-xl text-left flex justify-between items-center transition-colors"
                  >
                    <div>
                      <span className="font-bold text-charcoal block">{item.name}</span>
                      <span className="text-[10px] text-warm-gray">{item.type === 'Service' && isGu ? 'સેવા' : item.type === 'Product' && isGu ? 'ઉત્પાદન' : item.type}</span>
                    </div>
                    <span className="font-mono font-bold text-green-forest">₹{item.rate}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Settings options: Discount & Tip */}
          <Card className="p-5 border border-stone grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white">
            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-charcoal block">{isGu ? 'મેમ્બર ડિસ્કાઉન્ટ (₹)' : 'Member Discount (₹)'}</label>
              <div className="relative">
                <Percent className="w-4 h-4 text-warm-gray absolute left-3 top-3" />
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2 bg-ivory/55 border border-stone rounded-xl outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="font-semibold text-charcoal block">{isGu ? 'સ્ટાઈલિસ્ટ ટીપ (₹)' : 'Stylist Tip (₹)'}</label>
              <div className="relative">
                <Coins className="w-4 h-4 text-warm-gray absolute left-3 top-3" />
                <input
                  type="number"
                  value={tip}
                  onChange={(e) => setTip(Number(e.target.value))}
                  className="w-full pl-9 pr-4 py-2 bg-ivory/55 border border-stone rounded-xl outline-none"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Right Panel - Shopping Cart Receipt */}
        <div className="lg:col-span-5">
          <Card className="border border-stone rounded-[20px] bg-white p-5 sm:p-6 shadow-subtle flex flex-col justify-between min-h-[500px]">
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone">
                <ShoppingCart className="w-5 h-5 text-green-bottle" />
                <h2 className="text-sm font-bold text-charcoal">{isGu ? 'ઓર્ડર સારાંશ' : 'Order Summary'}</h2>
              </div>

              {/* Selected items list */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedItems.length === 0 ? (
                  <p className="text-xs text-warm-gray text-center py-10">Cart is empty. Select services from catalog.</p>
                ) : (
                  selectedItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-charcoal block">{item.name}</span>
                        <span className="text-[10px] text-warm-gray font-mono">₹{item.rate} each</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-stone rounded-lg overflow-hidden bg-ivory/50">
                          <button onClick={() => handleQtyChange(item.id, -1)} className="p-1 hover:bg-cream">
                            <Minus className="w-3.5 h-3.5 text-charcoal" />
                          </button>
                          <span className="px-2 font-bold font-mono">{item.qty}</span>
                          <button onClick={() => handleAddItem(item)} className="p-1 hover:bg-cream">
                            <Plus className="w-3.5 h-3.5 text-charcoal" />
                          </button>
                        </div>
                        <button onClick={() => handleRemoveItem(item.id)} className="p-1.5 text-terracotta hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Pricing calculations */}
            <div className="pt-4 border-t border-stone space-y-2 text-xs font-semibold">
              <div className="flex justify-between">
                <span className="text-warm-gray font-medium">Subtotal</span>
                <span className="font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-terracotta">
                  <span className="font-medium">Discount</span>
                  <span className="font-mono">-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {/* Optional GST Checkbox */}
              <div className="flex items-center justify-between py-1 border-t border-stone/40 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none text-charcoal">
                  <input
                    type="checkbox"
                    checked={applyGst}
                    onChange={(e) => setApplyGst(e.target.checked)}
                    className="w-4 h-4 rounded border-stone text-green-bottle focus:ring-green-bottle"
                  />
                  <span>Apply GST (18%)</span>
                </label>
                <span className="font-mono">{applyGst ? `₹${Math.round(gst).toLocaleString('en-IN')}` : '₹0'}</span>
              </div>

              {tip > 0 && (
                <div className="flex justify-between text-green-forest">
                  <span className="font-medium">Tip Amount</span>
                  <span className="font-mono">₹{tip.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold border-t border-stone pt-2 text-charcoal">
                <span>Final Total</span>
                <span className="font-mono">₹{Math.round(grandTotal).toLocaleString('en-IN')}</span>
              </div>

              {/* Payment methods */}
              <div className="pt-3">
                <p className="text-[10px] uppercase text-warm-gray font-bold mb-2">Payment Method</p>
                <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                  {['UPI', 'Cash', 'Card'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 border rounded-xl font-bold transition-all ${
                        paymentMethod === method
                          ? 'bg-green-bottle text-white border-green-bottle shadow-subtle'
                          : 'bg-white border-stone text-charcoal hover:bg-cream'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="grid grid-cols-3 gap-3 mt-4">
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="h-14 text-xs font-semibold"
                >
                  Print Bill
                </Button>

                <Button
                  onClick={handleWhatsAppBill}
                  disabled={whatsappState !== 'Normal' && whatsappState !== 'Retry'}
                  className="h-14 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold border-none disabled:opacity-70"
                >
                  {whatsappState === 'Normal' ? 'WhatsApp Bill' : whatsappState}
                </Button>

                <Button
                  onClick={handleCheckout}
                  className="h-14 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-semibold border-none"
                >
                  Complete Payment
                </Button>
              </div>
            </div>
            <PoweredByBizora className="mt-4 border-t border-stone/30 pt-2" />
          </Card>
        </div>
      </div>

      {/* Printable Invoice Container (Hidden on Screen, Visible on Print) */}
      <div id="invoice-print" className="hidden print:block bg-white text-black p-6">
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-black">{company?.name || 'Glow Salon Studio'} ✨</h2>
            <p className="text-xs text-gray-600">{company?.address || '123 Green Glades Lane, Indiranagar, Bengaluru'}</p>
            <p className="text-xs text-gray-600">Phone: {company?.phone || '+91 98765 43210'} · GSTIN: {company?.gstin || '29AAAAA1111A1Z1'}</p>
          </div>

          <div className="border-t border-b border-dashed border-gray-300 py-2 text-xs space-y-1">
            <div className="flex justify-between">
              <span><strong>Invoice No:</strong> {invoiceNumber}</span>
              <span><strong>Date:</strong> {new Date().toLocaleDateString('en-IN')} {new Date().toLocaleTimeString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span><strong>Customer:</strong> {clientName}</span>
              <span><strong>Phone:</strong> {clientPhone || 'N/A'}</span>
            </div>
          </div>

          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-black font-bold">
                <th className="py-1">Item / Service</th>
                <th className="py-1 text-center">Qty</th>
                <th className="py-1 text-right">Price</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-1">{item.name}</td>
                  <td className="py-1 text-center">{item.qty}</td>
                  <td className="py-1 text-right">₹{item.rate}</td>
                  <td className="py-1 text-right font-mono">₹{item.rate * item.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end text-xs space-y-1 font-semibold">
            <div className="w-48 space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{subtotal}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              {applyGst && (
                <div className="flex justify-between text-gray-600">
                  <span>GST (18%):</span>
                  <span>₹{Math.round(gst)}</span>
                </div>
              )}
              {tip > 0 && (
                <div className="flex justify-between text-[#2F6B59]">
                  <span>Tip:</span>
                  <span>₹{tip}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-black pt-1 text-sm font-bold text-black">
                <span>Final Total:</span>
                <span>₹{Math.round(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-gray-500 pt-1">
                <span>Payment Method:</span>
                <span>{paymentMethod}</span>
              </div>
            </div>
          </div>

          <div className="text-center text-[10px] text-gray-500 pt-4 border-t border-dashed border-gray-300">
            <p>Thank you for visiting {company?.name || 'Glow Salon Studio'} ✨</p>
            <p className="mb-2">We look forward to serving you again!</p>
            <PoweredByBizora />
          </div>
        </div>
      </div>
    </div>
  );
}
