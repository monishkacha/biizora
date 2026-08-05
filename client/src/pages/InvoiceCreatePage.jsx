import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../context/BusinessContext';
import {
  FileText,
  Plus,
  Trash2,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Building,
  QrCode,
  DollarSign,
  UserPlus,
  X
} from 'lucide-react';

export default function InvoiceCreatePage() {
  const { customers, addCustomer, products, company, generateInvoiceNumber, createInvoice } = useBusiness();
  const navigate = useNavigate();

  const [invoiceNumber] = useState(() => generateInvoiceNumber());
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [notes, setNotes] = useState('Payment requested within due date. Thank you for your business!');
  const [terms, setTerms] = useState('18% p.a. interest charged on delayed payments beyond 30 days.');

  // Quick Customer Add Modal State
  const [quickCustModalOpen, setQuickCustModalOpen] = useState(false);
  const [quickCustData, setQuickCustData] = useState({
    name: '',
    phone: '',
    gstin: '',
    city: 'Bengaluru',
    state: 'Karnataka'
  });

  const [packingCharge, setPackingCharge] = useState(0);
  const [handlingCharge, setHandlingCharge] = useState(0);
  const [loadingCharge, setLoadingCharge] = useState(0);
  const [insuranceCharge, setInsuranceCharge] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [roundOffEnabled, setRoundOffEnabled] = useState(false);
  const [status, setStatus] = useState('pending');

  const [customHeaders, setCustomHeaders] = useState([
    { label: 'Reference Number', value: '' },
    { label: 'Purchase Order Number', value: '' },
    { label: 'Transport Name', value: '' },
    { label: 'Vehicle Number', value: '' },
    { label: 'E-Way Bill Number', value: '' },
    { label: 'Delivery Terms', value: '' }
  ]);

  const [copyTypes, setCopyTypes] = useState([]);

  // Line items state
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];
  const isIgst = selectedCustomer && company
    ? (selectedCustomer.state || '').trim().toLowerCase() !== (company.state || '').trim().toLowerCase()
    : (selectedCustomer ? selectedCustomer.isIgst : false);

  const [items, setItems] = useState([
    {
      id: `item-${Date.now()}`,
      description: products[0]?.name || 'SaaS Subscription',
      hsnSac: products[0]?.hsnSac || '998314',
      quantity: 1,
      rate: products[0]?.sellingPrice || 49999,
      discount: 0,
      discountType: 'fixed',
      cgstRate: isIgst ? 0 : 9,
      sgstRate: isIgst ? 0 : 9,
      igstRate: isIgst ? 18 : 0
    }
  ]);

  const handleQuickAddCustomerSubmit = (e) => {
    e.preventDefault();
    if (!quickCustData.name.trim()) return;

    const isIgstState = (quickCustData.state || '').trim().toLowerCase() !== (company?.state || 'Karnataka').trim().toLowerCase();
    const newCust = addCustomer({
      name: quickCustData.name.trim(),
      contactPerson: quickCustData.name.trim(),
      email: `${quickCustData.name.toLowerCase().replace(/\s+/g, '')}@client.com`,
      phone: quickCustData.phone || '+91 99000 00000',
      gstin: quickCustData.gstin.trim() ? quickCustData.gstin.trim().toUpperCase() : 'URP (Unregistered Client)',
      pan: 'N/A',
      city: quickCustData.city || 'Bengaluru',
      state: quickCustData.state || 'Karnataka',
      isIgst: isIgstState,
      category: 'Retailer',
      address: ''
    });

    if (newCust && newCust.id) {
      setSelectedCustomerId(newCust.id);
    }
    setQuickCustModalOpen(false);
    setQuickCustData({ name: '', phone: '', gstin: '', city: 'Bengaluru', state: 'Karnataka' });
  };

  const addItem = () => {
    setItems(prev => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: '',
        hsnSac: '998314',
        quantity: 1,
        rate: 1000,
        discount: 0,
        discountType: 'fixed',
        cgstRate: isIgst ? 0 : 9,
        sgstRate: isIgst ? 0 : 9,
        igstRate: isIgst ? 18 : 0
      }
    ]);
  };

  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  };

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleSelectProduct = (itemId, prodId) => {
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setItems(prev => prev.map(i => i.id === itemId ? {
        ...i,
        description: prod.name,
        hsnSac: prod.hsnSac,
        rate: prod.sellingPrice,
        cgstRate: isIgst ? 0 : (prod.gstRate / 2),
        sgstRate: isIgst ? 0 : (prod.gstRate / 2),
        igstRate: isIgst ? prod.gstRate : 0
      } : i));
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);

  const totalDiscount = items.reduce((sum, item) => {
    const itemSub = Number(item.quantity) * Number(item.rate);
    const disc = item.discountType === 'percent' ? itemSub * (Number(item.discount || 0) / 100) : Number(item.discount || 0);
    return sum + disc;
  }, 0);

  const taxableAmount = Math.max(0, subtotal - totalDiscount);

  const cgstTotal = items.reduce((sum, item) => {
    const itemSub = Number(item.quantity) * Number(item.rate);
    const disc = item.discountType === 'percent' ? itemSub * (Number(item.discount || 0) / 100) : Number(item.discount || 0);
    const taxVal = Math.max(0, itemSub - disc);
    return sum + (taxVal * (Number(item.cgstRate || 0) / 100));
  }, 0);

  const sgstTotal = items.reduce((sum, item) => {
    const itemSub = Number(item.quantity) * Number(item.rate);
    const disc = item.discountType === 'percent' ? itemSub * (Number(item.discount || 0) / 100) : Number(item.discount || 0);
    const taxVal = Math.max(0, itemSub - disc);
    return sum + (taxVal * (Number(item.sgstRate || 0) / 100));
  }, 0);

  const igstTotal = items.reduce((sum, item) => {
    const itemSub = Number(item.quantity) * Number(item.rate);
    const disc = item.discountType === 'percent' ? itemSub * (Number(item.discount || 0) / 100) : Number(item.discount || 0);
    const taxVal = Math.max(0, itemSub - disc);
    return sum + (taxVal * (Number(item.igstRate || 0) / 100));
  }, 0);

  const totalTax = cgstTotal + sgstTotal + igstTotal;

  const rawGrandTotal = taxableAmount + totalTax + Number(shipping) + Number(packingCharge) + Number(handlingCharge) + Number(loadingCharge) + Number(insuranceCharge) + Number(otherCharges);

  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOffAmount = roundOffEnabled ? (roundedGrandTotal - rawGrandTotal) : 0;
  const grandTotal = roundOffEnabled ? roundedGrandTotal : rawGrandTotal;

  const handleSaveInvoice = (statusParam = 'pending') => {
    if (!selectedCustomer) return;

    const invoicePayload = {
      invoiceNumber,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerGstin: selectedCustomer.gstin,
      issueDate,
      dueDate,
      items: items.map(i => {
        const itemSub = Number(i.quantity) * Number(i.rate);
        const discAmount = i.discountType === 'percent' ? itemSub * (Number(i.discount || 0) / 100) : Number(i.discount || 0);
        const taxVal = Math.max(0, itemSub - discAmount);

        return {
          ...i,
          amount: itemSub,
          discount: Number(i.discount || 0),
          discountType: i.discountType || 'fixed',
          taxableValue: taxVal,
          cgstRate: Number(i.cgstRate || 0),
          sgstRate: Number(i.sgstRate || 0),
          igstRate: Number(i.igstRate || 0),
          cgstAmount: taxVal * (Number(i.cgstRate || 0) / 100),
          sgstAmount: taxVal * (Number(i.sgstRate || 0) / 100),
          igstAmount: taxVal * (Number(i.igstRate || 0) / 100),
          totalGst: (taxVal * (Number(i.cgstRate || 0) / 100)) + (taxVal * (Number(i.sgstRate || 0) / 100)) + (taxVal * (Number(i.igstRate || 0) / 100))
        };
      }),
      subtotal,
      discount: totalDiscount,
      taxableAmount,
      cgst: cgstTotal,
      sgst: sgstTotal,
      igst: igstTotal,
      totalTax,
      shippingCharge: Number(shipping),
      packingCharge: Number(packingCharge),
      handlingCharge: Number(handlingCharge),
      loadingCharge: Number(loadingCharge),
      insuranceCharge: Number(insuranceCharge),
      otherCharges: Number(otherCharges),
      roundOffEnabled,
      roundOffAmount,
      customHeaders,
      copyTypes,
      grandTotal,
      status: statusParam === 'draft' ? 'draft' : status,
      notes,
      terms
    };

    createInvoice(invoicePayload);
    navigate('/app/invoices');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/app/invoices')} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </button>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSaveInvoice('draft')}
            className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-100"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSaveInvoice('pending')}
            className="px-5 py-2 bg-accent hover:bg-text text-white rounded-xl text-xs font-bold shadow-md shadow-subtle transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Generate & Save Invoice
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="p-8 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-card space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{company.name}</h2>
            <p className="text-xs text-slate-400">GSTIN: <span className="font-mono text-accent">{company.gstin}</span></p>
          </div>

          <div className="space-y-2 text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">INVOICE NUMBER</span>
            <input
              type="text"
              value={invoiceNumber}
              readOnly
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm font-bold text-accent text-right"
            />
          </div>
        </div>

        {/* Customer & Date Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Select Customer</label>
              <button
                type="button"
                onClick={() => setQuickCustModalOpen(true)}
                className="text-[11px] font-bold text-accent dark:text-text-muted hover:underline flex items-center gap-1"
              >
                <UserPlus className="w-3 h-3" /> + Quick Add Customer
              </button>
            </div>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.city}, {c.state})</option>
              ))}
            </select>
            {selectedCustomer && (
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                GSTIN: {selectedCustomer.gstin} • Tax Type: <strong className="text-blue-500">{isIgst ? 'IGST (Interstate)' : 'CGST + SGST (Intrastate)'}</strong>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Issue Date</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            />
          </div>
        </div>

        {/* Custom Header Fields & Copy Type */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Custom Header Fields (Editable Labels)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
            {customHeaders.map((field, idx) => (
              <div key={idx} className="space-y-1">
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomHeaders(prev => prev.map((f, i) => i === idx ? { ...f, label: val } : f));
                  }}
                  className="bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:border-accent text-slate-500 font-semibold text-[10px] uppercase tracking-wider focus:outline-none w-full"
                  placeholder="Header Label"
                />
                <input
                  type="text"
                  value={field.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomHeaders(prev => prev.map((f, i) => i === idx ? { ...f, value: val } : f));
                  }}
                  placeholder={`Enter ${field.label}...`}
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          {/* Invoice Copy Types */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Invoice Copy Type</label>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              {['Original For Recipient', 'Duplicate For Transporter', 'Duplicate For Supplier', "Owner's Extra Copy"].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={copyTypes.includes(opt)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setCopyTypes(prev => [...prev, opt]);
                      } else {
                        setCopyTypes(prev => prev.filter(c => c !== opt));
                      }
                    }}
                    className="rounded border-slate-300 text-accent focus:ring-accent"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Status Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
            >
              <option value="pending">Pending / Unpaid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Dynamic Line Items */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Line Items & GST Slabs</h3>
          
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-12 gap-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-4">Item Description</div>
            <div className="col-span-2 text-center">HSN/SAC</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-3 text-right">Rate (₹)</div>
            <div className="col-span-1"></div>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => {
              const itemSub = Number(item.quantity) * Number(item.rate);
              const discAmount = item.discountType === 'percent' ? itemSub * (Number(item.discount || 0) / 100) : Number(item.discount || 0);
              const taxVal = Math.max(0, itemSub - discAmount);
              const cgstVal = taxVal * (Number(item.cgstRate || 0) / 100);
              const sgstVal = taxVal * (Number(item.sgstRate || 0) / 100);
              const igstVal = taxVal * (Number(item.igstRate || 0) / 100);
              const lineTotal = taxVal + cgstVal + sgstVal + igstVal;

              return (
                <div key={item.id} className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs space-y-3">
                  
                  {/* Row 1: Description, HSN, Qty, Rate, Delete */}
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4 space-y-1">
                      <select
                        onChange={(e) => handleSelectProduct(item.id, e.target.value)}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px]"
                      >
                        <option value="">-- Load from Catalog --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (₹{p.sellingPrice})</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Description..."
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-medium"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block md:hidden text-[9px] font-bold text-slate-400 mb-0.5">HSN/SAC</label>
                      <input
                        type="text"
                        placeholder="HSN/SAC"
                        value={item.hsnSac}
                        onChange={(e) => updateItem(item.id, 'hsnSac', e.target.value)}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-center"
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block md:hidden text-[9px] font-bold text-slate-400 mb-0.5">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block md:hidden text-[9px] font-bold text-slate-400 mb-0.5">Rate (₹)</label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                        className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-right font-bold"
                      />
                    </div>

                    <div className="col-span-1 flex items-center justify-end">
                      <button onClick={() => removeItem(item.id)} className="p-1.5 text-slate-400 hover:text-accent-soft mt-4 md:mt-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Row 2: Discount & Individual CGST, SGST, IGST inputs */}
                  <div className="grid grid-cols-12 gap-3 items-center pt-2 border-t border-slate-100 dark:border-slate-800">
                    
                    {/* Discount Input & Type Selector */}
                    <div className="col-span-3">
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Discount</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min="0"
                          max={item.discountType === 'percent' ? 100 : itemSub}
                          value={item.discount || 0}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            const maxDisc = item.discountType === 'percent' ? 100 : itemSub;
                            updateItem(item.id, 'discount', Math.min(val, maxDisc));
                          }}
                          className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-right"
                        />
                        <select
                          value={item.discountType || 'fixed'}
                          onChange={(e) => updateItem(item.id, 'discountType', e.target.value)}
                          className="px-1.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-bold"
                        >
                          <option value="fixed">Fixed (₹)</option>
                          <option value="percent">Percent (%)</option>
                        </select>
                      </div>
                    </div>

                    {/* CGST % Input */}
                    <div className="col-span-2">
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">CGST %</label>
                      <input
                        type="number"
                        min="0"
                        value={item.cgstRate || 0}
                        onChange={(e) => updateItem(item.id, 'cgstRate', Math.max(0, Number(e.target.value)))}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold"
                      />
                    </div>

                    {/* SGST % Input */}
                    <div className="col-span-2">
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">SGST %</label>
                      <input
                        type="number"
                        min="0"
                        value={item.sgstRate || 0}
                        onChange={(e) => updateItem(item.id, 'sgstRate', Math.max(0, Number(e.target.value)))}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold"
                      />
                    </div>

                    {/* IGST % Input */}
                    <div className="col-span-2">
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">IGST %</label>
                      <input
                        type="number"
                        min="0"
                        value={item.igstRate || 0}
                        onChange={(e) => updateItem(item.id, 'igstRate', Math.max(0, Number(e.target.value)))}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold"
                      />
                    </div>

                    {/* Final Line Total calculated amount */}
                    <div className="col-span-3 text-right">
                      <label className="block text-[9px] font-bold text-slate-400 mb-1">Line Total</label>
                      <span className="font-extrabold text-sm text-accent">
                        ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-secondary dark:bg-bg-secondary text-accent dark:text-blue-300 rounded-xl text-xs font-bold hover:bg-bg-secondary transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Another Line Item
          </button>
        </div>

        {/* Calculation Summary Footer */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Invoice Notes</label>
              <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Terms & Conditions</label>
              <textarea rows={2} value={terms} onChange={(e) => setTerms(e.target.value)} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
            </div>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Subtotal Amount:</span>
              <span className="font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-300">
              <span>Total Discount:</span>
              <span className="font-semibold text-accent-soft">-₹{totalDiscount.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between text-slate-600 dark:text-slate-300 border-t pt-1">
              <span>Taxable Amount:</span>
              <span className="font-bold">₹{taxableAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
              {cgstTotal > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Central Tax (CGST):</span>
                  <span className="font-semibold text-accent-soft">₹{cgstTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              {sgstTotal > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>State Tax (SGST):</span>
                  <span className="font-semibold text-accent-soft">₹{sgstTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              {igstTotal > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Integrated Tax (IGST):</span>
                  <span className="font-semibold text-accent-soft">₹{igstTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Shipping Charges (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={shipping}
                  onChange={(e) => setShipping(Math.max(0, Number(e.target.value)))}
                  className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border rounded text-right font-semibold"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Packing Charges (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={packingCharge}
                  onChange={(e) => setPackingCharge(Math.max(0, Number(e.target.value)))}
                  className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border rounded text-right font-semibold"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Handling Charges (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={handlingCharge}
                  onChange={(e) => setHandlingCharge(Math.max(0, Number(e.target.value)))}
                  className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border rounded text-right font-semibold"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Loading Charges (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={loadingCharge}
                  onChange={(e) => setLoadingCharge(Math.max(0, Number(e.target.value)))}
                  className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border rounded text-right font-semibold"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Insurance Charges (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={insuranceCharge}
                  onChange={(e) => setInsuranceCharge(Math.max(0, Number(e.target.value)))}
                  className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border rounded text-right font-semibold"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Other Charges (₹):</span>
                <input
                  type="number"
                  min="0"
                  value={otherCharges}
                  onChange={(e) => setOtherCharges(Math.max(0, Number(e.target.value)))}
                  className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border rounded text-right font-semibold"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={roundOffEnabled}
                  onChange={(e) => setRoundOffEnabled(e.target.checked)}
                  className="rounded border-slate-300 text-accent focus:ring-accent"
                />
                <span>Round Off Final Amount</span>
              </label>
              {roundOffEnabled && (
                <span className="font-semibold text-slate-500">
                  {roundOffAmount >= 0 ? '+' : ''}₹{roundOffAmount.toFixed(3)}
                </span>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-extrabold">
              <span className="text-slate-900 dark:text-white">Grand Total Owed:</span>
              <span className="text-xl text-accent dark:text-text-muted">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Inline Quick Add Customer Modal */}
      {quickCustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[20px] shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-accent" /> Quick Add Customer
              </h3>
              <button onClick={() => setQuickCustModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddCustomerSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Company / Customer Name <span className="text-accent-soft">*</span></label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Acme Tech Solutions"
                  value={quickCustData.name}
                  onChange={(e) => setQuickCustData({ ...quickCustData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={quickCustData.phone}
                    onChange={(e) => setQuickCustData({ ...quickCustData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    placeholder="29ABCDE1234F1Z5"
                    value={quickCustData.gstin}
                    onChange={(e) => setQuickCustData({ ...quickCustData, gstin: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">City</label>
                  <input
                    type="text"
                    placeholder="Bengaluru"
                    value={quickCustData.city}
                    onChange={(e) => setQuickCustData({ ...quickCustData, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">State</label>
                  <select
                    value={quickCustData.state}
                    onChange={(e) => setQuickCustData({ ...quickCustData, state: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs"
                  >
                    <option value="Karnataka">Karnataka (Intrastate)</option>
                    <option value="Maharashtra">Maharashtra (Interstate)</option>
                    <option value="Telangana">Telangana (Interstate)</option>
                    <option value="Tamil Nadu">Tamil Nadu (Interstate)</option>
                    <option value="Delhi">Delhi (Interstate)</option>
                    <option value="Gujarat">Gujarat (Interstate)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setQuickCustModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-accent text-white rounded-xl text-xs font-bold shadow-md hover:bg-text">
                  Add & Select Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
