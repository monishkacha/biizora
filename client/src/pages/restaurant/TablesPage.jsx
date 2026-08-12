import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '../../context/BusinessContext';
import {
  Users,
  Clock,
  Receipt,
  Plus,
  ArrowRightLeft,
  Trash2,
  CheckCircle,
  Sparkles,
  LayoutGrid,
  List,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TablesPage() {
  const { t, i18n } = useTranslation();
  const isGu = i18n.language?.startsWith('gu');
  const navigate = useNavigate();
  const { tables, orders, updateTableStatus, createTable, showToast } = useBusiness();

  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedTable, setSelectedTable] = useState(null);
  const [modalAction, setModalAction] = useState(null); // 'seat' | 'transfer' | 'newTable'

  // Modal form states
  const [guestCount, setGuestCount] = useState(2);
  const [serverName, setServerName] = useState('Rahul');
  const [targetTableId, setTargetTableId] = useState('');
  const [newTableNum, setNewTableNum] = useState('');
  const [newTableCap, setNewTableCap] = useState(4);
  const [newTableSec, setNewTableSec] = useState('Indoor');

  const sections = ['All', 'Indoor', 'Outdoor', 'Private Dining'];

  const filteredTables = tables.filter(
    (t) => selectedSection === 'All' || t.section === selectedSection
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'occupied':
        return <span className="bg-amber-500/15 text-amber-800 border border-amber-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">Occupied</span>;
      case 'reserved':
        return <span className="bg-blue-500/15 text-blue-800 border border-blue-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">Reserved</span>;
      case 'order_ready':
        return <span className="bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1 rounded-full animate-pulse">Order Ready</span>;
      case 'payment_pending':
        return <span className="bg-purple-500/15 text-purple-800 border border-purple-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">Bill Generated</span>;
      case 'cleaning':
        return <span className="bg-rose-500/15 text-rose-800 border border-rose-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">Cleaning Needed</span>;
      default:
        return <span className="bg-stone-200/80 text-charcoal/70 border border-stone-300 text-xs font-semibold px-2.5 py-1 rounded-full">Available</span>;
    }
  };

  const getShapeStyle = (shape) => {
    switch (shape) {
      case 'round':
        return 'rounded-full';
      case 'rectangle':
        return 'rounded-2xl aspect-[1.4/1]';
      default:
        return 'rounded-2xl aspect-square';
    }
  };

  const handleSeatGuests = async () => {
    if (!selectedTable) return;
    await updateTableStatus(selectedTable.id, {
      action: 'seat',
      currentGuests: Number(guestCount),
      serverName,
    });
    setModalAction(null);
    setSelectedTable(null);
  };

  const handleClearTable = async (table) => {
    await updateTableStatus(table.id, { action: 'clear' });
    showToast(`${table.name} cleared and available.`);
  };

  const handleTransferTable = async () => {
    if (!selectedTable || !targetTableId) return;
    await updateTableStatus(selectedTable.id, {
      action: 'transfer',
      targetTableId,
    });
    setModalAction(null);
    setSelectedTable(null);
  };

  const handleCreateTable = async (e) => {
    e.preventDefault();
    if (!newTableNum) return;
    await createTable({
      tableNumber: Number(newTableNum),
      name: `Table ${newTableNum}`,
      capacity: Number(newTableCap),
      section: newTableSec,
    });
    setModalAction(null);
    setNewTableNum('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Floor Plan & Table Management</h1>
          <p className="text-sm text-warm-gray mt-0.5">
            Monitor real-time table status, seating, guest assignments, and active bills.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-cream/70 p-1 rounded-xl border border-stone">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid' ? 'bg-white text-green-bottle shadow-sm' : 'text-charcoal/70'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list' ? 'bg-white text-green-bottle shadow-sm' : 'text-charcoal/70'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setModalAction('newTable')}
            className="flex items-center gap-2 bg-green-bottle text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-bottle/90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Table
          </button>
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Filter className="w-4 h-4 text-warm-gray shrink-0 mr-1" />
        {sections.map((sec) => (
          <button
            key={sec}
            onClick={() => setSelectedSection(sec)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedSection === sec
                ? 'bg-green-bottle text-white shadow-subtle'
                : 'bg-white text-charcoal/70 border border-stone hover:bg-cream'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Grid Floor Plan View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredTables.map((table) => {
            const activeOrd = orders.find((o) => o.id === table.currentOrderId || (o.tableId === table.id && o.orderStatus === 'active'));

            return (
              <div
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`
                  relative p-4 cursor-pointer transition-all duration-200 border flex flex-col justify-between
                  hover:shadow-md hover:-translate-y-0.5
                  ${getShapeStyle(table.shape)}
                  ${
                    table.status === 'occupied'
                      ? 'bg-amber-500/5 border-amber-500/40'
                      : table.status === 'reserved'
                      ? 'bg-blue-500/5 border-blue-500/40'
                      : table.status === 'order_ready'
                      ? 'bg-emerald-500/10 border-emerald-500/50 shadow-sm'
                      : table.status === 'payment_pending'
                      ? 'bg-purple-500/5 border-purple-500/40'
                      : 'bg-white border-stone/60'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-extrabold text-charcoal text-base">{table.name}</h3>
                    <p className="text-[11px] text-warm-gray font-medium">{table.section}</p>
                  </div>
                  {getStatusBadge(table.status)}
                </div>

                <div className="my-2 space-y-1.5 text-xs text-charcoal/80">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-warm-gray" />
                    <span>
                      {table.currentGuests > 0 ? `${table.currentGuests} Guests` : `Cap: ${table.capacity}`}
                    </span>
                  </div>

                  {table.serverName && (
                    <div className="text-[11px] text-warm-gray font-medium">
                      Server: <span className="text-charcoal font-semibold">{table.serverName}</span>
                    </div>
                  )}

                  {activeOrd && (
                    <div className="pt-1.5 border-t border-stone/40 font-bold text-green-bottle flex justify-between items-center">
                      <span>{activeOrd.orderNumber}</span>
                      <span>₹{activeOrd.grandTotal}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-warm-gray border-t border-stone/30">
                  <span>{table.capacity} seats</span>
                  <span className="font-semibold text-green-forest flex items-center gap-1">
                    Manage <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-stone/40 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream/60 text-xs font-bold text-warm-gray uppercase border-b border-stone">
                <th className="p-4">Table</th>
                <th className="p-4">Section</th>
                <th className="p-4">Capacity</th>
                <th className="p-4">Status</th>
                <th className="p-4">Current Order</th>
                <th className="p-4">Server</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/40 text-sm font-medium text-charcoal">
              {filteredTables.map((table) => {
                const activeOrd = orders.find((o) => o.id === table.currentOrderId || (o.tableId === table.id && o.orderStatus === 'active'));
                return (
                  <tr key={table.id} className="hover:bg-cream/40 transition-colors">
                    <td className="p-4 font-bold">{table.name}</td>
                    <td className="p-4 text-warm-gray">{table.section}</td>
                    <td className="p-4">{table.capacity} Guests</td>
                    <td className="p-4">{getStatusBadge(table.status)}</td>
                    <td className="p-4 font-semibold text-green-bottle">
                      {activeOrd ? `${activeOrd.orderNumber} (₹${activeOrd.grandTotal})` : '—'}
                    </td>
                    <td className="p-4 text-warm-gray">{table.serverName || '—'}</td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => setSelectedTable(table)}
                        className="px-3 py-1.5 bg-green-bottle text-white text-xs rounded-lg font-semibold hover:bg-green-bottle/90"
                      >
                        Details
                      </button>
                      {table.status !== 'available' && (
                        <button
                          onClick={() => handleClearTable(table)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-700 text-xs rounded-lg font-semibold hover:bg-rose-100"
                        >
                          Clear
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Actions Drawer / Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-stone/50 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-charcoal">{selectedTable.name}</h2>
                <p className="text-xs text-warm-gray">{selectedTable.section} · {selectedTable.capacity} Capacity</p>
              </div>
              {getStatusBadge(selectedTable.status)}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-stone/30">
                <span className="text-warm-gray">Current Guests</span>
                <span className="font-bold">{selectedTable.currentGuests || 0}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone/30">
                <span className="text-warm-gray">Server</span>
                <span className="font-bold">{selectedTable.serverName || 'None'}</span>
              </div>
              {selectedTable.timeSeated && (
                <div className="flex justify-between py-1 border-b border-stone/30">
                  <span className="text-warm-gray">Time Seated</span>
                  <span className="font-bold">{new Date(selectedTable.timeSeated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {selectedTable.status === 'available' && (
                <button
                  onClick={() => setModalAction('seat')}
                  className="p-3 bg-green-bottle text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-bottle/90"
                >
                  <Users className="w-4 h-4" /> Seat Guests
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedTable(null);
                  navigate(`/app/orders?tableId=${selectedTable.id}`);
                }}
                className="p-3 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-600"
              >
                <Receipt className="w-4 h-4" /> New / View Order
              </button>

              {selectedTable.status !== 'available' && (
                <button
                  onClick={() => setModalAction('transfer')}
                  className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-blue-100"
                >
                  <ArrowRightLeft className="w-4 h-4" /> Transfer Table
                </button>
              )}

              {selectedTable.status !== 'available' && (
                <button
                  onClick={() => handleClearTable(selectedTable)}
                  className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-100"
                >
                  <CheckCircle className="w-4 h-4" /> Clear & Release
                </button>
              )}
            </div>

            {/* Seat Guests Form */}
            {modalAction === 'seat' && (
              <div className="pt-4 border-t border-stone/40 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-warm-gray">Seat Guests Form</h4>
                <div>
                  <label className="text-xs font-semibold text-charcoal">Number of Guests</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedTable.capacity}
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-charcoal">Assigned Server</label>
                  <input
                    type="text"
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
                  />
                </div>
                <button
                  onClick={handleSeatGuests}
                  className="w-full py-2.5 bg-green-bottle text-white font-bold text-sm rounded-xl hover:bg-green-bottle/90"
                >
                  Confirm Seating
                </button>
              </div>
            )}

            {/* Transfer Table Form */}
            {modalAction === 'transfer' && (
              <div className="pt-4 border-t border-stone/40 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-warm-gray">Transfer Table</h4>
                <div>
                  <label className="text-xs font-semibold text-charcoal">Select Destination Table</label>
                  <select
                    value={targetTableId}
                    onChange={(e) => setTargetTableId(e.target.value)}
                    className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
                  >
                    <option value="">Select available table...</option>
                    {tables
                      .filter((t) => t.id !== selectedTable.id && t.status === 'available')
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.section} - {t.capacity} seats)
                        </option>
                      ))}
                  </select>
                </div>
                <button
                  onClick={handleTransferTable}
                  className="w-full py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700"
                >
                  Confirm Transfer
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setSelectedTable(null);
                setModalAction(null);
              }}
              className="w-full py-2.5 bg-stone-100 text-charcoal font-semibold text-xs rounded-xl hover:bg-stone-200"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* New Table Modal */}
      {modalAction === 'newTable' && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateTable} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone space-y-4">
            <h2 className="text-xl font-bold text-charcoal">Add New Table</h2>
            <div>
              <label className="text-xs font-semibold text-charcoal">Table Number</label>
              <input
                type="number"
                required
                value={newTableNum}
                onChange={(e) => setNewTableNum(e.target.value)}
                placeholder="e.g. 21"
                className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-charcoal">Capacity (Seats)</label>
              <input
                type="number"
                required
                value={newTableCap}
                onChange={(e) => setNewTableCap(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-charcoal">Section</label>
              <select
                value={newTableSec}
                onChange={(e) => setNewTableSec(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
              >
                <option value="Indoor">Indoor</option>
                <option value="Outdoor">Outdoor</option>
                <option value="Private Dining">Private Dining</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setModalAction(null)}
                className="flex-1 py-2.5 bg-stone-100 text-charcoal font-semibold text-sm rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-green-bottle text-white font-bold text-sm rounded-xl hover:bg-green-bottle/90"
              >
                Save Table
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
