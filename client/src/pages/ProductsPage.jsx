import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  FileText,
  Trash2,
  Edit2,
  X,
  Tag,
  Boxes,
  Percent
} from 'lucide-react';

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useBusiness();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'product',
    sku: '',
    hsnSac: '998314',
    category: 'Software',
    sellingPrice: 1000,
    costPrice: 600,
    gstRate: 18,
    stock: 50,
    minStockLevel: 10,
    unit: 'unit',
    description: ''
  });

  const handleOpenModal = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setFormData(prod);
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        type: 'product',
        sku: `AMX-${Date.now().toString().slice(-4)}`,
        hsnSac: '998314',
        category: 'Software',
        sellingPrice: 1000,
        costPrice: 600,
        gstRate: 18,
        stock: 50,
        minStockLevel: 10,
        unit: 'unit',
        description: ''
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
    setModalOpen(false);
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                          p.sku.toLowerCase().includes(search.toLowerCase()) ||
                          p.hsnSac.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'All' || p.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" /> Products & Services Catalog
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage catalog SKUs, HSN/SAC GST codes, pricing & low-stock alerts.</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Item / Service
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by SKU, item name, HSN code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400 font-medium">Item Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="product">Products</option>
            <option value="service">Services</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50">
                <th className="py-3.5 px-4">SKU / Item</th>
                <th className="py-3.5 px-4">HSN/SAC</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Cost Price</th>
                <th className="py-3.5 px-4">GST Rate</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {filteredProducts.map(p => {
                const isLowStock = p.type === 'product' && p.stock <= p.minStockLevel;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {p.sku} • {p.type.toUpperCase()}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">{p.hsnSac}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium rounded">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-blue-600 dark:text-blue-400">
                      ₹{Number(p.sellingPrice).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      ₹{Number(p.costPrice).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-teal-600">
                      {p.gstRate}% GST
                    </td>
                    <td className="py-3.5 px-4">
                      {p.type === 'service' ? (
                        <span className="text-slate-400 text-[10px]">N/A (Service)</span>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className={`font-extrabold ${isLowStock ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                            {p.stock} {p.unit}s
                          </span>
                          {isLowStock && (
                            <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-950 text-red-600 text-[9px] font-bold rounded flex items-center gap-0.5">
                              <AlertTriangle className="w-3 h-3" /> Low Stock
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button onClick={() => handleOpenModal(p)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteProduct(p.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingProduct ? 'Edit Catalog Item' : 'Add New Product / Service'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Item Type</label>
                  <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs">
                    <option value="product font-bold">Physical Product</option>
                    <option value="service">Service / Consultancy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">SKU Code</label>
                  <input required type="text" value={formData.sku} onChange={(e) => setFormData({...formData, sku: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs uppercase font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Product / Service Name</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">HSN / SAC Code</label>
                  <input required type="text" value={formData.hsnSac} onChange={(e) => setFormData({...formData, hsnSac: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-mono" placeholder="998314" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Category</label>
                  <input required type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Selling Price (₹)</label>
                  <input required type="number" value={formData.sellingPrice} onChange={(e) => setFormData({...formData, sellingPrice: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Cost Price (₹)</label>
                  <input required type="number" value={formData.costPrice} onChange={(e) => setFormData({...formData, costPrice: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">GST Tax Rate</label>
                  <select value={formData.gstRate} onChange={(e) => setFormData({...formData, gstRate: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold text-teal-600">
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5% GST</option>
                    <option value={12}>12% GST</option>
                    <option value={18}>18% GST (Standard)</option>
                    <option value={28}>28% GST</option>
                  </select>
                </div>
              </div>

              {formData.type === 'product' && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Current Stock Count</label>
                    <input required type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Min Threshold Alert</label>
                    <input required type="number" value={formData.minStockLevel} onChange={(e) => setFormData({...formData, minStockLevel: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-xl text-xs font-medium">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md">
                  {editingProduct ? 'Update Item' : 'Save Catalog Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
