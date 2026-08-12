import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  Download,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  AlertCircle,
  Cpu,
  UserCheck,
  FileText,
  Trash2,
  Edit2,
  Eye,
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { INITIAL_PRODUCTION_ORDERS, INITIAL_MACHINES, INITIAL_RAW_MATERIALS } from './mockManufacturingData';
import { useBusiness } from '../../context/BusinessContext';

export default function ProductionOrdersPage() {
  const { t } = useTranslation();
  const { showToast } = useBusiness();
  const [orders, setOrders] = useState(INITIAL_PRODUCTION_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBomModalOpen, setIsBomModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [formData, setFormData] = useState({
    productName: '',
    productSku: '',
    batchNo: '',
    quantity: 500,
    unit: 'Piece',
    startDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    machine: INITIAL_MACHINES[0]?.name || 'MC-01',
    supervisor: 'Ramesh Bhai',
    progress: 0,
    status: 'Planned',
    priority: 'High',
    notes: ''
  });

  // KPI Calculations
  const plannedCount = orders.filter((o) => o.status === 'Planned').length;
  const inProgressCount = orders.filter((o) => o.status === 'In Progress').length;
  const completedCount = orders.filter((o) => o.status === 'Completed').length;
  const onHoldCount = orders.filter((o) => o.status === 'On Hold' || o.status === 'Delayed').length;

  // Filter
  const filteredOrders = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      o.id.toLowerCase().includes(q) ||
      o.productName.toLowerCase().includes(q) ||
      o.productSku.toLowerCase().includes(q) ||
      o.batchNo.toLowerCase().includes(q) ||
      o.supervisor.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    return true;
  });

  const handleOpenAddModal = () => {
    const num = orders.length + 90;
    setFormData({
      productName: '',
      productSku: 'PRD-NEW-01',
      batchNo: `BATCH-88${num}`,
      quantity: 500,
      unit: 'Piece',
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      machine: INITIAL_MACHINES[0]?.name || 'MC-01',
      supervisor: 'Ramesh Bhai',
      progress: 0,
      status: 'Planned',
      priority: 'Normal',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleStatusToggle = (orderId, newStatus, newProgress) => {
    setOrders(
      orders.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          status: newStatus,
          progress: newProgress !== undefined ? newProgress : o.progress
        };
      })
    );
    showToast(`Order status updated to ${newStatus}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.productName) {
      showToast('Product name is required', 'error');
      return;
    }

    const newPO = {
      ...formData,
      id: `PO-2026-${String(orders.length + 93).padStart(3, '0')}`,
      quantity: Number(formData.quantity)
    };

    setOrders([newPO, ...orders]);
    showToast('New Production Order generated');
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this production order?')) {
      setOrders(orders.filter((o) => o.id !== id));
      showToast('Production order removed');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[22px] border border-stone shadow-card">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-green-forest uppercase tracking-wider mb-1">
            <span>Manufacturing ERP</span>
            <span>•</span>
            <span>Production Planning</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-charcoal flex items-center gap-2.5">
            <ClipboardList className="w-7 h-7 text-green-bottle" /> Production Orders
          </h1>
          <p className="text-xs text-warm-gray mt-1">
            Schedule shop floor batches, monitor live progress, assign operators, and track completion timelines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => showToast('Production Dispatch Schedule PDF exported')}
            className="px-3.5 py-2 rounded-xl bg-cream border border-stone text-charcoal font-semibold hover:bg-stone/20 text-xs flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Export Schedule
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-xl bg-green-bottle text-white font-semibold hover:bg-green-forest text-xs flex items-center gap-2 shadow-subtle transition-all"
          >
            <Plus className="w-4 h-4" /> + Create Production Order
          </button>
        </div>
      </div>

      {/* Top KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone p-4 rounded-[18px] shadow-subtle">
          <p className="text-xs text-warm-gray font-medium">Planned Orders</p>
          <h3 className="text-2xl font-bold font-display text-blue-700 mt-1">{plannedCount}</h3>
          <p className="text-[11px] text-blue-600 mt-0.5">Queued for machine assignment</p>
        </div>
        <div className="bg-white border border-stone p-4 rounded-[18px] shadow-subtle">
          <p className="text-xs text-warm-gray font-medium">In Progress</p>
          <h3 className="text-2xl font-bold font-display text-emerald-700 mt-1">{inProgressCount}</h3>
          <p className="text-[11px] text-emerald-600 mt-0.5">Active shop floor production</p>
        </div>
        <div className="bg-white border border-stone p-4 rounded-[18px] shadow-subtle">
          <p className="text-xs text-warm-gray font-medium">Completed Batches</p>
          <h3 className="text-2xl font-bold font-display text-purple-700 mt-1">{completedCount}</h3>
          <p className="text-[11px] text-purple-600 mt-0.5">Transferred to finished warehouse</p>
        </div>
        <div className="bg-white border border-stone p-4 rounded-[18px] shadow-subtle">
          <p className="text-xs text-warm-gray font-medium">On Hold / Delayed</p>
          <h3 className="text-2xl font-bold font-display text-amber-700 mt-1">{onHoldCount}</h3>
          <p className="text-[11px] text-amber-600 mt-0.5">Material or machine bottlenecks</p>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-[18px] border border-stone shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-warm-gray absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search PO#, batch#, product or supervisor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream/50 border border-stone rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-bottle/30 text-charcoal"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Planned', 'In Progress', 'Completed', 'On Hold'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-green-bottle text-white shadow-xs'
                  : 'bg-cream text-warm-gray hover:text-charcoal'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-[20px] border border-stone shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone bg-cream/40 text-warm-gray font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">PO & Batch No</th>
                <th className="py-3.5 px-4">Product Name & SKU</th>
                <th className="py-3.5 px-4 text-right">Batch Qty</th>
                <th className="py-3.5 px-4">Schedule Dates</th>
                <th className="py-3.5 px-4">Assigned Machine & Supervisor</th>
                <th className="py-3.5 px-4 text-center">Progress</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone text-charcoal font-medium">
              {filteredOrders.map((po) => {
                const getStatusColor = (st) => {
                  switch (st) {
                    case 'Planned': return 'bg-blue-100 text-blue-800';
                    case 'In Progress': return 'bg-emerald-100 text-emerald-800';
                    case 'Completed': return 'bg-purple-100 text-purple-800';
                    case 'On Hold': return 'bg-amber-100 text-amber-900';
                    default: return 'bg-stone/40 text-warm-gray';
                  }
                };

                return (
                  <tr key={po.id} className="hover:bg-cream/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <p className="font-bold text-green-bottle">{po.id}</p>
                      <p className="text-[11px] text-warm-gray">{po.batchNo}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-charcoal">{po.productName}</p>
                      <p className="text-[11px] text-warm-gray">SKU: {po.productSku}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-charcoal">
                      {po.quantity.toLocaleString('en-IN')} <span className="text-[10px] font-normal text-warm-gray">{po.unit}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px]">
                      <p className="text-charcoal font-semibold">Start: {po.startDate}</p>
                      <p className="text-warm-gray">Due: {po.dueDate}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-charcoal">{po.machine}</p>
                      <p className="text-[11px] text-warm-gray">Sup: {po.supervisor}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="w-24 mx-auto space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-charcoal">
                          <span>{po.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-stone/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              po.progress === 100
                                ? 'bg-emerald-600'
                                : po.progress > 0
                                ? 'bg-green-bottle'
                                : 'bg-stone/60'
                            }`}
                            style={{ width: `${po.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(po.status)}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      {po.status === 'Planned' && (
                        <button
                          onClick={() => handleStatusToggle(po.id, 'In Progress', 25)}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold inline-flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" /> Start
                        </button>
                      )}
                      {po.status === 'In Progress' && (
                        <>
                          <button
                            onClick={() => handleStatusToggle(po.id, 'Completed', 100)}
                            className="px-2 py-1 bg-purple-600 text-white rounded text-[10px] font-bold inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Complete
                          </button>
                          <button
                            onClick={() => handleStatusToggle(po.id, 'On Hold')}
                            className="px-2 py-1 bg-amber-600 text-white rounded text-[10px] font-bold"
                          >
                            Pause
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setSelectedOrder(po);
                          setIsBomModalOpen(true);
                        }}
                        className="p-1.5 text-warm-gray hover:text-green-bottle rounded hover:bg-cream"
                        title="View Material Preview (BOM)"
                      >
                        <Layers className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(po.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                        title="Delete Order"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-warm-gray">
                    No production orders match the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Production Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-white rounded-[22px] shadow-2xl border border-stone p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone pb-3">
              <h3 className="text-lg font-bold text-charcoal">+ Create Production Order Batch</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-warm-gray hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    placeholder="e.g. Heavy Duty Valve Body"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Product SKU</label>
                  <input
                    type="text"
                    value={formData.productSku}
                    onChange={(e) => setFormData({ ...formData, productSku: e.target.value })}
                    placeholder="PRD-VLV-01"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs font-mono text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Batch Number</label>
                  <input
                    type="text"
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                    placeholder="BATCH-8805"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs font-mono text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Order Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Assigned Machine</label>
                  <select
                    value={formData.machine}
                    onChange={(e) => setFormData({ ...formData, machine: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  >
                    {INITIAL_MACHINES.map((m) => (
                      <option key={m.id} value={`${m.name} (${m.id})`}>{m.name} ({m.id})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Supervisor / Operator</label>
                  <input
                    type="text"
                    value={formData.supervisor}
                    onChange={(e) => setFormData({ ...formData, supervisor: e.target.value })}
                    placeholder="Ramesh Bhai"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Notes & Specifications</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Special testing or tolerance specifications..."
                  className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-cream border border-stone text-charcoal font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-green-bottle text-white font-semibold"
                >
                  Generate Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BOM / Raw Material Requirement Preview Modal */}
      {isBomModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-[22px] shadow-2xl border border-stone p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone pb-3">
              <div>
                <h3 className="text-base font-bold text-charcoal">Raw Material Allocation Preview</h3>
                <p className="text-xs text-warm-gray">{selectedOrder.productName} ({selectedOrder.id})</p>
              </div>
              <button onClick={() => setIsBomModalOpen(false)} className="p-1 text-warm-gray hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-cream/40 rounded-xl border border-stone text-xs space-y-1">
              <p className="font-semibold text-charcoal">Batch Specs:</p>
              <p className="text-warm-gray">Batch Qty: <strong className="text-charcoal">{selectedOrder.quantity} {selectedOrder.unit}</strong> | Machine: {selectedOrder.machine}</p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-semibold text-charcoal uppercase tracking-wider text-[11px]">Required Raw Material Items:</p>
              {INITIAL_RAW_MATERIALS.slice(0, 3).map((rm) => (
                <div key={rm.id} className="p-2.5 bg-cream/30 border border-stone rounded-xl flex justify-between items-center">
                  <div>
                    <p className="font-bold text-charcoal">{rm.name}</p>
                    <p className="text-[10px] text-warm-gray">Code: {rm.code} • Stock Available: {rm.stock} {rm.unit}</p>
                  </div>
                  <span className="font-mono font-bold text-green-bottle text-xs">
                    {(selectedOrder.quantity * 0.4).toFixed(0)} {rm.unit}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsBomModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-green-bottle text-white font-semibold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
