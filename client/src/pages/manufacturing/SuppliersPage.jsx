import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Phone,
  Mail,
  MapPin,
  FileText,
  Trash2,
  Edit2,
  Eye,
  X,
  CheckCircle,
  AlertTriangle,
  IndianRupee,
  ShoppingCart
} from 'lucide-react';
import { INITIAL_SUPPLIERS } from './mockManufacturingData';
import { useBusiness } from '../../context/BusinessContext';
import ManufacturingDataMigrationModal from '../../components/manufacturing/ManufacturingDataMigrationModal';

export default function SuppliersPage() {
  const { t } = useTranslation();
  const { showToast } = useBusiness();
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    gstin: '',
    pan: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: 'Gujarat',
    pincode: '',
    paymentTerms: 'Net 30',
    bankDetails: '',
    notes: '',
    status: 'Active',
    outstanding: 0
  });

  // Filter logic
  const filteredSuppliers = suppliers.filter((sup) => {
    const q = search.toLowerCase();
    const matchesSearch =
      sup.name.toLowerCase().includes(q) ||
      sup.company.toLowerCase().includes(q) ||
      sup.gstin.toLowerCase().includes(q) ||
      sup.phone.toLowerCase().includes(q) ||
      sup.city.toLowerCase().includes(q);

    if (!matchesSearch) return false;

    if (filterStatus === 'Active') return sup.status === 'Active';
    if (filterStatus === 'Inactive') return sup.status === 'Inactive';
    if (filterStatus === 'Outstanding') return sup.outstanding > 0 || sup.status === 'Outstanding Payment';
    return true;
  });

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      company: '',
      gstin: '',
      pan: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: 'Gujarat',
      pincode: '',
      paymentTerms: 'Net 30',
      bankDetails: '',
      notes: '',
      status: 'Active',
      outstanding: 0
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sup) => {
    setEditingSupplier(sup);
    setFormData({ ...sup });
    setIsModalOpen(true);
  };

  const handleOpenDetailModal = (sup) => {
    setSelectedSupplier(sup);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this supplier?')) {
      setSuppliers(suppliers.filter((s) => s.id !== id));
      showToast('Supplier removed successfully');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.company) {
      showToast('Please fill in required supplier details', 'error');
      return;
    }

    if (editingSupplier) {
      setSuppliers(suppliers.map((s) => (s.id === editingSupplier.id ? { ...s, ...formData } : s)));
      showToast('Supplier updated successfully');
    } else {
      const newSup = {
        ...formData,
        id: `SUP-${String(suppliers.length + 1).padStart(3, '0')}`
      };
      setSuppliers([newSup, ...suppliers]);
      showToast('New manufacturing supplier added');
    }
    setIsModalOpen(false);
  };

  const handleExportCSV = () => {
    showToast('Exporting suppliers CSV list...');
  };

  const handleImportCSV = () => {
    setIsMigrationModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <ManufacturingDataMigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
        defaultDataType="suppliers"
        onImportSuccess={(newRecords) => {
          if (newRecords && newRecords.length) {
            const formatted = newRecords.map((r, i) => ({
              id: `sup-mig-${Date.now()}-${i}`,
              name: r.name || r.Name || 'Imported Vendor',
              company: r.company || r.Company || r.name || 'Vendor Corp',
              phone: r.phone || r.Phone || '+91 98000 00000',
              email: r.email || r.Email || 'vendor@supplier.com',
              gstin: r.gstin || r.GSTIN || '24AAACA1234A1Z5',
              address: r.address || r.Address || 'GIDC Industrial Area',
              products: r.products ? r.products.split(',') : ['Raw Materials'],
              paymentTerms: r.paymentTerms || 'Net 30',
              outstandingBalance: Number(r.outstandingBalance || 0),
              status: 'Active',
            }));
            setSuppliers((prev) => [...formatted, ...prev]);
            showToast(`Successfully imported ${formatted.length} supplier records!`);
          }
        }}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[22px] border border-stone shadow-card">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-green-forest uppercase tracking-wider mb-1">
            <span>Manufacturing ERP</span>
            <span>•</span>
            <span>Procurement & Vendors</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-charcoal flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-green-bottle" /> {t('mfgPages.suppliersTitle', 'Suppliers & Vendors')}
          </h1>
          <p className="text-xs text-warm-gray mt-1">
            {t('mfgPages.suppliersSubtitle', 'Manage raw material vendors, GSTIN profiles, payment terms, and outstanding balances.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleImportCSV}
            className="px-3.5 py-2 rounded-xl bg-cream border border-stone text-charcoal font-semibold hover:bg-stone/20 text-xs flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-4 h-4" /> {t('mfgPages.dataMigration', 'Import CSV')}
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-cream border border-stone text-charcoal font-semibold hover:bg-stone/20 text-xs flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> {t('mfgPages.exportSchedule', 'Export')}
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-green-bottle text-white font-semibold hover:bg-green-forest text-xs flex items-center gap-2 shadow-subtle transition-all"
          >
            <Plus className="w-4 h-4" /> {t('mfgPages.addSupplier', '+ Add Supplier')}
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone p-4 rounded-[18px] shadow-subtle">
          <p className="text-xs text-warm-gray font-medium">{t('mfgPages.colSupplierName', 'Total Suppliers')}</p>
          <h3 className="text-2xl font-bold font-display text-charcoal mt-1">{suppliers.length}</h3>
          <p className="text-[11px] text-green-forest mt-0.5">Approved vendor list</p>
        </div>
        <div className="bg-white border border-stone p-4 rounded-[18px] shadow-subtle">
          <p className="text-xs text-warm-gray font-medium">{t('mfgPages.activeSuppliers', 'Active Suppliers')}</p>
          <h3 className="text-2xl font-bold font-display text-emerald-700 mt-1">
            {suppliers.filter((s) => s.status === 'Active').length}
          </h3>
          <p className="text-[11px] text-emerald-600 mt-0.5">Available for purchase orders</p>
        </div>
        <div className="bg-white border border-stone p-4 rounded-[18px] shadow-subtle">
          <p className="text-xs text-warm-gray font-medium">{t('mfgPages.pendingOrders', 'Pending Payables')}</p>
          <h3 className="text-2xl font-bold font-display text-amber-800 mt-1">
            ₹{suppliers.reduce((acc, s) => acc + (s.outstandingBalance || 0), 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-amber-700 mt-0.5">Outstanding vendor dues</p>
        </div>
        <div className="bg-white border border-stone p-4 rounded-[18px] shadow-subtle">
          <p className="text-xs text-warm-gray font-medium">{t('mfgPages.avgLeadTime', 'Average Delivery Time')}</p>
          <h3 className="text-2xl font-bold font-display text-green-bottle mt-1">4.2 Days</h3>
          <p className="text-[11px] text-warm-gray mt-0.5">Standard Lead Time</p>
        </div>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="bg-white p-4 rounded-[18px] border border-stone shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-warm-gray absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search supplier, GSTIN, city or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream/50 border border-stone rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-bottle/30 text-charcoal"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Active', 'Outstanding', 'Inactive'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === st
                  ? 'bg-green-bottle text-white shadow-xs'
                  : 'bg-cream text-warm-gray hover:text-charcoal'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Supplier Data Table */}
      <div className="bg-white rounded-[20px] border border-stone shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone bg-cream/40 text-warm-gray font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">{t('mfgPages.colSupplierName', 'Supplier & Company')}</th>
                <th className="py-3.5 px-4">GSTIN & PAN</th>
                <th className="py-3.5 px-4">{t('mfgPages.colContactPerson', 'Contact Person')}</th>
                <th className="py-3.5 px-4">Phone & Email</th>
                <th className="py-3.5 px-4">City</th>
                <th className="py-3.5 px-4 text-right">Outstanding (₹)</th>
                <th className="py-3.5 px-4 text-center">{t('mfgPages.colStatus', 'Status')}</th>
                <th className="py-3.5 px-4 text-right">{t('mfgPages.colActions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone text-charcoal font-medium">
              {filteredSuppliers.map((sup) => (
                <tr key={sup.id} className="hover:bg-cream/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-charcoal">{sup.name}</p>
                    <p className="text-[11px] text-warm-gray">{sup.company}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <p className="font-semibold text-green-bottle">{sup.gstin}</p>
                    <p className="text-warm-gray">{sup.pan}</p>
                  </td>
                  <td className="py-3.5 px-4">{sup.contactPerson}</td>
                  <td className="py-3.5 px-4">
                    <p className="text-charcoal">{sup.phone}</p>
                    <p className="text-[11px] text-warm-gray">{sup.email}</p>
                  </td>
                  <td className="py-3.5 px-4">{sup.city}, {sup.state}</td>
                  <td className="py-3.5 px-4 text-right font-bold text-charcoal">
                    ₹{Number(sup.outstanding || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        sup.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : sup.status === 'Outstanding Payment'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-stone/40 text-warm-gray border border-stone-300'
                      }`}
                    >
                      {sup.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => handleOpenDetailModal(sup)}
                      className="p-1.5 text-warm-gray hover:text-green-bottle rounded-lg hover:bg-cream"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(sup)}
                      className="p-1.5 text-warm-gray hover:text-green-bottle rounded-lg hover:bg-cream"
                      title="Edit Supplier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(sup.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                      title="Delete Supplier"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-warm-gray">
                    No suppliers match your filter parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-[22px] shadow-2xl border border-stone p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone pb-3">
              <h3 className="text-lg font-bold text-charcoal">
                {editingSupplier ? 'Edit Supplier Profile' : '+ Add New Manufacturing Supplier'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-warm-gray hover:text-charcoal rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Apex Metals & Alloys"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Company Registered Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Apex Metals & Alloys Pvt Ltd"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="24AAACA1234A1Z5"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs font-mono text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">PAN Number</label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                    placeholder="AAACA1234A"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs font-mono text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Rajesh Patel"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98250 11223"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="sales@apexmetals.in"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Payment Terms</label>
                  <select
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  >
                    <option value="Immediate">Immediate / Advance</option>
                    <option value="Net 15">Net 15 Days</option>
                    <option value="Net 30">Net 30 Days</option>
                    <option value="Net 45">Net 45 Days</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ahmedabad"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Gujarat"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Phase III, GIDC Vatva"
                  className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Bank Details</label>
                <input
                  type="text"
                  value={formData.bankDetails}
                  onChange={(e) => setFormData({ ...formData, bankDetails: e.target.value })}
                  placeholder="HDFC Bank - A/C 50200012345678 (HDFC0000123)"
                  className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Notes / Supply Categories</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Primary SS 304 and Aluminum ingot supplier with mill test certificates."
                  className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cream border border-stone text-charcoal font-semibold hover:bg-stone/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-green-bottle text-white font-semibold hover:bg-green-forest"
                >
                  {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Detail View Modal */}
      {isDetailModalOpen && selectedSupplier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-[22px] shadow-2xl border border-stone p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone pb-3">
              <div>
                <h3 className="text-lg font-bold text-charcoal">{selectedSupplier.name}</h3>
                <p className="text-xs text-warm-gray">{selectedSupplier.company}</p>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 text-warm-gray hover:text-charcoal rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-cream/40 rounded-xl border border-stone">
                <p className="text-[10px] text-warm-gray font-medium uppercase">GSTIN Number</p>
                <p className="font-mono font-bold text-green-bottle mt-0.5">{selectedSupplier.gstin || 'N/A'}</p>
              </div>
              <div className="p-3 bg-cream/40 rounded-xl border border-stone">
                <p className="text-[10px] text-warm-gray font-medium uppercase">Outstanding Balance</p>
                <p className="font-bold text-amber-900 mt-0.5">₹{Number(selectedSupplier.outstanding || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="p-3 bg-cream/40 rounded-xl border border-stone">
                <p className="text-[10px] text-warm-gray font-medium uppercase">Contact Person</p>
                <p className="font-semibold text-charcoal mt-0.5">{selectedSupplier.contactPerson}</p>
                <p className="text-warm-gray mt-0.5">{selectedSupplier.phone}</p>
              </div>
              <div className="p-3 bg-cream/40 rounded-xl border border-stone">
                <p className="text-[10px] text-warm-gray font-medium uppercase">Payment Terms</p>
                <p className="font-semibold text-charcoal mt-0.5">{selectedSupplier.paymentTerms}</p>
              </div>
            </div>

            <div className="p-3 bg-cream/40 rounded-xl border border-stone text-xs space-y-1">
              <p className="font-semibold text-charcoal">Address & Location:</p>
              <p className="text-warm-gray">{selectedSupplier.address}, {selectedSupplier.city}, {selectedSupplier.state} - {selectedSupplier.pincode}</p>
            </div>

            <div className="p-3 bg-cream/40 rounded-xl border border-stone text-xs space-y-1">
              <p className="font-semibold text-charcoal">Bank Details:</p>
              <p className="text-warm-gray font-mono">{selectedSupplier.bankDetails || 'No bank record attached.'}</p>
            </div>

            <div className="p-3 bg-cream/40 rounded-xl border border-stone text-xs space-y-1">
              <p className="font-semibold text-charcoal">Notes:</p>
              <p className="text-warm-gray">{selectedSupplier.notes || 'No extra remarks.'}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  showToast(`Create PO triggered for ${selectedSupplier.name}`);
                }}
                className="px-4 py-2 rounded-xl bg-green-bottle text-white font-semibold text-xs flex items-center gap-1.5"
              >
                <ShoppingCart className="w-4 h-4" /> Create Purchase Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
