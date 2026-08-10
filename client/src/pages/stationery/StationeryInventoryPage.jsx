import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import {
  Boxes,
  AlertTriangle,
  Plus,
  Minus,
  RefreshCw,
  History,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';

export default function StationeryInventoryPage() {
  const { products, stationeryStockLogs, adjustStationeryStock, showToast } = useBusiness();

  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustQty, setAdjustQty] = useState(1);
  const [adjustType, setAdjustType] = useState('add'); // 'add' | 'wastage' | 'return' | 'adjustment'
  const [adjustReason, setAdjustReason] = useState('');

  // Low stock products filter
  const lowStockProducts = (products || [])
    .filter((p) => (p.stock || 0) <= (p.minStockLevel || p.reorderLevel || 10))
    .map((p) => {
      const minVal = p.minStockLevel || p.reorderLevel || 10;
      const suggested = Math.max(minVal * 2 - (p.stock || 0), minVal);
      return { ...p, suggestedReorder: suggested };
    });

  const openAdjustForProduct = (prod) => {
    setSelectedProduct(prod);
    setAdjustQty(1);
    setAdjustType('add');
    setAdjustReason('');
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !adjustQty) return;

    try {
      const finalQty = ['wastage', 'adjustment'].includes(adjustType) && adjustQty > 0 ? -adjustQty : adjustQty;
      await adjustStationeryStock({
        productId: selectedProduct.id || selectedProduct._id,
        quantity: finalQty,
        type: adjustType,
        reason: adjustReason || `${adjustType} stock change`,
      });
      setShowAdjustModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to adjust stock', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[20px] border border-stone shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-bottle text-white flex items-center justify-center font-bold">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal">Stationery Inventory & Reorder</h1>
            <p className="text-xs text-warm-gray">Low stock reorder suggestions, stock adjustments, & audit history</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (products.length > 0) openAdjustForProduct(products[0]);
          }}
          className="bz-btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Quick Stock Adjustment
        </button>
      </div>

      {/* Low Stock Table Section */}
      <div className="bg-white border border-stone rounded-[20px] shadow-subtle p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-stone pb-3">
          <h2 className="text-sm font-bold text-charcoal flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" /> Low Stock Items & Reorder Suggestions ({lowStockProducts.length})
          </h2>
          <span className="text-xs text-warm-gray">Items requiring immediate reorder from vendors</span>
        </div>

        <div className="overflow-x-auto">
          <table className="bz-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
                <th>Suggested Reorder Qty</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-warm-gray py-8">
                    All products have sufficient stock levels!
                  </td>
                </tr>
              ) : (
                lowStockProducts.map((p) => (
                  <tr key={p.id || p._id}>
                    <td className="font-bold text-charcoal">{p.name}</td>
                    <td>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cream text-warm-gray border border-stone">
                        {p.category}
                      </span>
                    </td>
                    <td>
                      <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md text-xs">
                        {p.stock} {p.unit || 'pc'}
                      </span>
                    </td>
                    <td className="text-warm-gray">{p.minStockLevel || p.reorderLevel || 10}</td>
                    <td className="font-bold text-emerald-700">+{p.suggestedReorder} {p.unit || 'pc'}</td>
                    <td className="text-center">
                      <button
                        type="button"
                        onClick={() => openAdjustForProduct(p)}
                        className="px-3 py-1 bg-green-bottle hover:bg-green-forest text-white rounded-lg text-xs font-semibold"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Transaction History */}
      <div className="bg-white border border-stone rounded-[20px] shadow-subtle p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-stone pb-3">
          <h2 className="text-sm font-bold text-charcoal flex items-center gap-2">
            <History className="w-4 h-4 text-green-bottle" /> Stock Movement Audit History ({stationeryStockLogs.length})
          </h2>
          <span className="text-xs text-warm-gray">Real-time stock logs from sales, purchases & adjustments</span>
        </div>

        <div className="overflow-x-auto">
          <table className="bz-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity Change</th>
                <th>Stock After</th>
                <th>Reason / Reference</th>
                <th>Staff</th>
              </tr>
            </thead>
            <tbody>
              {stationeryStockLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-warm-gray py-8">
                    No stock transaction history recorded yet.
                  </td>
                </tr>
              ) : (
                stationeryStockLogs.map((log) => {
                  const isNegative = log.changeQuantity < 0;
                  return (
                    <tr key={log.id || log._id}>
                      <td className="text-xs text-warm-gray">
                        {log.date ? new Date(log.date).toLocaleString('en-IN') : 'Just now'}
                      </td>
                      <td className="font-bold text-charcoal">{log.productName}</td>
                      <td>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-cream text-warm-gray border border-stone">
                          {log.type || 'Movement'}
                        </span>
                      </td>
                      <td>
                        <span className={`font-bold text-xs flex items-center gap-1 ${isNegative ? 'text-terracotta' : 'text-emerald-700'}`}>
                          {isNegative ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                          {log.changeQuantity > 0 ? `+${log.changeQuantity}` : log.changeQuantity}
                        </span>
                      </td>
                      <td className="font-semibold text-charcoal">{log.stockAfter}</td>
                      <td className="text-xs text-warm-gray">{log.reason || log.reference || '—'}</td>
                      <td className="text-xs text-warm-gray">{log.staffName || 'System'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADJUST STOCK MODAL */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-md w-full p-6 shadow-elev space-y-4">
            <div className="flex justify-between items-center border-b border-stone pb-3">
              <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
                <Boxes className="w-4 h-4 text-green-bottle" /> Stock Adjustment
              </h3>
              <button type="button" onClick={() => setShowAdjustModal(false)} className="p-1 rounded-full hover:bg-cream">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Select Product *</label>
                <select
                  value={selectedProduct?.id || selectedProduct?._id || ''}
                  onChange={(e) => {
                    const found = products.find((p) => (p.id || p._id) === e.target.value);
                    setSelectedProduct(found);
                  }}
                  className="bz-input"
                >
                  {products.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name} (Current Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Adjustment Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="bz-input"
                  >
                    <option value="add">Add Stock (Purchase/Inward)</option>
                    <option value="wastage">Damaged Stock / Wastage (-)</option>
                    <option value="return">Customer Return (+)</option>
                    <option value="adjustment">Manual Correction</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
                    className="bz-input font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Reason / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Stock count audit / Received fresh consignment"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="bz-input"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 bg-cream text-charcoal rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="bz-btn-primary px-5 text-xs">
                  Save Stock Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
