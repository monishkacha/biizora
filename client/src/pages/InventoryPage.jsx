import React from 'react';
import { useBusiness } from '../context/BusinessContext';
import { Boxes, AlertTriangle, TrendingUp, Package, Plus, CheckCircle2 } from 'lucide-react';

export default function InventoryPage() {
  const { products, updateProduct } = useBusiness();

  const physicalProducts = products.filter(p => p.type === 'product');
  const lowStockItems = physicalProducts.filter(p => p.stock <= p.minStockLevel);

  const totalCostValuation = physicalProducts.reduce((sum, p) => sum + (p.stock * p.costPrice), 0);
  const totalRetailValuation = physicalProducts.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);

  const handleRestock = (prodId, addQty = 20) => {
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      updateProduct(prodId, { stock: prod.stock + addQty });
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Boxes className="w-6 h-6 text-accent" /> Stock & Inventory Valuation
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Track warehouse stock levels, inventory asset values, and reorder thresholds.</p>
      </div>

      {/* Valuation KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-400">Total Inventory Cost Value</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            ₹{totalCostValuation.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Cost price asset valuation</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-400">Retail Sales Valuation</span>
          <p className="text-2xl font-extrabold text-accent dark:text-text-muted mt-1">
            ₹{totalRetailValuation.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-accent-soft font-semibold mt-1">Potential Profit: ₹{(totalRetailValuation - totalCostValuation).toLocaleString('en-IN')}</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
          <span className="text-xs font-semibold text-slate-400">Stock Alerts Triggered</span>
          <p className={`text-2xl font-extrabold mt-1 ${lowStockItems.length > 0 ? 'text-accent-soft' : 'text-accent-soft'}`}>
            {lowStockItems.length} Low Stock Alert{lowStockItems.length === 1 ? '' : 's'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">{physicalProducts.length} physical SKUs tracked</p>
        </div>

      </div>

      {/* Low Stock Warning Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-bg-hover dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-text dark:text-red-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-red-900 dark:text-red-200">Critical Low Stock Threshold Detected</h4>
              <p className="text-[11px] text-red-700 dark:text-red-300">
                {lowStockItems.map(i => i.name).join(', ')} stock levels are below min threshold.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stock Level Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Physical Inventory Logs</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/50">
                <th className="py-3.5 px-4">Item Name</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Min Threshold</th>
                <th className="py-3.5 px-4">Asset Value (Cost)</th>
                <th className="py-3.5 px-4 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {physicalProducts.map(p => {
                const isLow = p.stock <= p.minStockLevel;

                return (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">{p.name}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">{p.sku}</td>
                    <td className="py-3.5 px-4 font-extrabold">
                      <span className={isLow ? 'text-accent-soft font-bold' : 'text-slate-900 dark:text-white'}>
                        {p.stock} {p.unit}s
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{p.minStockLevel} {p.unit}s</td>
                    <td className="py-3.5 px-4 font-semibold">₹{(p.stock * p.costPrice).toLocaleString('en-IN')}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleRestock(p.id, 25)}
                        className="px-3 py-1 bg-accent hover:bg-text text-white rounded-lg text-[10px] font-bold shadow transition-colors"
                      >
                        + Restock 25 Units
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
