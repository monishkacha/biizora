import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import {
  Store,
  Plus,
  Search,
  ShoppingCart,
  DollarSign,
  X,
  Building2,
} from 'lucide-react';

export default function StationeryVendorsPage() {
  const {
    products,
    stationeryVendors,
    stationeryVendorPurchases,
    createVendor,
    recordVendorPurchase,
    showToast,
  } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Vendor Form State
  const [vendorData, setVendorData] = useState({
    name: '',
    mobile: '',
    gstin: '',
    address: '',
    contactPerson: '',
  });

  // Purchase Form State
  const [purchaseData, setPurchaseData] = useState({
    vendorId: '',
    productId: '',
    quantity: 10,
    unitCost: 20,
    paidAmount: 0,
    notes: '',
  });

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    if (!vendorData.name.trim()) {
      showToast('Vendor name required', 'error');
      return;
    }
    try {
      await createVendor(vendorData);
      setShowVendorModal(false);
      setVendorData({ name: '', mobile: '', gstin: '', address: '', contactPerson: '' });
    } catch (err) {
      showToast(err.message || 'Failed to create vendor', 'error');
    }
  };

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    if (!purchaseData.vendorId) {
      showToast('Please select vendor', 'error');
      return;
    }
    try {
      await recordVendorPurchase(purchaseData);
      setShowPurchaseModal(false);
      setPurchaseData({ vendorId: '', productId: '', quantity: 10, unitCost: 20, paidAmount: 0, notes: '' });
    } catch (err) {
      showToast(err.message || 'Failed to record purchase', 'error');
    }
  };

  const filteredVendors = (stationeryVendors || []).filter((v) => {
    const q = searchQuery.toLowerCase();
    return !q || v.name?.toLowerCase().includes(q) || (v.phone || v.mobile || '').includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[20px] border border-stone shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-bottle text-white flex items-center justify-center font-bold">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal">Stationery Wholesale Vendors</h1>
            <p className="text-xs text-warm-gray">Manage suppliers, stock purchase orders, & vendor payables</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (stationeryVendors.length > 0) {
                setPurchaseData((prev) => ({ ...prev, vendorId: stationeryVendors[0].id || stationeryVendors[0]._id }));
              }
              setShowPurchaseModal(true);
            }}
            className="px-4 py-2 bg-yellow-butter hover:bg-yellow-honey text-charcoal rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <ShoppingCart className="w-4 h-4" /> Record Stock Purchase
          </button>
          <button
            type="button"
            onClick={() => setShowVendorModal(true)}
            className="bz-btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </div>
      </div>

      {/* Vendors List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendors Directory */}
        <div className="lg:col-span-2 bg-white border border-stone rounded-[20px] shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone pb-3">
            <h2 className="text-sm font-bold text-charcoal">Vendor Directory ({filteredVendors.length})</h2>
            <div className="relative w-48">
              <Search className="w-3.5 h-3.5 text-warm-gray absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bz-input pl-8 text-xs py-1.5"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="bz-table">
              <thead>
                <tr>
                  <th>Vendor Name</th>
                  <th>Contact Person</th>
                  <th>Mobile</th>
                  <th>GSTIN</th>
                  <th className="text-right">Outstanding Credit</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-warm-gray py-8">
                      No vendors listed. Click <strong>+ Add Vendor</strong> to record supplier.
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((v) => (
                    <tr key={v.id || v._id}>
                      <td className="font-bold text-charcoal">{v.name}</td>
                      <td className="text-xs text-warm-gray">{v.contactPerson || '—'}</td>
                      <td className="text-xs text-warm-gray">{v.phone || v.mobile || '—'}</td>
                      <td className="text-xs font-mono">{v.gstin || '—'}</td>
                      <td className="text-right font-bold">
                        {Number(v.outstandingBalance) > 0 ? (
                          <span className="text-terracotta">₹{Number(v.outstandingBalance).toLocaleString('en-IN')}</span>
                        ) : (
                          <span className="text-emerald-700">₹0 (Paid)</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Purchases Log */}
        <div className="bg-white border border-stone rounded-[20px] shadow-subtle p-5 space-y-4">
          <div className="border-b border-stone pb-3">
            <h2 className="text-sm font-bold text-charcoal flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-green-bottle" /> Recent Stock Purchases
            </h2>
            <p className="text-xs text-warm-gray">Inward goods from wholesale vendors</p>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {(stationeryVendorPurchases || []).length === 0 ? (
              <p className="text-xs text-warm-gray text-center py-8">No purchase transactions recorded.</p>
            ) : (
              stationeryVendorPurchases.map((p) => (
                <div key={p.id || p._id} className="p-3 bg-cream/40 rounded-xl border border-stone text-xs space-y-1">
                  <div className="flex justify-between font-bold text-charcoal">
                    <span>{p.vendorName}</span>
                    <span>₹{Number(p.totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-warm-gray">
                    <span>Item: {p.productName || 'Stationery Batch'}</span>
                    <span>Qty: +{p.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] pt-1 border-t border-stone/30">
                    <span className="text-warm-gray">{p.purchaseDate ? String(p.purchaseDate).slice(0, 10) : 'Today'}</span>
                    <span className={`font-semibold capitalize ${p.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-800'}`}>
                      {p.paymentStatus || 'Paid'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ADD VENDOR MODAL */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-md w-full p-6 shadow-elev space-y-4">
            <div className="flex justify-between items-center border-b border-stone pb-3">
              <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
                <Store className="w-4 h-4 text-green-bottle" /> Add Wholesale Vendor
              </h3>
              <button type="button" onClick={() => setShowVendorModal(false)} className="p-1 rounded-full hover:bg-cream">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleVendorSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Vendor / Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ITC Paperboards / Reynolds India"
                  value={vendorData.name}
                  onChange={(e) => setVendorData({ ...vendorData, name: e.target.value })}
                  className="bz-input"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Suresh Shah"
                  value={vendorData.contactPerson}
                  onChange={(e) => setVendorData({ ...vendorData, contactPerson: e.target.value })}
                  className="bz-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Mobile (+91)</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={vendorData.mobile}
                    onChange={(e) => setVendorData({ ...vendorData, mobile: e.target.value })}
                    className="bz-input"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">GSTIN</label>
                  <input
                    type="text"
                    placeholder="27AAAAA0000A1Z5"
                    value={vendorData.gstin}
                    onChange={(e) => setVendorData({ ...vendorData, gstin: e.target.value })}
                    className="bz-input uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Address / Warehouse City</label>
                <input
                  type="text"
                  placeholder="e.g. Bhiwandi Industrial Area, Mumbai"
                  value={vendorData.address}
                  onChange={(e) => setVendorData({ ...vendorData, address: e.target.value })}
                  className="bz-input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="px-4 py-2 bg-cream text-charcoal rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="bz-btn-primary px-5 text-xs">
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD PURCHASE MODAL */}
      {showPurchaseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-md w-full p-6 shadow-elev space-y-4">
            <div className="flex justify-between items-center border-b border-stone pb-3">
              <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-green-bottle" /> Record Stock Purchase
              </h3>
              <button type="button" onClick={() => setShowPurchaseModal(false)} className="p-1 rounded-full hover:bg-cream">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePurchaseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Vendor *</label>
                <select
                  value={purchaseData.vendorId}
                  onChange={(e) => setPurchaseData({ ...purchaseData, vendorId: e.target.value })}
                  className="bz-input"
                >
                  <option value="">Select Vendor</option>
                  {stationeryVendors.map((v) => (
                    <option key={v.id || v._id} value={v.id || v._id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Select Product *</label>
                <select
                  value={purchaseData.productId}
                  onChange={(e) => setPurchaseData({ ...purchaseData, productId: e.target.value })}
                  className="bz-input"
                >
                  <option value="">Select Product to add stock</option>
                  {products.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name} (Current: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Quantity Purchased *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={purchaseData.quantity}
                    onChange={(e) => setPurchaseData({ ...purchaseData, quantity: Number(e.target.value) })}
                    className="bz-input font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Unit Purchase Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={purchaseData.unitCost}
                    onChange={(e) => setPurchaseData({ ...purchaseData, unitCost: Number(e.target.value) })}
                    className="bz-input"
                  />
                </div>
              </div>

              <div className="p-3 bg-cream/60 rounded-xl border border-stone text-xs flex justify-between font-bold">
                <span>Total Bill Amount:</span>
                <span>₹{(purchaseData.quantity * purchaseData.unitCost).toFixed(2)}</span>
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Amount Paid Now (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={purchaseData.paidAmount}
                  onChange={(e) => setPurchaseData({ ...purchaseData, paidAmount: Number(e.target.value) })}
                  className="bz-input font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-4 py-2 bg-cream text-charcoal rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="bz-btn-primary px-5 text-xs">
                  Save Stock Purchase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
