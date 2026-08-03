import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import {
  CreditCard,
  Plus,
  Search,
  Trash2,
  Upload,
  FileText,
  DollarSign,
  TrendingDown,
  CheckCircle,
  X
} from 'lucide-react';

export default function ExpensePage() {
  const { expenses, addExpense, deleteExpense, metrics } = useBusiness();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Office & Tech',
    amount: 5000,
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'Corporate Card',
    vendor: 'AWS India',
    gstClaimable: true,
    gstAmount: 762,
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    addExpense(formData);
    setModalOpen(false);
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
                          e.vendor.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'All' || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const totalGstClaimable = expenses.reduce((sum, e) => sum + (e.gstClaimable ? Number(e.gstAmount || 0) : 0), 0);

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-accent" /> Expense Tracker & Bill Scanner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track operating costs, vendor receipts, and claimable Input Tax Credit (ITC).</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-text text-white rounded-xl text-xs font-bold shadow-md shadow-subtle transition-all"
        >
          <Plus className="w-4 h-4" /> Record New Expense
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-400">Total Expenses Recorded</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹{metrics.totalExpenses.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{expenses.length} operating bills</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-400">Claimable Input Tax Credit (ITC)</span>
          <p className="text-2xl font-extrabold text-accent-soft dark:text-text-muted mt-1">
            ₹{totalGstClaimable.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-accent-soft font-semibold mt-1">Deductible from Output GST</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-400">Highest Expense Category</span>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {expenses.length > 0 ? expenses[0].category : 'Office'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Monthly recurring cost</p>
        </div>

      </div>

      {/* Search & Filter */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by expense name or vendor..."
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
            <option value="Office & Tech">Office & Tech</option>
            <option value="Rent">Rent</option>
            <option value="Salary">Salary</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
      </div>

      {/* Expense Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50">
                <th className="py-3.5 px-4">Title / Vendor</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Payment Mode</th>
                <th className="py-3.5 px-4">ITC Claimable</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredExpenses.map(e => (
                <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{e.title}</div>
                    <div className="text-[10px] text-slate-400">Vendor: {e.vendor}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium rounded">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{e.date}</td>
                  <td className="py-3.5 px-4 font-medium">{e.paymentMode}</td>
                  <td className="py-3.5 px-4">
                    {e.gstClaimable ? (
                      <span className="text-accent-soft font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> ₹{e.gstAmount} ITC
                      </span>
                    ) : (
                      <span className="text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">
                    ₹{Number(e.amount).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => deleteExpense(e.id)} className="p-1.5 text-slate-400 hover:text-text rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[20px] shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Record New Expense</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Expense Title</label>
                <input required type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" placeholder="e.g. AWS Cloud Compute" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Vendor Name</label>
                  <input required type="text" value={formData.vendor} onChange={(e) => setFormData({...formData, vendor: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs">
                    <option value="Office & Tech">Office & Tech</option>
                    <option value="Rent">Rent</option>
                    <option value="Salary">Salary</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Travel">Travel</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Amount (₹)</label>
                  <input required type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Payment Mode</label>
                  <select value={formData.paymentMode} onChange={(e) => setFormData({...formData, paymentMode: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs">
                    <option value="Corporate Card">Corporate Card</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT)</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.gstClaimable}
                    onChange={(e) => setFormData({...formData, gstClaimable: e.target.checked})}
                    className="rounded text-accent"
                  />
                  <span>GST Input Tax Credit (ITC) Claimable</span>
                </label>
                {formData.gstClaimable && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Claimable GST Amount (₹)</label>
                    <input type="number" value={formData.gstAmount} onChange={(e) => setFormData({...formData, gstAmount: Number(e.target.value)})} className="w-full px-2 py-1 bg-white dark:bg-slate-900 border rounded text-xs font-bold text-accent-soft" />
                  </div>
                )}
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-accent text-white rounded-xl text-xs font-bold shadow-md">
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
