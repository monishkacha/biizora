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

  // Line items state
  const [items, setItems] = useState([
    {
      id: `item-${Date.now()}`,
      description: products[0]?.name || 'SaaS Subscription',
      hsnSac: products[0]?.hsnSac || '998314',
      quantity: 1,
      rate: products[0]?.sellingPrice || 49999,
      gstRate: 18
    }
  ]);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];
  const isIgst = selectedCustomer ? selectedCustomer.isIgst : false;

  const handleQuickAddCustomerSubmit = (e) => {
    e.preventDefault();
    if (!quickCustData.name.trim()) return;

    const isIgstState = (quickCustData.state || 'Karnataka').toLowerCase() !== 'karnataka';
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
        gstRate: 18
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
        gstRate: prod.gstRate
      } : i));
    }
  };

  // Tax calculations
  const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate)), 0);
  const taxableAmount = Math.max(0, subtotal - Number(discount));
  
  // Calculate total tax
  const totalTax = items.reduce((sum, item) => {
    const itemSub = (Number(item.quantity) * Number(item.rate));
    return sum + (itemSub * (Number(item.gstRate) / 100));
  }, 0);

  const cgst = isIgst ? 0 : totalTax / 2;
  const sgst = isIgst ? 0 : totalTax / 2;
  const igst = isIgst ? totalTax : 0;

  const grandTotal = taxableAmount + totalTax + Number(shipping);

  const handleSaveInvoice = (status = 'pending') => {
    if (!selectedCustomer) return;

    const invoicePayload = {
      invoiceNumber,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerGstin: selectedCustomer.gstin,
      issueDate,
      dueDate,
      items: items.map(i => ({
        ...i,
        amount: Number(i.quantity) * Number(i.rate),
        taxAmount: (Number(i.quantity) * Number(i.rate)) * (Number(i.gstRate) / 100)
      })),
      subtotal,
      discount: Number(discount),
      taxableAmount,
      cgst,
      sgst,
      igst,
      totalTax,
      shippingCharge: Number(shipping),
      grandTotal,
      status,
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
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" /> Generate & Save Invoice
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{company.name}</h2>
            <p className="text-xs text-slate-400">GSTIN: <span className="font-mono text-blue-600">{company.gstin}</span></p>
          </div>

          <div className="space-y-2 text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">INVOICE NUMBER</span>
            <input
              type="text"
              value={invoiceNumber}
              readOnly
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-sm font-bold text-blue-600 text-right"
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
                className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
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

        {/* Dynamic Line Items */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Line Items & GST Slabs</h3>
          
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs">
                
                {/* Product Catalog Dropdown / Description */}
                <div className="col-span-5 space-y-1">
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
                  <input
                    type="text"
                    placeholder="HSN/SAC"
                    value={item.hsnSac}
                    onChange={(e) => updateItem(item.id, 'hsnSac', e.target.value)}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-center"
                  />
                </div>

                <div className="col-span-1">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-center font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <input
                    type="number"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-right font-bold"
                  />
                </div>

                <div className="col-span-1 text-right font-bold text-blue-600">
                  ₹{(Number(item.quantity) * Number(item.rate)).toLocaleString('en-IN')}
                </div>

                <div className="col-span-1 flex items-center justify-end">
                  <button onClick={() => removeItem(item.id)} className="p-1 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            ))}
          </div>

          <button
            onClick={addItem}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors"
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

            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Discount (₹):</span>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border rounded text-right font-semibold"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-300">Shipping Charge (₹):</span>
              <input
                type="number"
                value={shipping}
                onChange={(e) => setShipping(Number(e.target.value))}
                className="w-24 px-2 py-1 bg-white dark:bg-slate-900 border rounded text-right font-semibold"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
              {isIgst ? (
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>IGST Total (18%):</span>
                  <span className="font-semibold text-teal-600">₹{igst.toLocaleString('en-IN')}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>CGST (9%):</span>
                    <span className="font-semibold text-teal-600">₹{cgst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>SGST (9%):</span>
                    <span className="font-semibold text-teal-600">₹{sgst.toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-extrabold">
              <span className="text-slate-900 dark:text-white">Grand Total Owed:</span>
              <span className="text-xl text-blue-600 dark:text-blue-400">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Inline Quick Add Customer Modal */}
      {quickCustModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" /> Quick Add Customer
              </h3>
              <button onClick={() => setQuickCustModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleQuickAddCustomerSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Company / Customer Name <span className="text-red-500">*</span></label>
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
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-blue-700">
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
