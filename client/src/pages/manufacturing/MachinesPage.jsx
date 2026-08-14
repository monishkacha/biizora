import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Cpu,
  Plus,
  Search,
  Filter,
  Download,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  UserCheck,
  Calendar,
  Eye,
  Trash2,
  Edit2,
  X,
  Zap,
  Gauge
} from 'lucide-react';
import { INITIAL_MACHINES } from './mockManufacturingData';
import { useBusiness } from '../../context/BusinessContext';

export default function MachinesPage() {
  const { t } = useTranslation();
  const { showToast } = useBusiness();
  const [machines, setMachines] = useState(INITIAL_MACHINES);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedMachine, setSelectedMachine] = useState(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'CNC Mill',
    department: 'Machining',
    capacity: '100 Pcs/hr',
    status: 'Running',
    operator: 'Rajesh Solanki',
    serialNo: 'MC-2026-99',
    purchaseDate: '2024-02-10',
    warrantyExpiry: '2027-02-10',
    operatingHours: 1200,
    utilization: 85
  });

  // KPI Calculations
  const totalMachines = machines.length;
  const runningCount = machines.filter((m) => m.status === 'Running').length;
  const maintenanceCount = machines.filter((m) => m.status === 'Maintenance').length;
  const breakdownCount = machines.filter((m) => m.status === 'Breakdown').length;

  const filteredMachines = machines.filter((m) => {
    const q = search.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q) ||
      m.type.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q) ||
      m.operator.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (statusFilter !== 'All' && m.status !== statusFilter) return false;
    return true;
  });

  const handleOpenDetailDrawer = (m) => {
    setSelectedMachine(m);
    setIsDetailDrawerOpen(true);
  };

  const handleStatusChange = (id, newStatus) => {
    setMachines(
      machines.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
    );
    showToast(`Machine status updated to ${newStatus}`);
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) {
      showToast('Machine name is required', 'error');
      return;
    }

    const newM = {
      ...formData,
      id: `MC-${String(machines.length + 1).padStart(2, '0')}`,
      lastMaintenance: new Date().toISOString().slice(0, 10),
      nextMaintenance: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      currentOrder: 'None'
    };

    setMachines([...machines, newM]);
    showToast('New manufacturing equipment registered');
    setIsAddModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this equipment entry?')) {
      setMachines(machines.filter((m) => m.id !== id));
      showToast('Machine removed from registry');
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
            <span>Plant Maintenance</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-charcoal flex items-center gap-2.5">
            <Cpu className="w-7 h-7 text-green-bottle" /> {t('mfgPages.machinesTitle', 'Machines & Equipment')}
          </h1>
          <p className="text-xs text-warm-gray mt-1">
            {t('mfgPages.machinesSubtitle', 'Monitor CNC, Fiber Lasers, Injection Moulding machines, maintenance schedules, and live shop floor utilization.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => showToast('OEE & Machine Health Audit exported')}
            className="px-3.5 py-2 rounded-xl bg-cream border border-stone text-charcoal font-semibold hover:bg-stone/20 text-xs flex items-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> {t('mfgPages.exportSchedule', 'Export OEE Audit')}
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-green-bottle text-white font-semibold hover:bg-green-forest text-xs flex items-center gap-2 shadow-subtle transition-all"
          >
            <Plus className="w-4 h-4" /> {t('mfgPages.addMachine', '+ Register Machine')}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone p-4 rounded-[18px] shadow-subtle">
          <p className="text-xs text-warm-gray font-medium">{t('mfgPages.totalMachines', 'Total Machines')}</p>
          <h3 className="text-2xl font-bold font-display text-charcoal mt-1">{totalMachines} Equipment</h3>
          <p className="text-[11px] text-green-forest mt-0.5">Shop floor asset register</p>
        </div>
        <div className="bg-white border border-emerald-200 bg-emerald-50/30 p-4 rounded-[18px] shadow-subtle">
          <div className="flex items-center justify-between">
            <p className="text-xs text-emerald-800 font-semibold">{t('mfgPages.runningNow', 'Running Now')}</p>
            <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
          </div>
          <h3 className="text-2xl font-bold font-display text-emerald-700 mt-1">{runningCount} Active</h3>
          <p className="text-[11px] text-emerald-600 mt-0.5">High production output</p>
        </div>
        <div className="bg-white border border-amber-200 bg-amber-50/30 p-4 rounded-[18px] shadow-subtle">
          <div className="flex items-center justify-between">
            <p className="text-xs text-amber-900 font-semibold">{t('mfgPages.underMaintenance', 'Maintenance Due')}</p>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold font-display text-amber-800 mt-1">{maintenanceCount} Due</h3>
          <p className="text-[11px] text-amber-700 mt-0.5">Preventive service queued</p>
        </div>
        <div className="bg-white border border-red-200 bg-red-50/30 p-4 rounded-[18px] shadow-subtle">
          <div className="flex items-center justify-between">
            <p className="text-xs text-red-800 font-semibold">Breakdown / Down</p>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold font-display text-red-700 mt-1">{breakdownCount} Critical</h3>
          <p className="text-[11px] text-red-600 mt-0.5">Requires immediate repair</p>
        </div>
      </div>

      {/* Control Filters */}
      <div className="bg-white p-4 rounded-[18px] border border-stone shadow-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-warm-gray absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search ID, machine name, department or operator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-cream/50 border border-stone rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-green-bottle/30 text-charcoal"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['All', 'Running', 'Idle', 'Maintenance', 'Breakdown'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-green-bottle text-white shadow-xs'
                  : 'bg-cream text-warm-gray hover:text-charcoal'
              }`}
            >
              {st === 'All' ? t('common.all', 'All') : st === 'Running' ? t('mfgPages.runningNow', 'Running') : st === 'Maintenance' ? t('mfgPages.underMaintenance', 'Maintenance') : st}
            </button>
          ))}
        </div>
      </div>

      {/* Machine Data Table */}
      <div className="bg-white rounded-[20px] border border-stone shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone bg-cream/40 text-warm-gray font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">{t('mfgPages.colMachineCode', 'Machine ID & Name')}</th>
                <th className="py-3.5 px-4">{t('mfgPages.colDepartment', 'Type & Department')}</th>
                <th className="py-3.5 px-4">Rated Capacity</th>
                <th className="py-3.5 px-4 text-center">{t('mfgPages.colStatus', 'Status')}</th>
                <th className="py-3.5 px-4">{t('mfgPages.colNextMaintenance', 'Maintenance Schedule')}</th>
                <th className="py-3.5 px-4 text-center">{t('mfgPages.colUtilization', 'Utilization')}</th>
                <th className="py-3.5 px-4">{t('mfgPages.colOperator', 'Operator')}</th>
                <th className="py-3.5 px-4 text-right">{t('mfgPages.colActions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone text-charcoal font-medium">
              {filteredMachines.map((m) => {
                const getStatusBadge = (st) => {
                  switch (st) {
                    case 'Running':
                      return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                    case 'Idle':
                      return 'bg-amber-100 text-amber-800 border border-amber-200';
                    case 'Maintenance':
                      return 'bg-orange-100 text-orange-800 border border-orange-200';
                    case 'Breakdown':
                      return 'bg-red-100 text-red-800 border border-red-200 animate-pulse';
                    default:
                      return 'bg-stone/40 text-warm-gray';
                  }
                };

                return (
                  <tr key={m.id} className="hover:bg-cream/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono">
                      <p className="font-bold text-green-bottle">{m.id}</p>
                      <p className="font-semibold text-charcoal font-sans">{m.name}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-charcoal">{m.type}</p>
                      <p className="text-[11px] text-warm-gray">{m.department}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-charcoal">{m.capacity}</td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(m.status)}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[11px]">
                      <p className="text-charcoal font-semibold">Last: {m.lastMaintenance}</p>
                      <p className="text-warm-gray">Next: {m.nextMaintenance}</p>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="w-20 mx-auto space-y-1">
                        <span className="text-[11px] font-bold text-charcoal">{m.utilization}%</span>
                        <div className="w-full h-1.5 bg-stone/30 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              m.utilization > 80 ? 'bg-emerald-600' : m.utilization > 50 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${m.utilization}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-warm-gray">{m.operator}</td>
                    <td className="py-3.5 px-4 text-right space-x-1">
                      <button
                        onClick={() => handleOpenDetailDrawer(m)}
                        className="p-1.5 text-warm-gray hover:text-green-bottle rounded hover:bg-cream"
                        title="Machine Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleStatusChange(m.id, m.status === 'Running' ? 'Maintenance' : 'Running')}
                        className="p-1.5 text-amber-700 hover:bg-amber-50 rounded"
                        title="Toggle Maintenance"
                      >
                        <Wrench className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                        title="Delete"
                      >
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

      {/* Machine Details Modal / Drawer */}
      {isDetailDrawerOpen && selectedMachine && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-[22px] shadow-2xl border border-stone p-6 space-y-4 h-full max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-green-bottle/10 text-green-bottle px-2 py-0.5 rounded-md font-mono">
                  {selectedMachine.id}
                </span>
                <h3 className="text-lg font-bold text-charcoal mt-1">{selectedMachine.name}</h3>
              </div>
              <button onClick={() => setIsDetailDrawerOpen(false)} className="p-1 text-warm-gray hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo / Visual Placeholder */}
            <div className="h-36 rounded-2xl bg-gradient-to-r from-green-bottle via-[#1B362F] to-[#122722] text-white p-5 flex flex-col justify-between relative overflow-hidden shadow-inner">
              <div className="flex justify-between items-start z-10">
                <div>
                  <p className="text-xs text-yellow-butter font-semibold uppercase">{selectedMachine.type}</p>
                  <p className="text-sm font-bold">{selectedMachine.department} Dept</p>
                </div>
                <Cpu className="w-8 h-8 text-yellow-butter opacity-80" />
              </div>
              <div className="z-10 flex justify-between items-end text-xs">
                <div>
                  <p className="text-[10px] text-emerald-200">Current Operator</p>
                  <p className="font-semibold">{selectedMachine.operator}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-yellow-butter text-charcoal">
                  {selectedMachine.status}
                </span>
              </div>
            </div>

            {/* Machine Parameters Table */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-cream/40 rounded-xl border border-stone">
                <p className="text-[10px] text-warm-gray font-medium uppercase">Serial Number</p>
                <p className="font-mono font-bold text-charcoal mt-0.5">{selectedMachine.serialNo}</p>
              </div>
              <div className="p-3 bg-cream/40 rounded-xl border border-stone">
                <p className="text-[10px] text-warm-gray font-medium uppercase">Operating Hours</p>
                <p className="font-bold text-charcoal mt-0.5">{selectedMachine.operatingHours} hrs</p>
              </div>
              <div className="p-3 bg-cream/40 rounded-xl border border-stone">
                <p className="text-[10px] text-warm-gray font-medium uppercase">Purchase Date</p>
                <p className="font-semibold text-charcoal mt-0.5">{selectedMachine.purchaseDate}</p>
              </div>
              <div className="p-3 bg-cream/40 rounded-xl border border-stone">
                <p className="text-[10px] text-warm-gray font-medium uppercase">Warranty Expiry</p>
                <p className="font-semibold text-emerald-800 mt-0.5">{selectedMachine.warrantyExpiry}</p>
              </div>
            </div>

            <div className="p-3 bg-cream/40 rounded-xl border border-stone text-xs space-y-1">
              <p className="font-semibold text-charcoal">Active Production Order Batch:</p>
              <p className="font-mono text-green-bottle font-bold text-sm">{selectedMachine.currentOrder}</p>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-semibold text-charcoal uppercase tracking-wider text-[11px]">Recent Maintenance Log History:</p>
              <div className="space-y-2">
                <div className="p-3 bg-cream/30 border border-stone rounded-xl">
                  <div className="flex justify-between font-semibold text-charcoal">
                    <span>Preventive Oil & Calibration Audit</span>
                    <span className="text-[10px] text-warm-gray">{selectedMachine.lastMaintenance}</span>
                  </div>
                  <p className="text-[11px] text-warm-gray mt-1">Hydraulic fluid changed, spindle alignment checked, sensor re-calibrated.</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                onClick={() => setIsDetailDrawerOpen(false)}
                className="px-5 py-2 rounded-xl bg-green-bottle text-white font-semibold text-xs"
              >
                Close Machine File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Machine Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-[22px] shadow-2xl border border-stone p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone pb-3">
              <h3 className="text-lg font-bold text-charcoal">+ Register Shop Floor Equipment</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-warm-gray hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Machine Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. 5-Axis CNC Milling Station"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Machine Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  >
                    <option value="CNC Mill">CNC Mill</option>
                    <option value="Laser Cutting">Laser Cutting</option>
                    <option value="Injection Moulding">Injection Moulding</option>
                    <option value="Lathe">Lathe</option>
                    <option value="Assembly Conveyor">Assembly Conveyor</option>
                    <option value="Bending Press">Bending Press</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Machining / Plastics / Sheet Metal"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Rated Capacity</label>
                  <input
                    type="text"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    placeholder="120 Pcs/hr"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Assigned Operator</label>
                  <input
                    type="text"
                    value={formData.operator}
                    onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                    placeholder="Rajesh Solanki"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serialNo}
                    onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                    placeholder="CNC-5X-2024"
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs font-mono text-charcoal"
                  />
                </div>
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
                  Register Machine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
