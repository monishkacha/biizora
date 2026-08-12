import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Sliders,
  Edit2,
  Trash2,
  Eye,
  X,
  PackageCheck,
  Building2,
  Tag
} from 'lucide-react';
import { INITIAL_RAW_MATERIALS, INITIAL_SUPPLIERS } from './mockManufacturingData';
import { useBusiness } from '../../context/BusinessContext';

export default function RawMaterialsPage() {
  const { t } = useTranslation();
  const { showToast } = useBusiness();
  const [materials, setMaterials] = useState(INITIAL_RAW_MATERIALS);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockActionType, setStockActionType] = useState('in'); // 'in' | 'out' | 'adjust'
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [stockChangeQty, setStockChangeQty] = useState(100);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Metals',
    unit: 'Kg',
    stock: 500,
    reorderLevel: 200,
    unitCost: 150,
    supplier: 'Apex Metals & Alloys',
    location: 'Rack A-01',
    hsnCode: '7219',
    description: ''
  });

  // KPI Calculations
  const totalMaterials = materials.length;
  const lowStockItems = materials.filter((m) => m.stock <= m.reorderLevel);
  const totalInventoryValue = materials.reduce((sum, m) => sum + m.stock * m.unitCost, 0);

  // Search and Filter
  const filteredMaterials = materials.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(q) ||
      m.code.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.supplier.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (selectedCategory !== 'All' && m.category !== selectedCategory) return false;
    return true;
  });

  const categories = ['All', ...new Set(materials.map((m) => m.category))];

  const handleOpenAddModal = () => {
    setFormData({
      code: `RM-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      name: '',
      category: 'Metals',
      unit: 'Kg',
      stock: 500,
      reorderLevel: 200,
      unitCost: 150,
      supplier: INITIAL_SUPPLIERS[0]?.name || 'Apex Metals & Alloys',
      location: 'Rack A-01',
      hsnCode: '7219',
      description: ''
    });
    setIsAddModalOpen(true);
  };

  const handleAddMaterialSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      showToast('Material name and code are required', 'error');
      return;
    }

    const newMat = {
      ...formData,
      id: `RM-${String(materials.length + 1).padStart(3, '0')}`,
      stock: Number(formData.stock),
      reorderLevel: Number(formData.reorderLevel),
      unitCost: Number(formData.unitCost)
    };

    setMaterials([newMat, ...materials]);
    showToast('New raw material added to inventory');
    setIsAddModalOpen(false);
  };

  const handleOpenStockModal = (material, action) => {
    setSelectedMaterial(material);
    setStockActionType(action);
    setStockChangeQty(50);
    setIsStockModalOpen(true);
  };

  const handleStockUpdateSubmit = (e) => {
    e.preventDefault();
    if (!selectedMaterial) return;

    const qty = Number(stockChangeQty);
    setMaterials(
      materials.map((m) => {
        if (m.id !== selectedMaterial.id) return m;

        let newStock = m.stock;
        if (stockActionType === 'in') newStock += qty;
        else if (stockActionType === 'out') newStock = Math.max(0, newStock - qty);
        else if (stockActionType === 'adjust') newStock = qty;

        return { ...m, stock: newStock };
      })
    );

    showToast(`Stock updated for ${selectedMaterial.name}`);
    setIsStockModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Remove raw material record?')) {
      setMaterials(materials.filter((m) => m.id !== id));
      showToast('Raw material removed');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[22px] border border-stone shadow-card">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-green-forest uppercase tracking-wider mb-1">
            <span>Manufacturing ERP</span>
            <span>•</span>
            <span>Raw Materials Inventory</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-charcoal flex items-center gap-2.5">
            <Boxes className="w-7 h-7 text-green-bottle" /> Raw Materials Stock
          </h1>
          <p className="text-xs text-warm-gray mt-1">
            Track metals, polymers, fasteners, and chemical raw stock, reorder levels, and stock movements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => showToast('Stock Valuation Report PDF generated')}
            className="px-3.5 py-2 rounded-xl bg-cream border border-stone text-charcoal font-semibold hover:bg-stone/20 text-xs flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Valuation Report
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-green-bottle text-white font-semibold hover:bg-green-forest text-xs flex items-center gap-2 shadow-subtle transition-all"
          >
            <Plus className="w-4 h-4" /> + Add Material
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone p-4 rounded-[18px] shadow-subtle">
          <p className="text-xs text-warm-gray font-medium">Total Raw Materials</p>
          <h3 className="text-2xl font-bold font-display text-charcoal mt-1">{totalMaterials} SKUs</h3>
          <p className="text-[11px] text-green-forest mt-0.5">Across {categories.length - 1} categories</p>
        </div>

        <div className="bg-white border border-red-200 bg-red-50/30 p-4 rounded-[18px] shadow-subtle">
          <div className="flex items-center justify-between">
            <p className="text-xs text-red-800 font-semibold">Low Stock Alert</p>
            <AlertTriangle className="w-4 h-4 text-red-600 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold font-display text-red-700 mt-1">{lowStockItems.length} SKUs</h3>
          <p className="text-[11px] text-red-600 mt-0.5">Below reorder thresholds</p>
        </div>

        <div className="bg-white border border-stone p-4 rounded-[18px] shadow-subtle">
          <p className="text-xs text-warm-gray font-medium">Total Inventory Value</p>
          <h3 className="text-2xl font-bold font-display text-emerald-800 mt-1">
            ₹{totalInventoryValue.toLocaleString('en-IN')}
          </h3>
          <p className="text-[11px] text-emerald-700 mt-0.5">At current unit cost valuation</p>
        </div>

        <div className="bg-white border border-stone p-4 rounded-[18px] shadow-subtle">
          <p className="text-xs text-warm-gray font-medium">Primary Supplier Base</p>
          <h3 className="text-2xl font-bold font-display text-charcoal mt-1">
            {new Set(materials.map((m) => m.supplier)).size} Vendors
          </h3>
          <p className="text-[11px] text-warm-gray mt-0.5">Gujarat GIDC suppliers</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-[18px] border border-stone shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-warm-gray absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search code, material, category or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream/50 border border-stone rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-bottle/30 text-charcoal"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-warm-gray font-medium shrink-0">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-green-bottle text-white shadow-xs'
                  : 'bg-cream text-warm-gray hover:text-charcoal'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Raw Materials Table */}
      <div className="bg-white rounded-[20px] border border-stone shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone bg-cream/40 text-warm-gray font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Code & Material</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Current Stock</th>
                <th className="py-3.5 px-4 text-right">Reorder Level</th>
                <th className="py-3.5 px-4 text-right">Unit Cost (₹)</th>
                <th className="py-3.5 px-4 text-right">Total Value (₹)</th>
                <th className="py-3.5 px-4">Preferred Supplier</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Stock Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone text-charcoal font-medium">
              {filteredMaterials.map((mat) => {
                const isLow = mat.stock <= mat.reorderLevel;
                const totalVal = mat.stock * mat.unitCost;

                return (
                  <tr
                    key={mat.id}
                    className={`hover:bg-cream/30 transition-colors ${
                      isLow ? 'bg-red-50/40' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-charcoal">{mat.name}</p>
                      <div className="flex items-center gap-2 text-[11px] text-warm-gray mt-0.5">
                        <span className="font-mono text-green-bottle">{mat.code}</span>
                        <span>•</span>
                        <span>{mat.location}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-stone/40 text-charcoal text-[11px] font-semibold">
                        {mat.category}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 text-right font-extrabold ${isLow ? 'text-red-700 font-mono text-sm' : 'text-charcoal'}`}>
                      {mat.stock.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-warm-gray">{mat.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-warm-gray">
                      {mat.reorderLevel.toLocaleString('en-IN')} {mat.unit}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      ₹{Number(mat.unitCost).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-charcoal">
                      ₹{totalVal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-warm-gray">{mat.supplier}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          isLow
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenStockModal(mat, 'in')}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold inline-flex items-center gap-0.5"
                        title="Stock In"
                      >
                        <ArrowDownLeft className="w-3 h-3" /> +In
                      </button>
                      <button
                        onClick={() => handleOpenStockModal(mat, 'out')}
                        className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold inline-flex items-center gap-0.5"
                        title="Stock Out"
                      >
                        <ArrowUpRight className="w-3 h-3" /> -Out
                      </button>
                      <button
                        onClick={() => handleDelete(mat.id)}
                        className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredMaterials.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-warm-gray">
                    No raw materials found for this search/category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Raw Material Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-[22px] shadow-2xl border border-stone p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone pb-3">
              <h3 className="text-lg font-bold text-charcoal">+ Add New Raw Material SKU</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-warm-gray hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMaterialSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Material Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. SS 304 Sheets 2mm"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Material Code (SKU) *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="RM-SS-304"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs font-mono text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  >
                    <option value="Metals">Metals</option>
                    <option value="Polymers">Polymers</option>
                    <option value="Fasteners">Fasteners</option>
                    <option value="Chemicals">Chemicals</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Rubber">Rubber</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Unit of Measurement</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  >
                    <option value="Kg">Kg</option>
                    <option value="Liter">Liter</option>
                    <option value="Piece">Piece</option>
                    <option value="Meter">Meter</option>
                    <option value="Box">Box</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Opening Stock</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Reorder Level</label>
                  <input
                    type="number"
                    value={formData.reorderLevel}
                    onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Unit Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Preferred Supplier</label>
                  <select
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  >
                    {INITIAL_SUPPLIERS.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Warehouse Location / Rack Bin</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Rack A-12 / Bin 04"
                  className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cream border border-stone text-charcoal font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-green-bottle text-white font-semibold"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock In / Out / Adjust Modal */}
      {isStockModalOpen && selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-[22px] shadow-2xl border border-stone p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone pb-3">
              <div>
                <h3 className="text-base font-bold text-charcoal">
                  {stockActionType === 'in' ? '+ Stock In Receive' : stockActionType === 'out' ? '- Stock Out Issue' : 'Adjust Stock'}
                </h3>
                <p className="text-xs text-warm-gray">{selectedMaterial.name} ({selectedMaterial.code})</p>
              </div>
              <button onClick={() => setIsStockModalOpen(false)} className="p-1 text-warm-gray hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStockUpdateSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-cream/40 rounded-xl border border-stone flex justify-between items-center">
                <span className="text-warm-gray font-medium">Current Stock Level:</span>
                <span className="font-bold text-charcoal text-sm">{selectedMaterial.stock} {selectedMaterial.unit}</span>
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">
                  {stockActionType === 'in' ? 'Quantity to Add' : stockActionType === 'out' ? 'Quantity to Issue' : 'New Exact Stock Level'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={stockChangeQty}
                  onChange={(e) => setStockChangeQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream/50 border border-stone rounded-xl text-sm font-bold text-charcoal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cream border border-stone text-charcoal font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-green-bottle text-white font-semibold"
                >
                  Confirm Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
