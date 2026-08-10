import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { STATIONERY_CATEGORIES } from '../../config/workspaceFeatures';
import {
  Package,
  Plus,
  Search,
  Barcode,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Check,
} from 'lucide-react';

export default function StationeryProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, stationeryVendors, showToast } = useBusiness();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Notebooks',
    brand: '',
    unit: 'pc',
    purchasePrice: 0,
    sellingPrice: 0,
    gstRate: 12,
    stock: 10,
    reorderLevel: 10,
    vendorName: '',
  });

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      barcode: `890${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      category: 'Notebooks',
      brand: '',
      unit: 'pc',
      purchasePrice: 0,
      sellingPrice: 0,
      gstRate: 12,
      stock: 50,
      reorderLevel: 10,
      vendorName: '',
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      category: product.category || 'Notebooks',
      brand: product.brand || '',
      unit: product.unit || 'pc',
      purchasePrice: product.costPrice || product.purchasePrice || 0,
      sellingPrice: product.sellingPrice || product.price || 0,
      gstRate: product.gstRate || 12,
      stock: product.stock || 0,
      reorderLevel: product.minStockLevel || product.reorderLevel || 10,
      vendorName: product.vendorName || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.sku.trim()) {
      showToast('Name and SKU are required', 'error');
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id || editingProduct._id, {
          ...formData,
          costPrice: Number(formData.purchasePrice),
          price: Number(formData.sellingPrice),
          minStockLevel: Number(formData.reorderLevel),
        });
      } else {
        await addProduct({
          ...formData,
          costPrice: Number(formData.purchasePrice),
          price: Number(formData.sellingPrice),
          minStockLevel: Number(formData.reorderLevel),
        });
      }
      setShowModal(false);
    } catch (err) {
      showToast(err.message || 'Failed to save product', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(id);
    }
  };

  const filteredProducts = (products || []).filter((p) => {
    const matchesCat = !selectedCategory || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[20px] border border-stone shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-bottle text-white flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal">Stationery Products Catalogue</h1>
            <p className="text-xs text-warm-gray">Manage inventory products, barcodes, GST rates, & pricing</p>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="bz-btn-primary px-4 py-2 text-xs flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-[18px] border border-stone shadow-subtle space-y-3">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-warm-gray absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by name, SKU, barcode, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bz-input pl-10 text-xs"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bz-input w-48 text-xs"
          >
            <option value="">All Categories ({STATIONERY_CATEGORIES.length})</option>
            {STATIONERY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-stone rounded-[20px] shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="bz-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>SKU & Barcode</th>
                <th>Selling Price</th>
                <th>Purchase Cost</th>
                <th>GST Rate</th>
                <th>Stock</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-warm-gray py-12">
                    No stationery products found. Click <strong>+ Add Product</strong> to add one.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = (p.stock || 0) <= (p.minStockLevel || p.reorderLevel || 10);
                  return (
                    <tr key={p.id || p._id}>
                      <td>
                        <p className="font-bold text-charcoal">{p.name}</p>
                        {p.brand && <p className="text-[10px] text-warm-gray">Brand: {p.brand}</p>}
                      </td>
                      <td>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cream text-warm-gray border border-stone">
                          {p.category}
                        </span>
                      </td>
                      <td className="text-xs font-mono">
                        <p>{p.sku}</p>
                        {p.barcode && <p className="text-[10px] text-warm-gray">Bar: {p.barcode}</p>}
                      </td>
                      <td className="font-bold text-charcoal">₹{p.sellingPrice || p.price} / {p.unit || 'pc'}</td>
                      <td className="text-warm-gray">₹{p.costPrice || p.purchasePrice || 0}</td>
                      <td>{p.gstRate || 12}%</td>
                      <td>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold ${
                            isLow ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.stock} {p.unit || 'pc'}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="p-1.5 bg-cream hover:bg-stone/40 text-charcoal rounded-lg text-xs"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id || p._id)}
                            className="p-1.5 bg-cream hover:bg-terracotta/20 text-terracotta rounded-lg text-xs"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-elev space-y-4 my-8">
            <div className="flex justify-between items-center border-b border-stone pb-3">
              <h3 className="text-sm font-bold text-charcoal flex items-center gap-2">
                <Package className="w-4 h-4 text-green-bottle" /> {editingProduct ? 'Edit Product' : 'Add Stationery Product'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-cream">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classmate A4 Notebook 172pp"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bz-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="bz-input"
                  >
                    {STATIONERY_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Brand</label>
                  <input
                    type="text"
                    placeholder="e.g. Classmate / Reynolds / Nataraj"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="bz-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="bz-input font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Barcode</label>
                  <input
                    type="text"
                    placeholder="e.g. 8901030590123"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="bz-input font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="bz-input font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Purchase Cost (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: Number(e.target.value) })}
                    className="bz-input"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">GST Rate (%)</label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                    className="bz-input"
                  >
                    <option value={0}>0% (Exempt)</option>
                    <option value={5}>5%</option>
                    <option value={12}>12%</option>
                    <option value={18}>18%</option>
                    <option value={28}>28%</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Initial Stock *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="bz-input font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Reorder Level</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: Number(e.target.value) })}
                    className="bz-input"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="bz-input"
                  >
                    <option value="pc">pc (Piece)</option>
                    <option value="pack">pack</option>
                    <option value="ream">ream</option>
                    <option value="box">box</option>
                    <option value="set">set</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-cream text-charcoal rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="bz-btn-primary px-5 text-xs">
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
