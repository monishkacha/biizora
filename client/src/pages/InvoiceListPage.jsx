import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '../context/BusinessContext';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Printer,
  Share2,
  X,
  QrCode,
  DollarSign,
  FileDown,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function numberToIndianWords(num) {
  if (num === null || num === undefined) return '';
  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convert(n) {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  }

  const parts = num.toFixed(2).split('.');
  const integerPart = Math.floor(num);
  const decimalPart = Math.round((num - integerPart) * 100);
  
  let words = convert(integerPart);
  if (decimalPart > 0) {
    words += ' and ' + convert(decimalPart) + ' Paise';
  }
  
  return words + ' Only';
}

export default function InvoiceListPage() {
  const { t, i18n } = useTranslation();
  const isGu = i18n.language?.startsWith('gu');
  const { invoices, company, customers, updateInvoiceStatus, showToast } = useBusiness();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const activeTheme = company.invoiceTheme || 'modern';

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
                          inv.customerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDownloadPDF = (inv) => {
    const targetInvoice = inv || selectedInvoice;
    if (!targetInvoice) return;

    setDownloadingPdf(true);
    showToast(`Generating PDF for ${targetInvoice.invoiceNumber}...`);

    const element = document.getElementById('printable-invoice');
    if (!element) {
      setDownloadingPdf(false);
      return;
    }

    const opt = {
      margin: [8, 8, 8, 8],
      filename: `${targetInvoice.invoiceNumber}_${targetInvoice.customerName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    const triggerDownload = () => {
      window.html2pdf().set(opt).from(element).save().then(() => {
        setDownloadingPdf(false);
        showToast(`Downloaded ${targetInvoice.invoiceNumber}.pdf successfully!`);
      }).catch((err) => {
        console.error('PDF Generation Error:', err);
        setDownloadingPdf(false);
        // Fallback to window.print
        window.print();
      });
    };

    if (window.html2pdf) {
      triggerDownload();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = () => {
        triggerDownload();
      };
      script.onerror = () => {
        setDownloadingPdf(false);
        window.print();
      };
      document.body.appendChild(script);
    }
  };

  const handleWhatsAppShare = (inv) => {
    const text = `Hello ${inv.customerName}, here is your tax invoice ${inv.invoiceNumber} for ₹${inv.grandTotal.toLocaleString('en-IN')}. Please click here to view & complete payment: https://Biizora.in/invoice/${inv.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent" /> {isGu ? 'જીએસટી ઇનવોઇસ મેનેજમેન્ટ' : 'GST Invoice Management'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isGu ? 'જીએસટી ઇનવોઇસ બનાવો, ટ્રૅક કરો, પ્રિન્ટ કરો અને એક્સપોર્ટ કરો.' : 'Generate, track, print & export compliant GST invoices.'}
          </p>
        </div>

        <button
          onClick={() => navigate('/app/invoices/new')}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-text text-white rounded-xl text-xs font-bold shadow-md shadow-subtle transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" /> {isGu ? '+ નવું ઇનવોઇસ બનાવો' : 'Create New Invoice'}
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder={isGu ? 'ઇનવોઇસ નંબર અથવા ગ્રાહકના નામથી શોધો...' : 'Search invoice # or customer...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:shadow-focus text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium">{isGu ? 'સ્થિતિ:' : 'Status:'}</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            <option value="All">{isGu ? 'બધા ઇનવોઇસ' : 'All Invoices'}</option>
            <option value="paid">{isGu ? 'ચૂકવેલ (Paid)' : 'Paid'}</option>
            <option value="pending">{isGu ? 'પેન્ડિંગ (Pending)' : 'Pending'}</option>
            <option value="overdue">{isGu ? 'મુદ્દત વિતેલ (Overdue)' : 'Overdue'}</option>
          </select>
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">{isGu ? 'ઇનવોઇસ #' : 'Invoice #'}</th>
                <th className="py-3.5 px-4">{isGu ? 'ગ્રાહકનું નામ' : 'Customer Name'}</th>
                <th className="py-3.5 px-4">{isGu ? 'તારીખ' : 'Issue Date'}</th>
                <th className="py-3.5 px-4">{isGu ? 'છેલ્લી તારીખ' : 'Due Date'}</th>
                <th className="py-3.5 px-4 text-right">{isGu ? 'રકમ (₹)' : 'Amount (₹)'}</th>
                <th className="py-3.5 px-4 text-center">{isGu ? 'સ્થિતિ' : 'Status'}</th>
                <th className="py-3.5 px-4 text-right">{isGu ? 'ક્રિયાઓ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {filteredInvoices.map((inv) => {
                const isPaid = inv.status === 'paid';
                const isOverdue = inv.status === 'overdue';

                return (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-accent dark:text-text-muted">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {inv.customerName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{inv.issueDate}</td>
                    <td className="py-3.5 px-4 text-slate-500">{inv.dueDate}</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white">
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isPaid ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        isOverdue ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 text-slate-500 hover:text-accent rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="View / Download PDF"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setSelectedInvoice(inv); setTimeout(() => handleDownloadPDF(inv), 100); }}
                        className="p-1.5 text-accent hover:bg-bg-secondary dark:hover:bg-bg-secondary rounded-lg"
                        title="Download PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleWhatsAppShare(inv)}
                        className="p-1.5 text-text hover:bg-bg-secondary dark:hover:bg-bg-secondary rounded-lg"
                        title="Share on WhatsApp"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      {!isPaid && (
                        <button
                          onClick={() => updateInvoiceStatus(inv.id, 'paid')}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                        >
                          Paid
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail / Theme Styled Printable Modal View */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[20px] shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Controls Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 no-print">
              <div>
                <span className="text-xs font-bold text-slate-500">Invoice Preview</span>
                <span className="ml-2 px-2 py-0.5 bg-bg-secondary dark:bg-bg-secondary text-accent text-[10px] font-extrabold uppercase rounded-full">
                  Theme: {activeTheme.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={downloadingPdf}
                  onClick={() => handleDownloadPDF(selectedInvoice)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
                >
                  {downloadingPdf ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating PDF...
                    </>
                  ) : (
                    <>
                      <FileDown className="w-3.5 h-3.5" /> Download Theme PDF
                    </>
                  )}
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold"
                >
                  <Printer className="w-3.5 h-3.5" /> System Print
                </button>
                <button onClick={() => setSelectedInvoice(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dynamic Theme Styled Printable Invoice Container */}
            <div
              id="printable-invoice"
              className={`bg-white text-slate-900 ${
                activeTheme === 'tally' || activeTheme === 'gst_standard'
                  ? `border-2 ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'} rounded-none font-sans p-0 max-w-full shadow-lg`
                  : activeTheme === 'classic'
                  ? 'p-8 border-t-8 border-slate-900 rounded-none shadow-md font-serif space-y-6'
                  : activeTheme === 'minimal'
                  ? 'p-8 border-2 border-slate-900 rounded-none font-sans space-y-6'
                  : activeTheme === 'corporate'
                  ? 'p-8 border border-teal-200 rounded-[20px] shadow-lg font-sans space-y-6'
                  : 'p-8 border border-slate-200 rounded-[20px] shadow-sm font-sans space-y-6'
              }`}
            >
              {activeTheme === 'tally' || activeTheme === 'gst_standard' ? (
                <div className={`w-full divide-y ${activeTheme === 'tally' ? 'divide-slate-950' : 'divide-indigo-600'} text-[10px]`}>
                  {/* Tax Invoice Header */}
                  <div className={`relative text-center py-1.5 font-black text-xs uppercase tracking-wider text-white ${
                    activeTheme === 'tally' ? 'bg-slate-900' : 'bg-indigo-700'
                  }`}>
                    Tax Invoice
                    {selectedInvoice.copyTypes && selectedInvoice.copyTypes.length > 0 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-bold text-white flex flex-col items-end leading-tight">
                        {selectedInvoice.copyTypes.map(c => (
                          <span key={c}>{c.toUpperCase()}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Company Block */}
                  <div className="flex divide-x divide-inherit">
                    {company.logoUrl && (
                      <div className="w-1/4 p-3 flex flex-col justify-center items-center bg-slate-50/50">
                        <img src={company.logoUrl} alt="Logo" className="max-h-14 max-w-full object-contain" />
                      </div>
                    )}
                    <div className={`${company.logoUrl ? 'w-3/4' : 'w-full'} p-3 space-y-1`}>
                      <h2 className="text-sm font-extrabold tracking-tight uppercase text-slate-900">{company.name}</h2>
                      {company.tradeName && <p className="text-[9px] font-bold text-slate-500">Trade Name: {company.tradeName}</p>}
                      <p className="text-slate-600 leading-normal">{company.address}, {company.city}, {company.state} - {company.pincode}</p>
                      <p className="text-slate-500">Phone: {company.phone} | Email: {company.email}</p>
                      <div className="flex gap-4 pt-1 font-mono font-bold text-[9px]">
                        <span className="text-indigo-900">GSTIN: {company.gstin}</span>
                        {company.pan && <span className="text-slate-700">PAN: {company.pan}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Invoice Details & Transport Details */}
                  <div className="grid grid-cols-2 divide-x divide-inherit">
                    <div className="p-3 space-y-1">
                      <div><span className="text-slate-400 font-bold uppercase">Invoice No:</span> <strong className="font-mono text-slate-900 text-xs">{selectedInvoice.invoiceNumber}</strong></div>
                      <div><span className="text-slate-400 font-bold uppercase">Date:</span> <span className="font-bold">{selectedInvoice.issueDate}</span></div>
                      <div><span className="text-slate-400 font-bold uppercase">State Name:</span> <span className="font-bold">{company.state}</span></div>
                      <div><span className="text-slate-400 font-bold uppercase">Place of Supply:</span> <span className="font-bold">{selectedInvoice.customerName ? (customers?.find(c => c.id === selectedInvoice.customerId || c.name === selectedInvoice.customerName)?.state || company.state) : company.state}</span></div>
                    </div>
                    <div className="p-3 space-y-1">
                      {selectedInvoice.customHeaders && Array.isArray(selectedInvoice.customHeaders) && selectedInvoice.customHeaders.some(f => f.value) ? (
                        selectedInvoice.customHeaders
                          .filter(f => f.value)
                          .map((field, idx) => (
                            <div key={idx}>
                              <span className="text-slate-400 font-bold uppercase">{field.label}:</span>{' '}
                              <span className="font-semibold">{field.value}</span>
                            </div>
                          ))
                      ) : (
                        <>
                          <div><span className="text-slate-400 font-bold uppercase">Transport Mode:</span> <span className="font-semibold">Road</span></div>
                          <div><span className="text-slate-400 font-bold uppercase">Vehicle Number:</span> <span className="font-semibold">N/A</span></div>
                          <div><span className="text-slate-400 font-bold uppercase">Date & Time of Supply:</span> <span className="font-semibold">{selectedInvoice.issueDate}</span></div>
                          <div><span className="text-slate-400 font-bold uppercase">Terms of Delivery:</span> <span className="font-semibold">Immediate</span></div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Consignee (Billed to) & Consignee (Shipped to) */}
                  {(() => {
                    const cust = customers?.find(c => c.id === selectedInvoice.customerId || c.name === selectedInvoice.customerName) || {
                      name: selectedInvoice.customerName,
                      gstin: selectedInvoice.customerGstin || 'URP (Unregistered Client)',
                      address: 'N/A',
                      city: '',
                      state: '',
                      pincode: '',
                      pan: 'N/A'
                    };
                    return (
                      <div className="grid grid-cols-2 divide-x divide-inherit">
                        <div className="p-3 space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Billed To (Buyer)</span>
                          <h4 className="font-extrabold text-slate-900 text-[11px] uppercase">{cust.name}</h4>
                          <p className="text-slate-600 leading-normal">
                            {cust.address || 'N/A'}{cust.city ? ', ' + cust.city : ''}{cust.state ? ', ' + cust.state : ''}{cust.pincode ? ' - ' + cust.pincode : ''}
                          </p>
                          <p className="font-mono font-bold text-indigo-900 mt-1">GSTIN: {cust.gstin || 'URP'}</p>
                          {cust.pan && <p className="font-mono text-slate-500">PAN: {cust.pan}</p>}
                          <p className="text-slate-500">State Code: {cust.gstin && cust.gstin !== 'URP' ? cust.gstin.substring(0, 2) : 'N/A'}</p>
                        </div>
                        <div className="p-3 space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Shipped To (Consignee)</span>
                          <h4 className="font-extrabold text-slate-900 text-[11px] uppercase">{cust.name}</h4>
                          <p className="text-slate-600 leading-normal">
                            {cust.address || 'N/A'}{cust.city ? ', ' + cust.city : ''}{cust.state ? ', ' + cust.state : ''}{cust.pincode ? ' - ' + cust.pincode : ''}
                          </p>
                          <p className="font-mono font-bold text-indigo-900 mt-1">GSTIN: {cust.gstin || 'URP'}</p>
                          {cust.pan && <p className="font-mono text-slate-500">PAN: {cust.pan}</p>}
                          <p className="text-slate-500">State Code: {cust.gstin && cust.gstin !== 'URP' ? cust.gstin.substring(0, 2) : 'N/A'}</p>
                        </div>
                      </div>
                    );

                  })()}
                  {/* Items Table */}
                  <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-[9px] border-collapse">
                      <thead>
                        <tr className={`border-b ${activeTheme === 'tally' ? 'bg-slate-100 border-slate-950 text-slate-800' : 'bg-indigo-50 border-indigo-600 text-indigo-900'} font-bold uppercase`}>
                          <th className={`py-1.5 px-1.5 text-center w-6 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>Sl</th>
                          <th className={`py-1.5 px-1.5 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>Description</th>
                          <th className={`py-1.5 px-1.5 text-center border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>HSN/SAC</th>
                          <th className={`py-1.5 px-1.5 text-center border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>Qty</th>
                          <th className={`py-1.5 px-1.5 text-right border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>Rate</th>
                          <th className={`py-1.5 px-1.5 text-right border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>Disc</th>
                          <th className={`py-1.5 px-1.5 text-right border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>Taxable</th>
                          <th className={`py-1.5 px-1.5 text-right border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>CGST</th>
                          <th className={`py-1.5 px-1.5 text-right border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>SGST</th>
                          <th className={`py-1.5 px-1.5 text-right border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>IGST</th>
                          <th className="py-1.5 px-1.5 text-right">Amount (₹)</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${activeTheme === 'tally' ? 'divide-slate-200' : 'divide-indigo-100'}`}>
                        {selectedInvoice.items.map((item, idx) => {
                          const itemSub = Number(item.quantity) * Number(item.rate);
                          const discVal = item.discount || 0;
                          const discType = item.discountType || 'fixed';
                          const discAmt = discType === 'percent' ? itemSub * (Number(discVal) / 100) : Number(discVal);
                          const taxableVal = item.taxableValue !== undefined ? item.taxableValue : Math.max(0, itemSub - discAmt);
                          
                          const cgstRate = item.cgstRate !== undefined ? item.cgstRate : (selectedInvoice.igst > 0 ? 0 : (item.gstRate / 2 || 9));
                          const sgstRate = item.sgstRate !== undefined ? item.sgstRate : (selectedInvoice.igst > 0 ? 0 : (item.gstRate / 2 || 9));
                          const igstRate = item.igstRate !== undefined ? item.igstRate : (selectedInvoice.igst > 0 ? (item.gstRate || 18) : 0);

                          const cgstAmt = item.cgstAmount !== undefined ? item.cgstAmount : (taxableVal * (cgstRate / 100));
                          const sgstAmt = item.sgstAmount !== undefined ? item.sgstAmount : (taxableVal * (sgstRate / 100));
                          const igstAmt = item.igstAmount !== undefined ? item.igstAmount : (taxableVal * (igstRate / 100));
                          const lineAmt = item.taxableValue !== undefined ? (taxableVal + cgstAmt + sgstAmt + igstAmt) : item.amount;

                          return (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className={`py-2 px-1.5 text-center border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>{idx + 1}</td>
                              <td className={`py-2 px-1.5 border-r font-bold text-slate-800 ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>{item.description}</td>
                              <td className={`py-2 px-1.5 text-center font-mono border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>{item.hsnSac || '998314'}</td>
                              <td className={`py-2 px-1.5 text-center font-semibold border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>{item.quantity}</td>
                              <td className={`py-2 px-1.5 text-right font-semibold border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>₹{item.rate.toLocaleString('en-IN')}</td>
                              <td className={`py-2 px-1.5 text-right font-semibold border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>
                                {discVal > 0 ? `${discType === 'percent' ? '' : '₹'}${discVal}${discType === 'percent' ? '%' : ''}` : '-'}
                              </td>
                              <td className={`py-2 px-1.5 text-right font-semibold border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>₹{taxableVal.toLocaleString('en-IN')}</td>
                              <td className={`py-2 px-1.5 text-right border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>
                                {cgstRate > 0 ? `${cgstRate}% (${cgstAmt.toFixed(1)})` : '-'}
                              </td>
                              <td className={`py-2 px-1.5 text-right border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>
                                {sgstRate > 0 ? `${sgstRate}% (${sgstAmt.toFixed(1)})` : '-'}
                              </td>
                              <td className={`py-2 px-1.5 text-right border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>
                                {igstRate > 0 ? `${igstRate}% (${igstAmt.toFixed(1)})` : '-'}
                              </td>
                              <td className="py-2 px-1.5 text-right font-bold text-slate-900">₹{lineAmt.toLocaleString('en-IN')}</td>
                            </tr>
                          );
                        })}
                        {selectedInvoice.items.length < 4 && Array.from({ length: 4 - selectedInvoice.items.length }).map((_, i) => (
                          <tr key={`fill-${i}`} className="h-6">
                            <td className={`border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                            <td className={`border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                            <td className={`border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                            <td className={`border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                            <td className={`border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                            <td className={`border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                            <td className={`border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                            <td className={`border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                            <td className={`border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                            <td className={`border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                            <td></td>
                          </tr>
                        ))}
                        <tr className={`border-t font-black ${activeTheme === 'tally' ? 'bg-slate-50 border-slate-950' : 'bg-indigo-50/50 border-indigo-600'}`}>
                          <td className={`py-1.5 px-2 text-center border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`} colSpan="3">Total</td>
                          <td className={`py-1.5 px-2 text-center border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>{selectedInvoice.items.reduce((acc, i) => acc + Number(i.quantity), 0)}</td>
                          <td className={`border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                          <td className={`border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                          <td className={`py-1.5 px-2 text-right border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>₹{selectedInvoice.taxableAmount.toLocaleString('en-IN')}</td>
                          <td className={`py-1.5 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                          <td className={`py-1.5 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                          <td className={`py-1.5 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                          <td className="py-1.5 px-2 text-right text-slate-900">₹{selectedInvoice.grandTotal.toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Amount Chargeable in words */}
                  <div className="p-3">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Amount Chargeable (in words):</span>
                    <p className="font-extrabold text-slate-900 mt-0.5 text-[11px]">{numberToIndianWords(selectedInvoice.grandTotal)}</p>
                  </div>

                  {/* GST Tax Analysis Breakdown Table */}
                  <div className="p-0 overflow-x-auto divide-y divide-inherit">
                    <div className="p-1.5 bg-slate-50/80 font-bold text-[9px] uppercase tracking-wider text-slate-600 text-center">
                      Tax Amount Breakdown (GST Analysis)
                    </div>
                    <table className="w-full text-left text-[9px] border-collapse">
                      <thead>
                        <tr className={`border-b font-bold bg-slate-50 ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>
                          <th className={`py-1.5 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`} rowSpan="2">HSN/SAC</th>
                          <th className={`py-1.5 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'} text-right`} rowSpan="2">Taxable Value (₹)</th>
                          <th className={`py-1 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'} text-center`} colSpan="2">Central Tax (CGST)</th>
                          <th className={`py-1 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'} text-center`} colSpan="2">State Tax (SGST)</th>
                          <th className={`py-1 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'} text-center`} colSpan="2">Integrated Tax (IGST)</th>
                          <th className="py-1.5 px-2 text-right" rowSpan="2">Total Tax (₹)</th>
                        </tr>
                        <tr className={`border-b font-bold bg-slate-50 ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>
                          <th className={`py-1 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'} text-center`}>Rate</th>
                          <th className={`py-1 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'} text-right`}>Amount</th>
                          <th className={`py-1 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'} text-center`}>Rate</th>
                          <th className={`py-1 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'} text-right`}>Amount</th>
                          <th className={`py-1 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'} text-center`}>Rate</th>
                          <th className={`py-1 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'} text-right`}>Amount</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${activeTheme === 'tally' ? 'divide-slate-200' : 'divide-indigo-100'}`}>
                        {selectedInvoice.items.map((item, idx) => {
                          const itemSub = Number(item.quantity) * Number(item.rate);
                          const discVal = item.discount || 0;
                          const discType = item.discountType || 'fixed';
                          const discAmt = discType === 'percent' ? itemSub * (Number(discVal) / 100) : Number(discVal);
                          const taxableVal = item.taxableValue !== undefined ? item.taxableValue : Math.max(0, itemSub - discAmt);
                          
                          const cgstRate = item.cgstRate !== undefined ? item.cgstRate : (selectedInvoice.igst > 0 ? 0 : (item.gstRate / 2 || 9));
                          const sgstRate = item.sgstRate !== undefined ? item.sgstRate : (selectedInvoice.igst > 0 ? 0 : (item.gstRate / 2 || 9));
                          const igstRate = item.igstRate !== undefined ? item.igstRate : (selectedInvoice.igst > 0 ? (item.gstRate || 18) : 0);
                          
                          const cgstAmt = item.cgstAmount !== undefined ? item.cgstAmount : (taxableVal * (cgstRate / 100));
                          const sgstAmt = item.sgstAmount !== undefined ? item.sgstAmount : (taxableVal * (sgstRate / 100));
                          const igstAmt = item.igstAmount !== undefined ? item.igstAmount : (taxableVal * (igstRate / 100));
                          const totalGst = cgstAmt + sgstAmt + igstAmt;

                          return (
                            <tr key={idx} className="font-medium">
                              <td className={`py-1.5 px-2 border-r font-mono ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>{item.hsnSac || '998314'}</td>
                              <td className={`py-1.5 px-2 border-r text-right ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>₹{taxableVal.toLocaleString('en-IN')}</td>
                              <td className={`py-1.5 px-2 border-r text-center ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>{cgstRate}%</td>
                              <td className={`py-1.5 px-2 border-r text-right ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>₹{cgstAmt.toLocaleString('en-IN')}</td>
                              <td className={`py-1.5 px-2 border-r text-center ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>{sgstRate}%</td>
                              <td className={`py-1.5 px-2 border-r text-right ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>₹{sgstAmt.toLocaleString('en-IN')}</td>
                              <td className={`py-1.5 px-2 border-r text-center ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>{igstRate}%</td>
                              <td className={`py-1.5 px-2 border-r text-right ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>₹{igstAmt.toLocaleString('en-IN')}</td>
                              <td className="py-1.5 px-2 text-right font-bold">₹{totalGst.toLocaleString('en-IN')}</td>
                            </tr>
                          );
                        })}
                        <tr className="font-bold bg-slate-50">
                          <td className={`py-1.5 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>Total</td>
                          <td className={`py-1.5 px-2 border-r text-right ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>₹{selectedInvoice.taxableAmount.toLocaleString('en-IN')}</td>
                          <td className={`py-1.5 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                          <td className={`py-1.5 px-2 border-r text-right ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>₹{selectedInvoice.cgst.toLocaleString('en-IN')}</td>
                          <td className={`py-1.5 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                          <td className={`py-1.5 px-2 border-r text-right ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>₹{selectedInvoice.sgst.toLocaleString('en-IN')}</td>
                          <td className={`py-1.5 px-2 border-r ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}></td>
                          <td className={`py-1.5 px-2 border-r text-right ${activeTheme === 'tally' ? 'border-slate-950' : 'border-indigo-600'}`}>₹{selectedInvoice.igst.toLocaleString('en-IN')}</td>
                          <td className="py-1.5 px-2 text-right font-extrabold">₹{selectedInvoice.totalTax?.toLocaleString('en-IN') || (selectedInvoice.cgst + selectedInvoice.sgst + selectedInvoice.igst).toLocaleString('en-IN')}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Declaration, T&C & Calculations Grid */}
                  <div className="grid grid-cols-12 divide-x divide-inherit">
                    <div className="col-span-7 p-3 space-y-3">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Declaration:</span>
                        <p className="text-[9px] text-slate-600 leading-normal">
                          We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.
                        </p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Terms and Conditions:</span>
                        <p className="text-[8px] text-slate-500 leading-normal font-medium">
                          {selectedInvoice.terms || '1. Interest @ 18% p.a. will be charged if payment is not made within due date. 2. All disputes are subject to local jurisdiction.'}
                        </p>
                      </div>
                      
                      {company.bankDetails && (company.bankDetails.bankName || company.bankDetails.upiId) && (
                        <div className="text-[9px] text-slate-600 border-t pt-2 mt-2 leading-relaxed">
                          <p className="font-bold text-slate-900 uppercase">Bank Details:</p>
                          <p>Bank Name: <span className="font-semibold text-slate-800">{company.bankDetails.bankName}</span></p>
                          <p>Account Holder: <span className="font-semibold text-slate-800">{company.bankDetails.accountName}</span></p>
                          <p>Account Number: <span className="font-semibold text-slate-800 font-mono">{company.bankDetails.accountNumber}</span></p>
                          <p>IFSC Code: <span className="font-semibold text-slate-800 font-mono">{company.bankDetails.ifscCode}</span></p>
                          {company.bankDetails.branch && <p>Branch: <span className="font-semibold text-slate-800">{company.bankDetails.branch}</span></p>}
                        </div>
                      )}

                      <div className="p-2 border border-slate-200 bg-slate-50 flex items-center gap-3 w-fit rounded-lg">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Invoice: ${selectedInvoice.invoiceNumber}\nCompany: ${company.name}\nCustomer: ${selectedInvoice.customerName}\nDate: ${selectedInvoice.issueDate}\nTotal: ₹${selectedInvoice.grandTotal}`)}`} 
                          alt="QR Code" 
                          className="w-12 h-12"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-[9px]">UPI Payment QR</p>
                          <p className="font-mono font-semibold text-[9px] text-indigo-900">{company.bankDetails?.upiId}</p>
                          <p className="text-[8px] text-slate-400">Google Pay • PhonePe • Paytm</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-5 flex flex-col justify-between divide-y divide-inherit">
                      <div className="p-3 space-y-1.5">
                        <div className="flex justify-between text-slate-600 font-semibold">
                          <span>Taxable Value:</span>
                          <span className="text-slate-900">₹{selectedInvoice.taxableAmount.toLocaleString('en-IN')}</span>
                        </div>
                        {selectedInvoice.cgst > 0 && (
                          <div className="flex justify-between text-slate-600 font-semibold">
                            <span>Central Tax (CGST):</span>
                            <span className="text-slate-900">₹{selectedInvoice.cgst.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {selectedInvoice.sgst > 0 && (
                          <div className="flex justify-between text-slate-600 font-semibold">
                            <span>State Tax (SGST):</span>
                            <span className="text-slate-900">₹{selectedInvoice.sgst.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {selectedInvoice.igst > 0 && (
                          <div className="flex justify-between text-slate-600 font-semibold">
                            <span>Integrated Tax (IGST):</span>
                            <span className="text-slate-900">₹{selectedInvoice.igst.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {selectedInvoice.shipping > 0 && (
                          <div className="flex justify-between text-slate-600 font-semibold">
                            <span>Shipping Charges:</span>
                            <span className="text-slate-900">₹{selectedInvoice.shipping.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {selectedInvoice.packingCharge > 0 && (
                          <div className="flex justify-between text-slate-600 font-semibold">
                            <span>Packing Charges:</span>
                            <span className="text-slate-900">₹{selectedInvoice.packingCharge.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {selectedInvoice.handlingCharge > 0 && (
                          <div className="flex justify-between text-slate-600 font-semibold">
                            <span>Handling Charges:</span>
                            <span className="text-slate-900">₹{selectedInvoice.handlingCharge.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {selectedInvoice.loadingCharge > 0 && (
                          <div className="flex justify-between text-slate-600 font-semibold">
                            <span>Loading Charges:</span>
                            <span className="text-slate-900">₹{selectedInvoice.loadingCharge.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {selectedInvoice.insuranceCharge > 0 && (
                          <div className="flex justify-between text-slate-600 font-semibold">
                            <span>Insurance Charges:</span>
                            <span className="text-slate-900">₹{selectedInvoice.insuranceCharge.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {selectedInvoice.otherCharges > 0 && (
                          <div className="flex justify-between text-slate-600 font-semibold">
                            <span>Other Charges:</span>
                            <span className="text-slate-900">₹{selectedInvoice.otherCharges.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        {selectedInvoice.roundOff !== undefined && selectedInvoice.roundOff !== null && selectedInvoice.roundOff !== 0 && (
                          <div className="flex justify-between text-slate-600 font-semibold">
                            <span>Round Off:</span>
                            <span className="text-slate-900">
                              {selectedInvoice.roundOff >= 0 ? '+' : ''}₹{selectedInvoice.roundOff.toFixed(3)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-900 font-black text-xs pt-1 border-t border-slate-200">
                          <span>Grand Total:</span>
                          <span className="font-mono text-sm">₹{selectedInvoice.grandTotal.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      <div className="p-3 text-right flex flex-col justify-between h-full min-h-[120px]">
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold block uppercase">For {company.name}</span>
                        </div>
                        <div className="relative flex flex-col items-center justify-center pt-2">
                          {company.stampUrl && (
                            <img src={company.stampUrl} alt="Stamp" className="absolute opacity-50 max-h-12 max-w-full object-contain pointer-events-none" />
                          )}
                          {company.digitalSignatureUrl ? (
                            <img src={company.digitalSignatureUrl} alt="Signature" className="max-h-10 max-w-full object-contain" />
                          ) : (
                            <div className="h-10"></div>
                          )}
                        </div>
                        <div className="pt-2">
                          <span className="border-t border-dashed border-slate-400 pt-1 px-4 inline-block text-[9px] font-bold text-slate-600 uppercase tracking-wide">
                            Authorized Signatory
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Theme Header Banner */}
                  <div
                    className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      activeTheme === 'classic'
                        ? 'bg-slate-900 text-white rounded-lg'
                        : activeTheme === 'minimal'
                        ? 'bg-white text-slate-900 border-b-4 border-slate-900 rounded-none px-0 pt-0'
                        : activeTheme === 'corporate'
                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-2xl shadow-md'
                        : 'bg-gradient-to-r from-accent to-indigo-600 text-white rounded-2xl shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {company.logoUrl && (
                        <img src={company.logoUrl} alt="Logo" className="max-h-16 max-w-[120px] object-contain rounded bg-white p-1" />
                      )}
                      <div>
                        <h2 className={`text-2xl font-black ${activeTheme === 'minimal' ? 'text-black uppercase' : 'text-white'}`}>
                          {company.name}
                        </h2>
                        <p className={`text-xs mt-1 ${activeTheme === 'minimal' ? 'text-slate-600' : 'text-white/80'}`}>
                          {company.address}, {company.city}, {company.state} - {company.pincode}
                        </p>
                        <p className={`text-xs ${activeTheme === 'minimal' ? 'text-slate-600' : 'text-white/80'}`}>
                          Phone: {company.phone} • Email: {company.email}
                        </p>
                        <p className={`text-xs font-mono font-bold mt-1 ${activeTheme === 'minimal' ? 'text-blue-700' : 'text-amber-300'}`}>
                          GSTIN: {company.gstin}
                        </p>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="relative">
                        <span
                          className={`inline-block px-3 py-1 text-xs font-extrabold uppercase rounded-lg tracking-wider ${
                            activeTheme === 'classic'
                              ? 'bg-slate-800 text-white border border-slate-700'
                              : activeTheme === 'minimal'
                              ? 'bg-slate-900 text-white'
                              : activeTheme === 'corporate'
                              ? 'bg-teal-950/40 text-white border border-teal-400/30'
                              : 'bg-white/20 text-white backdrop-blur-sm'
                          }`}
                        >
                          TAX INVOICE
                        </span>
                        {selectedInvoice.copyTypes && selectedInvoice.copyTypes.length > 0 && (
                          <div className={`text-[8px] font-bold mt-1 ${activeTheme === 'minimal' ? 'text-slate-500' : 'text-white/70'}`}>
                            {selectedInvoice.copyTypes.join(' | ').toUpperCase()}
                          </div>
                        )}
                      </div>
                      <p className={`text-sm font-mono font-bold mt-2 ${activeTheme === 'minimal' ? 'text-black' : 'text-white'}`}>
                        {selectedInvoice.invoiceNumber}
                      </p>
                      <p className={`text-xs ${activeTheme === 'minimal' ? 'text-slate-600' : 'text-white/80'}`}>
                        Issue Date: {selectedInvoice.issueDate}
                      </p>
                      <p className={`text-xs ${activeTheme === 'minimal' ? 'text-slate-600' : 'text-white/80'}`}>
                        Due Date: {selectedInvoice.dueDate}
                      </p>
                    </div>
                  </div>

                  {/* Billed To Customer Info */}
                  <div
                    className={`grid grid-cols-2 gap-4 text-xs p-4 ${
                      activeTheme === 'classic'
                        ? 'bg-slate-100 border-l-4 border-slate-900 rounded-none'
                        : activeTheme === 'minimal'
                        ? 'bg-slate-50 border border-slate-900 rounded-none'
                        : activeTheme === 'corporate'
                        ? 'bg-teal-50/70 border border-teal-200 rounded-2xl'
                        : 'bg-slate-50 border border-slate-200 rounded-2xl'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Billed To Client</span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{selectedInvoice.customerName}</h4>
                      <p className="text-slate-600 font-mono mt-0.5">GSTIN: {selectedInvoice.customerGstin || 'URP (Unregistered Client)'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Details</span>
                      <p className={`font-extrabold text-xs uppercase mt-0.5 ${
                        activeTheme === 'corporate' ? 'text-teal-700' : 'text-blue-700'
                      }`}>
                        Status: {selectedInvoice.status}
                      </p>
                      <p className="text-slate-500 mt-0.5">Method: {selectedInvoice.paymentMethod || 'UPI / Bank Transfer'}</p>
                    </div>

                    {selectedInvoice.customHeaders && Array.isArray(selectedInvoice.customHeaders) && selectedInvoice.customHeaders.some(f => f.value) && (
                      <div className="col-span-2 grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-left">
                        {selectedInvoice.customHeaders
                          .filter(f => f.value)
                          .map((field, idx) => (
                            <div key={idx} className="flex justify-between sm:justify-start gap-2">
                              <span className="text-slate-400 font-bold uppercase">{field.label}:</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{field.value}</span>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Invoice Items Table */}
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead>
                      <tr
                        className={`border-b text-slate-600 font-bold uppercase tracking-wider ${
                          activeTheme === 'classic'
                            ? 'bg-slate-900 text-white'
                            : activeTheme === 'minimal'
                            ? 'border-b-2 border-slate-900 text-slate-900 font-mono'
                            : activeTheme === 'corporate'
                            ? 'bg-teal-50 text-teal-900'
                            : 'bg-bg-secondary text-blue-900'
                        }`}
                      >
                        <th className="py-2.5 px-3">Sl</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">HSN/SAC</th>
                        <th className="py-2.5 px-3 text-center">Qty</th>
                        <th className="py-2.5 px-3 text-right">Rate</th>
                        <th className="py-2.5 px-3 text-right">Disc</th>
                        <th className="py-2.5 px-3 text-right">Taxable</th>
                        <th className="py-2.5 px-3 text-right">CGST</th>
                        <th className="py-2.5 px-3 text-right">SGST</th>
                        <th className="py-2.5 px-3 text-right">IGST</th>
                        <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {selectedInvoice.items.map((item, idx) => {
                        const itemSub = Number(item.quantity) * Number(item.rate);
                        const discVal = item.discount || 0;
                        const discType = item.discountType || 'fixed';
                        const discAmt = discType === 'percent' ? itemSub * (Number(discVal) / 100) : Number(discVal);
                        const taxableVal = item.taxableValue !== undefined ? item.taxableValue : Math.max(0, itemSub - discAmt);
                        
                        const cgstRate = item.cgstRate !== undefined ? item.cgstRate : (selectedInvoice.igst > 0 ? 0 : (item.gstRate / 2 || 9));
                        const sgstRate = item.sgstRate !== undefined ? item.sgstRate : (selectedInvoice.igst > 0 ? 0 : (item.gstRate / 2 || 9));
                        const igstRate = item.igstRate !== undefined ? item.igstRate : (selectedInvoice.igst > 0 ? (item.gstRate || 18) : 0);

                        const cgstAmt = item.cgstAmount !== undefined ? item.cgstAmount : (taxableVal * (cgstRate / 100));
                        const sgstAmt = item.sgstAmount !== undefined ? item.sgstAmount : (taxableVal * (sgstRate / 100));
                        const igstAmt = item.igstAmount !== undefined ? item.igstAmount : (taxableVal * (igstRate / 100));
                        const lineAmt = item.taxableValue !== undefined ? (taxableVal + cgstAmt + sgstAmt + igstAmt) : item.amount;

                        return (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                            <td className="py-3 px-3">{idx + 1}</td>
                            <td className="py-3 px-3 font-semibold">{item.description}</td>
                            <td className="py-3 px-3 font-mono text-slate-600">{item.hsnSac || '998314'}</td>
                            <td className="py-3 px-3 text-center">{item.quantity}</td>
                            <td className="py-3 px-3 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-3 text-right">
                              {discVal > 0 ? `${discType === 'percent' ? '' : '₹'}${discVal}${discType === 'percent' ? '%' : ''}` : '-'}
                            </td>
                            <td className="py-3 px-3 text-right">₹{taxableVal.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-3 text-right">
                              {cgstRate > 0 ? `${cgstRate}% (${cgstAmt.toFixed(1)})` : '-'}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {sgstRate > 0 ? `${sgstRate}% (${sgstAmt.toFixed(1)})` : '-'}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {igstRate > 0 ? `${igstRate}% (${igstAmt.toFixed(1)})` : '-'}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-slate-900">₹{lineAmt.toLocaleString('en-IN')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Totals & UPI QR Code */}
                  <div className="pt-4 border-t border-slate-200 flex justify-between items-end gap-4">
                    
                    {/* UPI QR Box */}
                    <div
                      className={`p-3.5 border flex items-center gap-3 ${
                        activeTheme === 'corporate'
                          ? 'bg-teal-50/80 border-teal-200 rounded-2xl'
                          : activeTheme === 'classic'
                          ? 'bg-slate-50 border-slate-900 rounded-none'
                          : activeTheme === 'minimal'
                          ? 'bg-white border-2 border-slate-900 rounded-none'
                          : 'bg-slate-50 border-slate-200 rounded-2xl'
                      }`}
                    >
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`Invoice: ${selectedInvoice.invoiceNumber}\nCompany: ${company.name}\nCustomer: ${selectedInvoice.customerName}\nDate: ${selectedInvoice.issueDate}\nTotal: ₹${selectedInvoice.grandTotal}`)}`} 
                        alt="QR Code" 
                        className="w-12 h-12"
                      />
                      <div className="text-[10px] text-slate-600 text-left">
                        <p className="font-bold text-slate-900">Instant UPI Payment QR</p>
                        <p className="font-mono font-semibold text-accent">{company.bankDetails?.upiId}</p>
                        <p className="text-[9px] text-slate-400">Google Pay • PhonePe • Paytm</p>
                      </div>
                    </div>

                    {/* Calculation Summary */}
                    <div className="w-64 text-xs space-y-2 text-right">
                      <div className="flex justify-between text-slate-600">
                        <span>Taxable Amount:</span>
                        <span className="font-semibold">₹{selectedInvoice.taxableAmount.toLocaleString('en-IN')}</span>
                      </div>
                      {selectedInvoice.cgst > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Central Tax (CGST):</span>
                          <span className="font-semibold text-accent-soft">₹{selectedInvoice.cgst.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedInvoice.sgst > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>State Tax (SGST):</span>
                          <span className="font-semibold text-accent-soft">₹{selectedInvoice.sgst.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedInvoice.igst > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Integrated Tax (IGST):</span>
                          <span className="font-semibold text-accent-soft">₹{selectedInvoice.igst.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedInvoice.shipping > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Shipping Charges:</span>
                          <span className="font-semibold">₹{selectedInvoice.shipping.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedInvoice.packingCharge > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Packing Charges:</span>
                          <span className="font-semibold">₹{selectedInvoice.packingCharge.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedInvoice.handlingCharge > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Handling Charges:</span>
                          <span className="font-semibold">₹{selectedInvoice.handlingCharge.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedInvoice.loadingCharge > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Loading Charges:</span>
                          <span className="font-semibold">₹{selectedInvoice.loadingCharge.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedInvoice.insuranceCharge > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Insurance Charges:</span>
                          <span className="font-semibold">₹{selectedInvoice.insuranceCharge.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedInvoice.otherCharges > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Other Charges:</span>
                          <span className="font-semibold">₹{selectedInvoice.otherCharges.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {selectedInvoice.roundOff !== undefined && selectedInvoice.roundOff !== null && selectedInvoice.roundOff !== 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Round Off:</span>
                          <span className="font-semibold">
                            {selectedInvoice.roundOff >= 0 ? '+' : ''}₹{selectedInvoice.roundOff.toFixed(3)}
                          </span>
                        </div>
                      )}
                      <div
                        className={`flex justify-between items-center text-sm font-extrabold pt-2.5 border-t ${
                          activeTheme === 'minimal' ? 'border-slate-900 text-black font-mono' : 'border-slate-200'
                        }`}
                      >
                        <span className="text-slate-900">Grand Total:</span>
                        <span
                          className={`text-xl ${
                            activeTheme === 'corporate'
                              ? 'text-accent-soft'
                              : activeTheme === 'classic'
                              ? 'text-slate-900 font-serif'
                              : 'text-accent'
                          }`}
                        >
                          ₹{selectedInvoice.grandTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                  </div>

                  {/* Bank Details & Terms & Signatory Section */}
                  <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2 text-left">
                      {company.bankDetails && (company.bankDetails.bankName || company.bankDetails.upiId) && (
                        <div className="text-[10px] text-slate-600 leading-relaxed bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          <p className="font-bold text-slate-900 uppercase">Bank Account Details:</p>
                          <p>Bank Name: <span className="font-semibold text-slate-800">{company.bankDetails.bankName}</span></p>
                          <p>Account Holder: <span className="font-semibold text-slate-800">{company.bankDetails.accountName}</span></p>
                          <p>Account Number: <span className="font-semibold text-slate-800 font-mono">{company.bankDetails.accountNumber}</span></p>
                          <p>IFSC Code: <span className="font-semibold text-slate-800 font-mono">{company.bankDetails.ifscCode}</span></p>
                          {company.bankDetails.branch && <p>Branch: <span className="font-semibold text-slate-800">{company.bankDetails.branch}</span></p>}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-slate-700">Terms & Conditions:</p>
                        <p className="text-[10px] text-slate-500">{selectedInvoice.terms || '1. Goods once sold will not be taken back. 2. Subject to local jurisdiction.'}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end justify-between min-h-[120px] text-right">
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">For {company.name}</p>
                      </div>
                      <div className="relative flex flex-col items-center justify-center pt-2">
                        {company.stampUrl && (
                          <img src={company.stampUrl} alt="Stamp" className="absolute opacity-50 max-h-12 max-w-full object-contain pointer-events-none" />
                        )}
                        {company.digitalSignatureUrl ? (
                          <img src={company.digitalSignatureUrl} alt="Signature" className="max-h-10 max-w-full object-contain" />
                        ) : (
                          <div className="h-10"></div>
                        )}
                      </div>
                      <div className="pt-2">
                        <span className="border-t border-dashed border-slate-400 pt-1 px-4 inline-block text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                          Authorized Signatory
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                    <p>This is a computer-generated tax invoice issued by {company.name}.</p>
                    <p className="font-mono font-bold text-slate-500">Biizora AI Financial Platform</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
