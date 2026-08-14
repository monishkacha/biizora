import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';
import PrintableInvoice from '../../components/stationery/PrintableInvoice';
import {
  FileText,
  Search,
  Printer,
  Download,
  Share2,
  X,
  Plus,
  Receipt,
  Filter,
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function StationeryBillsPage() {
  const { invoices, company, stationerySettings, updateInvoiceStatus, showToast } = useBusiness();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [printFormat, setPrintFormat] = useState('a4');

  const filteredInvoices = (invoices || []).filter((inv) => {
    const matchesSearch =
      !searchQuery ||
      inv.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.customerPhone?.includes(searchQuery);
    const matchesStatus = !statusFilter || inv.status === statusFilter;
    const matchesType = !typeFilter || inv.invoiceType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handlePrint = async (inv) => {
    setSelectedInvoice(inv);
    await new Promise((resolve) => requestAnimationFrame(resolve));
    window.print();
  };

  const handleDownloadPDF = async (inv) => {
    setSelectedInvoice(inv);
    showToast('Generating PDF...');
    try {
      const element = document.getElementById('printable-invoice');
      if (!element) return;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${inv.invoiceNumber || 'INV'}.pdf`);
      showToast('PDF Downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('PDF download failed', 'error');
    }
  };

  const handleWhatsApp = (inv) => {
    const phoneRaw = inv.customerPhone || '';
    const cleanPhone = String(phoneRaw).replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      showToast('Please add customer mobile number to share invoice on WhatsApp.', 'warning');
      return;
    }
    const formattedPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    const msg = encodeURIComponent(
      `Hello ${inv.customerName || 'Customer'},\nThank you for shopping at ${company?.name || 'PageCraft Stationery'}!\n\nInvoice No: ${inv.invoiceNumber}\nAmount: ₹${Number(inv.grandTotal || 0).toFixed(2)}\nStatus: ${inv.status || 'Paid'}\n\nHave a great day!`
    );
    window.open(`https://wa.me/${formattedPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[20px] border border-stone shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-bottle text-white flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal">Stationery Bills History</h1>
            <p className="text-xs text-warm-gray">Manage counter POS bills, invoices, print, & WhatsApp</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/app/stationery/billing')}
          className="bz-btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create New Bill
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-[18px] border border-stone shadow-subtle flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-warm-gray absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by Bill No, customer name, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bz-input pl-10 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bz-input w-36 text-xs"
          >
            <option value="">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bz-input w-36 text-xs"
          >
            <option value="">All Types</option>
            <option value="retail">Retail</option>
            <option value="xerox">Xerox & Print</option>
            <option value="school">School Order</option>
          </select>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white border border-stone rounded-[20px] shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="bz-table">
            <thead>
              <tr>
                <th>Bill Number</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Type</th>
                <th>Items Count</th>
                <th className="text-right">Grand Total</th>
                <th className="text-center">Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-warm-gray py-12">
                    No bills found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id || inv._id}>
                    <td className="font-bold text-charcoal">{inv.invoiceNumber}</td>
                    <td>
                      <p className="font-semibold text-charcoal">{inv.customerName || 'Walk-in'}</p>
                      {inv.customerPhone && <p className="text-[10px] text-warm-gray">{inv.customerPhone}</p>}
                    </td>
                    <td className="text-xs text-warm-gray">
                      {inv.issueDate ? String(inv.issueDate).slice(0, 10) : 'Today'}
                    </td>
                    <td>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-cream text-warm-gray border border-stone">
                        {inv.invoiceType || 'Retail'}
                      </span>
                    </td>
                    <td className="text-xs text-warm-gray">{(inv.items || []).length} items</td>
                    <td className="text-right font-bold text-charcoal">₹{Number(inv.grandTotal || 0).toFixed(2)}</td>
                    <td className="text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-100 text-amber-900 border border-amber-300'
                        }`}
                      >
                        {inv.status || 'Paid'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 bg-cream hover:bg-stone/40 text-charcoal rounded-lg text-xs"
                          title="View / Print"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(inv)}
                          className="p-1.5 bg-cream hover:bg-stone/40 text-charcoal rounded-lg text-xs"
                          title="Download PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleWhatsApp(inv)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs"
                          title="WhatsApp Share"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill View / Print Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] max-w-3xl w-full p-6 shadow-elev space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-stone pb-4">
              <h3 className="text-base font-bold text-charcoal">Bill #{selectedInvoice.invoiceNumber}</h3>
              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="p-1.5 rounded-full hover:bg-cream text-warm-gray"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 bg-cream/60 p-3 rounded-2xl border border-stone">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePrint(selectedInvoice)}
                  className="px-4 py-2 bg-green-bottle hover:bg-green-forest text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadPDF(selectedInvoice)}
                  className="px-4 py-2 bg-white text-charcoal border border-stone hover:bg-cream rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-4 h-4" /> PDF
                </button>
                <button
                  type="button"
                  onClick={() => handleWhatsApp(selectedInvoice)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Share2 className="w-4 h-4" /> WhatsApp
                </button>
              </div>

              {selectedInvoice.status !== 'paid' && (
                <button
                  type="button"
                  onClick={async () => {
                    await updateInvoiceStatus(selectedInvoice.id || selectedInvoice._id, 'paid');
                    setSelectedInvoice((prev) => ({ ...prev, status: 'paid', balanceDue: 0 }));
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold"
                >
                  Mark Paid
                </button>
              )}
            </div>

            <div className="border border-stone rounded-2xl p-4 bg-gray-50/50 max-h-[460px] overflow-y-auto">
              <PrintableInvoice
                invoice={selectedInvoice}
                company={company}
                settings={stationerySettings}
                format={printFormat}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
