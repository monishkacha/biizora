import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Factory,
  Plus,
  Search,
  Filter,
  Download,
  ArrowRightLeft,
  PackageCheck,
  Truck,
  Printer,
  MapPin,
  FileText,
  Trash2,
  Edit2,
  Eye,
  X,
  Layers,
  Boxes
} from 'lucide-react';
import { INITIAL_WAREHOUSES, INITIAL_WAREHOUSE_ITEMS } from './mockManufacturingData';
import { useBusiness } from '../../context/BusinessContext';

export default function WarehousePage() {
  const { t } = useTranslation();
  const { showToast } = useBusiness();
  const [warehouses, setWarehouses] = useState(INITIAL_WAREHOUSES);
  const [items, setItems] = useState(INITIAL_WAREHOUSE_ITEMS);
  const [selectedWarehouse, setSelectedWarehouse] = useState('All');
  const [search, setSearch] = useState('');

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferData, setTransferData] = useState({
    itemId: '',
    fromWarehouse: 'Main Central Warehouse (WH-A)',
    toWarehouse: 'Finished Goods Warehouse (WH-C)',
    transferQty: 50,
    notes: ''
  });

  const filteredItems = items.filter((item) => {
    const q = search.toLowerCase();
    const matchesSearch =
      item.sku.toLowerCase().includes(q) ||
      item.itemName.toLowerCase().includes(q) ||
      item.warehouse.toLowerCase().includes(q) ||
      item.rackBin.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (selectedWarehouse !== 'All' && !item.warehouse.includes(selectedWarehouse)) return false;
    return true;
  });

  const handleOpenTransferModal = (item = null) => {
    setTransferData({
      itemId: item ? item.id : items[0]?.id || '',
      fromWarehouse: item ? item.warehouse : warehouses[0]?.name || '',
      toWarehouse: warehouses[2]?.name || 'Finished Goods Warehouse (WH-C)',
      transferQty: 50,
      notes: ''
    });
    setIsTransferModalOpen(true);
  };

  const handleTransferSubmit = (e) => {
    e.preventDefault();
    const targetItem = items.find((i) => i.id === transferData.itemId);
    if (!targetItem) {
      showToast('Select valid item to transfer', 'error');
      return;
    }

    const qty = Number(transferData.transferQty);
    if (targetItem.availableQty < qty) {
      showToast('Transfer quantity exceeds available stock', 'error');
      return;
    }

    setItems(
      items.map((i) => {
        if (i.id === targetItem.id) {
          return {
            ...i,
            availableQty: i.availableQty - qty,
            lastMovement: `${new Date().toISOString().slice(0, 10)} ${new Date().toTimeString().slice(0, 5)}`
          };
        }
        return i;
      })
    );

    showToast(`Stock transfer note generated: ${qty} ${targetItem.unit} moved`);
    setIsTransferModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[22px] border border-stone shadow-card">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-green-forest uppercase tracking-wider mb-1">
            <span>Manufacturing ERP</span>
            <span>•</span>
            <span>Plant Logistics</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-charcoal flex items-center gap-2.5">
            <Factory className="w-7 h-7 text-green-bottle" /> Warehouse & Bin Locations
          </h1>
          <p className="text-xs text-warm-gray mt-1">
            Multi-warehouse stock distribution, rack & bin tracking, inter-store transfers, and dispatch staging.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => showToast('Stock Transfer Manifest PDF downloaded')}
            className="px-3.5 py-2 rounded-xl bg-cream border border-stone text-charcoal font-semibold hover:bg-stone/20 text-xs flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" /> Print Transfer Note
          </button>
          <button
            onClick={() => handleOpenTransferModal()}
            className="px-4 py-2 rounded-xl bg-green-bottle text-white font-semibold hover:bg-green-forest text-xs flex items-center gap-2 shadow-subtle transition-all"
          >
            <ArrowRightLeft className="w-4 h-4" /> Transfer Stock
          </button>
        </div>
      </div>

      {/* Warehouse Zone Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {warehouses.map((wh) => (
          <div key={wh.id} className="bg-white border border-stone p-4 rounded-[18px] shadow-subtle space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-green-bottle/10 text-green-bottle px-2 py-0.5 rounded font-mono">
                  {wh.code}
                </span>
                <h4 className="font-bold text-charcoal text-sm mt-1">{wh.name}</h4>
              </div>
              <MapPin className="w-4 h-4 text-warm-gray" />
            </div>

            <div className="text-xs space-y-0.5 text-warm-gray">
              <p>{wh.location}</p>
              <p>Supervisor: <strong className="text-charcoal">{wh.supervisor}</strong></p>
            </div>

            <div className="pt-2 border-t border-stone flex justify-between items-center text-xs">
              <span className="text-warm-gray">Capacity Utilized:</span>
              <span className="font-bold text-green-bottle">{wh.capacity}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Zone Filter Bar */}
      <div className="bg-white p-4 rounded-[18px] border border-stone shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-warm-gray absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search SKU, item, warehouse or rack bin..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream/50 border border-stone rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-bottle/30 text-charcoal"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <span className="text-xs text-warm-gray font-medium shrink-0">Zone Filter:</span>
          {['All', 'WH-A', 'WH-B', 'WH-C', 'WH-D'].map((wCode) => (
            <button
              key={wCode}
              onClick={() => setSelectedWarehouse(wCode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedWarehouse === wCode
                  ? 'bg-green-bottle text-white shadow-xs'
                  : 'bg-cream text-warm-gray hover:text-charcoal'
              }`}
            >
              {wCode}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid Table */}
      <div className="bg-white rounded-[20px] border border-stone shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone bg-cream/40 text-warm-gray font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">SKU & Item Name</th>
                <th className="py-3.5 px-4">Warehouse Zone</th>
                <th className="py-3.5 px-4">Rack & Bin Location</th>
                <th className="py-3.5 px-4 text-right">Available Qty</th>
                <th className="py-3.5 px-4 text-right">Reserved Qty</th>
                <th className="py-3.5 px-4 text-right">Damaged Qty</th>
                <th className="py-3.5 px-4">Last Movement</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone text-charcoal font-medium">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-cream/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-charcoal">{item.itemName}</p>
                    <p className="text-[11px] font-mono text-green-bottle">{item.sku}</p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-charcoal">{item.warehouse}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-stone/40 font-mono text-[11px] font-bold text-charcoal">
                      {item.rackBin}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-emerald-800 text-sm">
                    {item.availableQty.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-warm-gray">{item.unit}</span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-amber-800">
                    {item.reservedQty.toLocaleString('en-IN')} {item.unit}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-red-600">
                    {item.damagedQty} {item.unit}
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-warm-gray font-mono">{item.lastMovement}</td>
                  <td className="py-3.5 px-4 text-right space-x-1">
                    <button
                      onClick={() => handleOpenTransferModal(item)}
                      className="px-2 py-1 bg-green-bottle text-white rounded text-[10px] font-bold inline-flex items-center gap-1"
                    >
                      <ArrowRightLeft className="w-3 h-3" /> Move
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Transfer Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-[22px] shadow-2xl border border-stone p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone pb-3">
              <h3 className="text-lg font-bold text-charcoal">Inter-Warehouse Stock Transfer</h3>
              <button onClick={() => setIsTransferModalOpen(false)} className="p-1 text-warm-gray hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Select Item SKU</label>
                <select
                  value={transferData.itemId}
                  onChange={(e) => setTransferData({ ...transferData, itemId: e.target.value })}
                  className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                >
                  {items.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.itemName} ({i.sku}) - Avail: {i.availableQty} {i.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">From Source Warehouse</label>
                  <select
                    value={transferData.fromWarehouse}
                    onChange={(e) => setTransferData({ ...transferData, fromWarehouse: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-charcoal block mb-1">To Destination Zone</label>
                  <select
                    value={transferData.toWarehouse}
                    onChange={(e) => setTransferData({ ...transferData, toWarehouse: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.name}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Transfer Quantity</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={transferData.transferQty}
                  onChange={(e) => setTransferData({ ...transferData, transferQty: e.target.value })}
                  className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs font-bold text-charcoal"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Stock Transfer Reason / Notes</label>
                <input
                  type="text"
                  value={transferData.notes}
                  onChange={(e) => setTransferData({ ...transferData, notes: e.target.value })}
                  placeholder="e.g. Allocation for PO-2026-089 production batch"
                  className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cream border border-stone text-charcoal font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-green-bottle text-white font-semibold"
                >
                  Generate Stock Transfer Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
