import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';
import { PRINT_SERVICES } from '../../config/workspaceFeatures';
import {
  Printer,
  Plus,
  ArrowRight,
  Receipt,
  Sparkles,
  Layers,
  FileText,
} from 'lucide-react';

export default function StationeryPrintXeroxPage() {
  const { invoices } = useBusiness();
  const navigate = useNavigate();

  const [selectedService, setSelectedService] = useState(PRINT_SERVICES[0]);
  const [pageCount, setPageCount] = useState(10);
  const [customRate, setCustomRate] = useState(PRINT_SERVICES[0].defaultRate);

  const calculateTotal = () => {
    return (Number(pageCount) || 1) * (Number(customRate) || 0);
  };

  const handleSendToBilling = () => {
    navigate('/app/stationery/billing');
  };

  // Service revenue analytics
  const serviceInvoices = (invoices || []).filter((i) =>
    (i.items || []).some((item) => item.itemType === 'service')
  );

  const totalServiceRevenue = serviceInvoices.reduce((sum, inv) => {
    const srvTotal = (inv.items || [])
      .filter((item) => item.itemType === 'service')
      .reduce((s, item) => s + (item.amount || item.quantity * item.rate || 0), 0);
    return sum + srvTotal;
  }, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[20px] border border-stone shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal">Xerox, Print & Lamination Counter</h1>
            <p className="text-xs text-warm-gray">Document printing, copying, lamination & spiral binding service pricing</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSendToBilling}
          className="bz-btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
        >
          <Receipt className="w-4 h-4" /> Open POS Billing Counter
        </button>
      </div>

      {/* Main Grid: Services Catalog & Quick Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Services Catalog (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone rounded-[20px] shadow-subtle p-5 space-y-4">
          <h2 className="text-sm font-bold text-charcoal flex items-center gap-2 border-b border-stone pb-3">
            <Layers className="w-4 h-4 text-teal-600" /> Service Pricing Catalog
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PRINT_SERVICES.map((srv) => (
              <div
                key={srv.serviceType}
                onClick={() => {
                  setSelectedService(srv);
                  setCustomRate(srv.defaultRate);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center ${
                  selectedService.serviceType === srv.serviceType
                    ? 'bg-teal-50 border-teal-500 shadow-xs'
                    : 'bg-cream/40 border-stone hover:border-teal-300'
                }`}
              >
                <div>
                  <h3 className="text-xs font-bold text-charcoal">{srv.name}</h3>
                  <p className="text-[10px] text-warm-gray mt-0.5">Unit: 1 {srv.unit}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-teal-800">₹{srv.defaultRate}</span>
                  <span className="text-[10px] text-warm-gray block">/ {srv.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Job Calculator (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-stone rounded-[20px] shadow-card p-5 space-y-4">
            <h2 className="text-sm font-bold text-charcoal flex items-center gap-2 border-b border-stone pb-3">
              <Sparkles className="w-4 h-4 text-yellow-honey" /> Quick Service Job Calculator
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Selected Service</label>
                <select
                  value={selectedService.serviceType}
                  onChange={(e) => {
                    const found = PRINT_SERVICES.find((s) => s.serviceType === e.target.value);
                    if (found) {
                      setSelectedService(found);
                      setCustomRate(found.defaultRate);
                    }
                  }}
                  className="bz-input font-bold"
                >
                  {PRINT_SERVICES.map((srv) => (
                    <option key={srv.serviceType} value={srv.serviceType}>
                      {srv.name} (₹{srv.defaultRate} / {srv.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Number of {selectedService.unit}s</label>
                  <input
                    type="number"
                    min="1"
                    value={pageCount}
                    onChange={(e) => setPageCount(Math.max(1, Number(e.target.value)))}
                    className="bz-input font-bold text-center"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Rate per {selectedService.unit} (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={customRate}
                    onChange={(e) => setCustomRate(Number(e.target.value))}
                    className="bz-input font-bold"
                  />
                </div>
              </div>

              <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 text-center space-y-1">
                <span className="text-[10px] uppercase font-bold text-teal-700">Calculated Job Total</span>
                <p className="text-2xl font-bold text-teal-900 font-display">₹{calculateTotal().toFixed(2)}</p>
                <p className="text-[11px] text-teal-800">
                  {pageCount} {selectedService.unit}s @ ₹{customRate}/{selectedService.unit}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendToBilling}
                className="w-full py-3 bg-green-bottle hover:bg-green-forest text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-subtle transition-all"
              >
                Add to POS Counter Bill <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Revenue Snapshot */}
          <div className="bg-white border border-stone rounded-[20px] shadow-subtle p-5 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-warm-gray">Total Service Revenue</h3>
            <p className="text-xl font-bold text-charcoal font-display">₹{Number(totalServiceRevenue).toLocaleString('en-IN')}</p>
            <p className="text-[11px] text-warm-gray">{serviceInvoices.length} Xerox & Print invoices generated</p>
          </div>
        </div>
      </div>
    </div>
  );
}
