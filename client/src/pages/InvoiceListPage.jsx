import React, { useState } from 'react';
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

export default function InvoiceListPage() {
  const { invoices, company, updateInvoiceStatus, showToast } = useBusiness();
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
            <FileText className="w-6 h-6 text-accent" /> GST Invoice Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Generate, track, print & export compliant GST invoices.</p>
        </div>

        <button
          onClick={() => navigate('/app/invoices/new')}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-text text-white rounded-xl text-xs font-bold shadow-md shadow-subtle transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" /> Create New Invoice
        </button>
      </div>

      {/* Filter & Search Controls */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search invoice # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:shadow-focus text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            <option value="All">All Invoices</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Invoices Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Issue Date</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4 text-right">Amount (₹)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
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
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        isPaid ? 'bg-emerald-100 dark:bg-bg-secondary text-text dark:text-text-muted' :
                        isOverdue ? 'bg-bg-hover dark:bg-red-950 text-text dark:text-red-400' :
                        'bg-amber-100 dark:bg-bg-hover text-accent-soft dark:text-text-muted'
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
              className={`p-8 bg-white text-slate-900 space-y-6 ${
                activeTheme === 'classic'
                  ? 'border-t-8 border-slate-900 rounded-none shadow-md font-serif'
                  : activeTheme === 'minimal'
                  ? 'border-2 border-slate-900 rounded-none font-sans'
                  : activeTheme === 'corporate'
                  ? 'border border-teal-200 rounded-[20px] shadow-lg font-sans'
                  : 'border border-slate-200 rounded-[20px] shadow-sm font-sans'
              }`}
            >
              
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

                <div className="text-right space-y-1">
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
              </div>

              {/* Invoice Items Table */}
              <table className="w-full text-left text-xs border-collapse">
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
                    <th className="py-2.5 px-3">Item Description</th>
                    <th className="py-2.5 px-3">HSN/SAC</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Rate</th>
                    <th className="py-2.5 px-3 text-right">GST %</th>
                    <th className="py-2.5 px-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-3 px-3 font-semibold">{item.description}</td>
                      <td className="py-3 px-3 font-mono text-slate-600">{item.hsnSac}</td>
                      <td className="py-3 px-3 text-center">{item.quantity}</td>
                      <td className="py-3 px-3 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-right">{item.gstRate}%</td>
                      <td className="py-3 px-3 text-right font-bold text-slate-900">₹{item.amount.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
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
                  <QrCode className={`w-12 h-12 ${activeTheme === 'corporate' ? 'text-teal-700' : 'text-slate-900'}`} />
                  <div className="text-[10px] text-slate-600">
                    <p className="font-bold text-slate-900">Instant UPI Payment QR</p>
                    <p className="font-mono font-semibold text-accent">{company.bankDetails.upiId}</p>
                    <p className="text-[9px] text-slate-400">Google Pay • PhonePe • Paytm</p>
                  </div>
                </div>

                {/* Calculation Summary */}
                <div className="w-64 text-xs space-y-2 text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Amount:</span>
                    <span className="font-semibold">₹{selectedInvoice.taxableAmount.toLocaleString('en-IN')}</span>
                  </div>
                  {selectedInvoice.igst > 0 ? (
                    <div className="flex justify-between text-slate-600">
                      <span>IGST (18%):</span>
                      <span className="font-semibold text-accent-soft">₹{selectedInvoice.igst.toLocaleString('en-IN')}</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>CGST (9%):</span>
                        <span className="font-semibold text-accent-soft">₹{selectedInvoice.cgst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>SGST (9%):</span>
                        <span className="font-semibold text-accent-soft">₹{selectedInvoice.sgst.toLocaleString('en-IN')}</span>
                      </div>
                    </>
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

              {/* Terms & Footer Stamp */}
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
                <p>This is a computer-generated tax invoice issued by {company.name}. No signature required.</p>
                <p className="font-mono font-bold text-slate-500">Biizora AI Financial Platform</p>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
