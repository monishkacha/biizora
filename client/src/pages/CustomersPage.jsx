import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBusiness } from '../context/BusinessContext';
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  Trash2,
  Edit2,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useBusiness();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    gstin: '',
    pan: '',
    address: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    category: 'Enterprise',
    notes: ''
  });

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleOpenModal();
      setSearchParams({}); // Clear query parameter
    }
  }, [searchParams]);

  const handleOpenModal = (cust = null) => {
    if (cust) {
      setEditingCustomer(cust);
      setFormData(cust);
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        gstin: '',
        pan: '',
        address: '',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '',
        category: 'Enterprise',
        notes: ''
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const formattedState = formData.state || 'Karnataka';
    const isIgst = formattedState.toLowerCase() !== 'karnataka';

    const processedData = {
      ...formData,
      contactPerson: formData.contactPerson.trim() || formData.name,
      email: formData.email.trim() || 'client@business.com',
      phone: formData.phone.trim() || '+91 99000 00000',
      gstin: formData.gstin.trim() ? formData.gstin.trim().toUpperCase() : 'URP (Unregistered Client)',
      pan: formData.pan.trim() ? formData.pan.trim().toUpperCase() : 'N/A',
      city: formData.city.trim() || 'Bengaluru',
      state: formattedState,
      isIgst
    };

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, processedData);
    } else {
      addCustomer(processedData);
    }
    setModalOpen(false);
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
                          c.gstin.toLowerCase().includes(search.toLowerCase()) ||
                          c.email.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || c.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleExportCSV = () => {
    const headers = "Name,Contact Person,Email,Phone,GSTIN,PAN,City,State,Outstanding Balance,Total Spent\n";
    const rows = customers.map(c => 
      `"${c.name}","${c.contactPerson}","${c.email}","${c.phone}","${c.gstin}","${c.pan}","${c.city}","${c.state}",${c.outstandingBalance},${c.totalSpent}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Biizora_customer_ledger_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" /> Customer Directory & Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage client contacts, GSTIN tax validation, and outstanding balances.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-text text-white rounded-xl text-xs font-bold shadow-md shadow-subtle transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Add New Customer
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by customer name, GSTIN, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:shadow-focus text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Enterprise">Enterprise</option>
            <option value="Agency">Agency</option>
            <option value="Retailer">Retailer</option>
            <option value="Manufacturer">Manufacturer</option>
          </select>
        </div>
      </div>

      {/* Customer List Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map(c => (
          <div key={c.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card flex flex-col justify-between space-y-4 hover:border-blue-500 transition-all">
            
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-bg-secondary dark:bg-bg-secondary text-accent dark:text-blue-300 rounded">
                    {c.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1.5">{c.name}</h3>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Building className="w-3.5 h-3.5" /> Contact: {c.contactPerson}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleOpenModal(c)} className="p-1.5 text-slate-400 hover:text-accent rounded-lg">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteCustomer(c.id)} className="p-1.5 text-slate-400 hover:text-text rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
                <p className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> {c.email}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {c.phone}
                </p>
                <p className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="font-semibold text-slate-400">GSTIN:</span> {c.gstin}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {c.city}, {c.state}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400">Outstanding Balance</span>
                <p className={`font-extrabold ${c.outstandingBalance > 0 ? 'text-amber-500' : 'text-accent-soft'}`}>
                  ₹{c.outstandingBalance.toLocaleString('en-IN')}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400">Total Lifetime Spent</span>
                <p className="font-bold text-slate-900 dark:text-white">₹{c.totalSpent.toLocaleString('en-IN')}</p>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Add / Edit Customer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-[20px] shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCustomer ? 'Edit Customer Details' : 'Add New Customer'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Company / Customer Name <span className="text-accent-soft">*</span></label>
                  <input required type="text" placeholder="e.g. Reliance Retail / Rahul Verma" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Contact Person (Optional)</label>
                  <input type="text" placeholder="e.g. Rahul Verma" value={formData.contactPerson} onChange={(e) => setFormData({...formData, contactPerson: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Email Address (Optional)</label>
                  <input type="email" placeholder="client@company.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Phone Number (Optional)</label>
                  <input type="text" placeholder="+91 98765 43210" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">GSTIN Number (Optional)</label>
                  <input type="text" value={formData.gstin} onChange={(e) => setFormData({...formData, gstin: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs uppercase font-mono" placeholder="29ABCDE1234F1Z5 (or leave blank for URP)" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">PAN Number (Optional)</label>
                  <input type="text" value={formData.pan} onChange={(e) => setFormData({...formData, pan: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs uppercase font-mono" placeholder="ABCDE1234F" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">City</label>
                  <input type="text" placeholder="Bengaluru" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">State</label>
                  <select value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs">
                    <option value="Karnataka">Karnataka (Intrastate)</option>
                    <option value="Maharashtra">Maharashtra (Interstate)</option>
                    <option value="Telangana">Telangana (Interstate)</option>
                    <option value="Tamil Nadu">Tamil Nadu (Interstate)</option>
                    <option value="Delhi">Delhi (Interstate)</option>
                    <option value="Gujarat">Gujarat (Interstate)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs">
                    <option value="Enterprise">Enterprise</option>
                    <option value="Agency">Agency</option>
                    <option value="Retailer">Retailer</option>
                    <option value="Manufacturer">Manufacturer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Billing Address (Optional)</label>
                <textarea rows={2} placeholder="Suite/Street address..." value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-accent text-white rounded-xl text-xs font-bold shadow-md hover:bg-text">
                  {editingCustomer ? 'Update Customer' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
