import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  GraduationCap,
  History,
  IndianRupee,
} from 'lucide-react';

export default function StationeryCustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, invoices, showToast } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // View Customer Purchase History Drawer State
  const [selectedCustHistory, setSelectedCustHistory] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    address: '',
    schoolOrCollege: '',
    notes: '',
  });

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      mobile: '',
      email: '',
      address: '',
      schoolOrCollege: '',
      notes: '',
    });
    setShowModal(true);
  };

  const openEditModal = (c) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name || '',
      mobile: c.phone || c.mobile || '',
      email: c.email || '',
      address: c.address || '',
      schoolOrCollege: c.schoolOrCollege || '',
      notes: c.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Customer name required', 'error');
      return;
    }
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id || editingCustomer._id, {
          ...formData,
          phone: formData.mobile,
        });
      } else {
        await addCustomer({
          ...formData,
          phone: formData.mobile,
        });
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save customer', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await deleteCustomer(id);
    }
  };

  const filteredCustomers = (customers || []).filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      !q ||
      c.name?.toLowerCase().includes(q) ||
      (c.phone || c.mobile || '').includes(q) ||
      c.schoolOrCollege?.toLowerCase().includes(q)
    );
  });

  // Purchase history for selected customer
  const customerInvoices = selectedCustHistory
    ? (invoices || []).filter((i) => i.customerId === (selectedCustHistory.id || selectedCustHistory._id) || i.customerName === selectedCustHistory.name)
    : [];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[20px] border border-stone shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-bottle text-white flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal">Stationery Customers & Schools</h1>
            <p className="text-xs text-warm-gray">Customer directory, school tags, credit balance & purchase history</p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="bz-btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-[18px] border border-stone shadow-subtle">
        <div className="relative">
          <Search className="w-4 h-4 text-warm-gray absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by customer name, mobile, or school/college name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bz-input pl-10 text-xs"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-stone rounded-[20px] shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="bz-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Mobile Number</th>
                <th>School / Institution</th>
                <th>Total Spent</th>
                <th>Pending Credit Bal</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-warm-gray py-12">
                    No customer records found. Click <strong>+ Add Customer</strong> to add.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id || c._id}>
                    <td className="font-bold text-charcoal">{c.name}</td>
                    <td className="text-xs text-warm-gray">{c.phone || c.mobile || '—'}</td>
                    <td>
                      {c.schoolOrCollege ? (
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 border border-purple-200 inline-flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" /> {c.schoolOrCollege}
                        </span>
                      ) : (
                        <span className="text-xs text-warm-gray">—</span>
                      )}
                    </td>
                    <td className="font-bold text-charcoal">₹{Number(c.totalSpent || 0).toLocaleString('en-IN')}</td>
                    <td>
                      {Number(c.outstandingBalance || c.creditBalance) > 0 ? (
                        <span className="font-bold text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-md text-xs">
                          ₹{Number(c.outstandingBalance || c.creditBalance).toLocaleString('en-IN')}
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-700 font-semibold">₹0 (Clear)</span>
                      )}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedCustHistory(c)}
                          className="p-1.5 bg-cream hover:bg-stone/40 text-charcoal rounded-lg text-xs"
                          title="Purchase History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="p-1.5 bg-cream hover:bg-stone/40 text-charcoal rounded-lg text-xs"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id || c._id)}
                          className="p-1.5 bg-cream hover:bg-terracotta/20 text-terracotta rounded-lg text-xs"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* ADD / EDIT CUSTOMER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-md w-full p-6 shadow-elev space-y-4">
            <div className="flex justify-between items-center border-b border-stone pb-3">
              <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
                <Users className="w-4 h-4 text-green-bottle" /> {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-cream">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Customer / School Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Mehta"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bz-input"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Mobile Number (+91)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="bz-input"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">School / College Association</label>
                <input
                  type="text"
                  placeholder="e.g. St. Xavier Senior Secondary School"
                  value={formData.schoolOrCollege}
                  onChange={(e) => setFormData({ ...formData, schoolOrCollege: e.target.value })}
                  className="bz-input"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Address / Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. Civil Lines, Nagpur"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bz-input"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Notes / Preferences</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bulk buyer for class 5 exam stationery"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bz-input"
                />
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
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PURCHASE HISTORY DRAWER / MODAL */}
      {selectedCustHistory && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[22px] max-w-xl w-full p-6 shadow-elev space-y-4">
            <div className="flex justify-between items-center border-b border-stone pb-3">
              <div>
                <h3 className="text-sm font-bold text-charcoal">{selectedCustHistory.name} — Purchase History</h3>
                <p className="text-xs text-warm-gray">Total Spent: ₹{Number(selectedCustHistory.totalSpent || 0).toLocaleString('en-IN')}</p>
              </div>
              <button type="button" onClick={() => setSelectedCustHistory(null)} className="p-1 rounded-full hover:bg-cream">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {customerInvoices.length === 0 ? (
                <p className="text-xs text-warm-gray py-6 text-center">No bill transactions found for this customer.</p>
              ) : (
                customerInvoices.map((inv) => (
                  <div key={inv.id || inv._id} className="p-3 bg-cream/40 rounded-xl border border-stone text-xs flex justify-between items-center">
                    <div>
                      <p className="font-bold text-charcoal">{inv.invoiceNumber}</p>
                      <p className="text-[10px] text-warm-gray">{inv.issueDate ? String(inv.issueDate).slice(0, 10) : 'Today'} • {(inv.items || []).length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-charcoal">₹{Number(inv.grandTotal).toFixed(2)}</p>
                      <span className="text-[10px] font-semibold text-emerald-700 capitalize">{inv.status || 'Paid'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-stone">
              <button
                type="button"
                onClick={() => setSelectedCustHistory(null)}
                className="px-4 py-2 bg-cream text-charcoal rounded-xl text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
