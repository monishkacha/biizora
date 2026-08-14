import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import {
  GraduationCap,
  Plus,
  Search,
  FileText,
  CheckCircle2,
  PackageCheck,
  Printer,
  ArrowRight,
  X,
  Trash2,
} from 'lucide-react';

export default function StationerySchoolOrdersPage() {
  const {
    products,
    stationerySchoolOrders,
    createSchoolOrder,
    updateSchoolOrder,
    convertSchoolOrderToInvoice,
    showToast,
  } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedQuotationPrint, setSelectedQuotationPrint] = useState(null);

  // New Order Form State
  const [schoolName, setSchoolName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobile, setMobile] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [advanceReceived, setAdvanceReceived] = useState(0);
  const [orderStatus, setOrderStatus] = useState('Quotation'); // 'Quotation' | 'Confirmed' | 'Packed' | 'Delivered' | 'Paid'
  const [orderItems, setOrderItems] = useState([
    { description: 'Classmate A4 Notebook 172pp', quantity: 50, quotedPrice: 50, productId: '' },
  ]);

  const addOrderItem = () => {
    setOrderItems((prev) => [
      ...prev,
      { description: 'Reynolds Trimax Pen Blue', quantity: 50, quotedPrice: 18, productId: '' },
    ]);
  };

  const updateItemField = (idx, field, val) => {
    setOrderItems((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      return next;
    });
  };

  const removeItem = (idx) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.quotedPrice) || 0), 0);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!schoolName.trim() || orderItems.length === 0) {
      showToast('School name and order items required', 'error');
      return;
    }

    try {
      await createSchoolOrder({
        schoolName,
        contactPerson,
        mobile,
        phone: mobile,
        deliveryDate: deliveryDate || new Date().toISOString().slice(0, 10),
        advanceReceived: Number(advanceReceived) || 0,
        status: orderStatus,
        items: orderItems,
      });

      setShowModal(false);
      setSchoolName('');
      setContactPerson('');
      setMobile('');
      setDeliveryDate('');
      setAdvanceReceived(0);
      setOrderStatus('Quotation');
      setOrderItems([{ description: 'Classmate A4 Notebook 172pp', quantity: 50, quotedPrice: 50, productId: '' }]);
    } catch (err) {
      showToast(err.message || 'Failed to create school order', 'error');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateSchoolOrder(orderId, { status: newStatus });
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const handleConvert = async (orderId) => {
    try {
      await convertSchoolOrderToInvoice(orderId);
    } catch (err) {
      showToast(err.message || 'Failed to convert order to invoice', 'error');
    }
  };

  const filteredOrders = (stationerySchoolOrders || []).filter((o) => {
    const q = searchQuery.toLowerCase();
    return !q || o.schoolName?.toLowerCase().includes(q) || o.orderNumber?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[20px] border border-stone shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-bottle text-white flex items-center justify-center font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal">School Bulk Orders & Quotations</h1>
            <p className="text-xs text-warm-gray">School supplies, bulk starter kits, stock reservations, & invoices</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="bz-btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create Quotation / Order
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-[18px] border border-stone shadow-subtle">
        <div className="relative">
          <Search className="w-4 h-4 text-warm-gray absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by school name, order number, contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bz-input pl-10 text-xs"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-stone rounded-[20px] shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="bz-table">
            <thead>
              <tr>
                <th>Order No</th>
                <th>School Name & Contact</th>
                <th>Delivery Date</th>
                <th>Items Count</th>
                <th>Quoted Amount</th>
                <th>Advance Received</th>
                <th className="text-center">Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-warm-gray py-12">
                    No school orders found. Click <strong>+ Create Quotation / Order</strong> to add.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id || o._id}>
                    <td className="font-bold text-charcoal">{o.orderNumber}</td>
                    <td>
                      <p className="font-bold text-charcoal">{o.schoolName}</p>
                      <p className="text-[10px] text-warm-gray">{o.contactPerson} ({o.phone || o.mobile})</p>
                    </td>
                    <td className="text-xs text-warm-gray">
                      {o.deliveryDate ? String(o.deliveryDate).slice(0, 10) : 'TBD'}
                    </td>
                    <td className="text-xs text-warm-gray">{(o.items || []).length} bulk items</td>
                    <td className="font-bold text-charcoal">₹{Number(o.quotedTotal || o.quotedAmount || 0).toLocaleString('en-IN')}</td>
                    <td className="text-emerald-700 font-semibold">₹{Number(o.advanceReceived || 0).toLocaleString('en-IN')}</td>
                    <td className="text-center">
                      <select
                        value={o.status || 'Quotation'}
                        onChange={(e) => handleStatusChange(o.id || o._id, e.target.value)}
                        className="text-[11px] font-bold px-2 py-1 rounded-lg border border-stone bg-cream text-charcoal"
                      >
                        <option value="Quotation">Quotation</option>
                        <option value="Confirmed">Confirmed (Reserve Stock)</option>
                        <option value="Packed">Packed</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedQuotationPrint(o)}
                          className="p-1.5 bg-cream hover:bg-stone/40 text-charcoal rounded-lg text-xs"
                          title="Print Quotation"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {!o.invoiceId && (
                          <button
                            type="button"
                            onClick={() => handleConvert(o.id || o._id)}
                            className="px-2.5 py-1 bg-yellow-butter hover:bg-yellow-honey text-charcoal rounded-lg text-[11px] font-bold"
                          >
                            Convert Invoice
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ORDER / QUOTATION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] max-w-2xl w-full p-6 shadow-elev space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-stone pb-3">
              <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-green-bottle" /> Create School Bulk Order / Quotation
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-cream">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">School / College Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. St. Xavier Senior Secondary School"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="bz-input"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Vice Principal Mrs. Sharma"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="bz-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Mobile (+91)</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="bz-input"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="bz-input"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Initial Status</label>
                  <select
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                    className="bz-input font-bold"
                  >
                    <option value="Quotation">Quotation</option>
                    <option value="Confirmed">Confirmed (Reserves Stock)</option>
                  </select>
                </div>
              </div>

              {/* Order Items List */}
              <div className="space-y-2 border-t border-stone pt-3">
                <div className="flex justify-between items-center">
                  <label className="font-bold uppercase text-[11px] text-charcoal">Bulk Line Items</label>
                  <button
                    type="button"
                    onClick={addOrderItem}
                    className="text-xs text-green-bottle font-semibold hover:underline flex items-center gap-1"
                  >
                    + Add Line Item
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-cream/40 p-2 rounded-xl border border-stone">
                      <select
                        value={item.productId}
                        onChange={(e) => {
                          const found = products.find((p) => (p.id || p._id) === e.target.value);
                          updateItemField(idx, 'productId', e.target.value);
                          if (found) {
                            updateItemField(idx, 'description', found.name);
                            updateItemField(idx, 'quotedPrice', found.sellingPrice || found.price);
                          }
                        }}
                        className="bz-input flex-1 text-xs"
                      >
                        <option value="">-- Select from Product Stock (Optional) --</option>
                        {products.map((p) => (
                          <option key={p.id || p._id} value={p.id || p._id}>
                            {p.name} (Stock: {p.stock})
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        placeholder="Item description..."
                        value={item.description}
                        onChange={(e) => updateItemField(idx, 'description', e.target.value)}
                        className="bz-input flex-1 text-xs"
                      />

                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItemField(idx, 'quantity', Number(e.target.value))}
                        className="w-16 bz-input text-xs font-bold text-center"
                      />

                      <input
                        type="number"
                        min="0"
                        placeholder="Rate ₹"
                        value={item.quotedPrice}
                        onChange={(e) => updateItemField(idx, 'quotedPrice', Number(e.target.value))}
                        className="w-20 bz-input text-xs font-bold"
                      />

                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-1 text-warm-gray hover:text-terracotta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Advance Amount Received (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={advanceReceived}
                    onChange={(e) => setAdvanceReceived(Number(e.target.value))}
                    className="bz-input font-bold"
                  />
                </div>
                <div className="p-3 bg-cream/60 rounded-xl border border-stone text-right">
                  <span className="text-[10px] uppercase font-bold text-warm-gray block">Quoted Total</span>
                  <span className="text-lg font-bold text-green-bottle">₹{calculateTotal().toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-cream text-charcoal rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="bz-btn-primary px-5 text-xs">
                  Save School Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT QUOTATION MODAL */}
      {selectedQuotationPrint && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-lg w-full p-6 shadow-elev space-y-4">
            <div className="flex justify-between items-center border-b border-stone pb-3">
              <h3 className="text-sm font-bold text-charcoal">Quotation #{selectedQuotationPrint.orderNumber}</h3>
              <button type="button" onClick={() => setSelectedQuotationPrint(null)} className="p-1 rounded-full hover:bg-cream">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border border-stone rounded-xl bg-cream/20 text-xs space-y-2">
              <h4 className="font-bold text-charcoal text-sm">{selectedQuotationPrint.schoolName}</h4>
              <p className="text-warm-gray">Contact: {selectedQuotationPrint.contactPerson} ({selectedQuotationPrint.phone || selectedQuotationPrint.mobile})</p>
              <div className="border-t border-stone pt-2 space-y-1">
                {(selectedQuotationPrint.items || []).map((i, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{i.quantity}x {i.description}</span>
                    <span className="font-semibold">₹{(i.quantity * i.quotedPrice).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone pt-2 flex justify-between font-bold text-sm text-green-bottle">
                <span>Quoted Total:</span>
                <span>₹{Number(selectedQuotationPrint.quotedTotal || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="bz-btn-primary px-4 text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Quotation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
