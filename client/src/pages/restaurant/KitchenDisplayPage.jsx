import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sparkles,
  Utensils,
  Flame,
  ChefHat,
  Filter,
} from 'lucide-react';

export default function KitchenDisplayPage() {
  const { orders, updateKitchenStatus, showToast } = useBusiness();
  const [selectedStation, setSelectedStation] = useState('All');
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  const stations = ['All', 'Kitchen', 'Bar', 'Grill', 'Dessert'];

  const getOrderAgeMins = (createdAt) => {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const diffMs = now - created;
    return Math.floor(diffMs / (1000 * 60));
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateKitchenStatus(orderId, { kitchenStatus: newStatus });
      showToast(`Kitchen status updated to ${newStatus.toUpperCase()}`);
    } catch (err) {
      showToast(err.message || 'Failed to update status', 'error');
    }
  };

  const columns = [
    { key: 'new', title: 'New Orders', color: 'border-blue-500 bg-blue-500/5 text-blue-900' },
    { key: 'preparing', title: 'Preparing', color: 'border-amber-500 bg-amber-500/5 text-amber-900' },
    { key: 'ready', title: 'Ready for Service', color: 'border-emerald-500 bg-emerald-500/5 text-emerald-900' },
    { key: 'completed', title: 'Completed', color: 'border-stone-400 bg-stone-100 text-charcoal' },
  ];

  return (
    <div className="space-y-6">
      {/* KDS Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone/40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-900 flex items-center justify-center border border-amber-500/30">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-charcoal">Kitchen Display System (KDS)</h1>
            <p className="text-sm text-warm-gray mt-0.5">
              Live ticket display for kitchen, grill, bar, and dessert stations.
            </p>
          </div>
        </div>

        {/* Station Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-4 h-4 text-warm-gray shrink-0 mr-1" />
          {stations.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStation(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedStation === st
                  ? 'bg-green-bottle text-white shadow-subtle'
                  : 'bg-cream text-charcoal/70 border border-stone hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colOrders = orders.filter((o) => {
            if (o.orderStatus === 'cancelled') return false;
            const matchesCol = (o.kitchenStatus || 'new') === col.key;
            return matchesCol;
          });

          return (
            <div key={col.key} className="space-y-3">
              {/* Column Header */}
              <div className={`p-3.5 rounded-2xl border-2 font-bold text-sm flex justify-between items-center ${col.color}`}>
                <span>{col.title}</span>
                <span className="w-6 h-6 rounded-full bg-white text-charcoal flex items-center justify-center text-xs font-black shadow-sm">
                  {colOrders.length}
                </span>
              </div>

              {/* Order Cards List */}
              <div className="space-y-3">
                {colOrders.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-stone/30 text-xs text-warm-gray font-medium">
                    No orders in this status.
                  </div>
                ) : (
                  colOrders.map((ord) => {
                    const ageMins = getOrderAgeMins(ord.createdAt);
                    const isDelayed = ageMins > 15 && ord.kitchenStatus !== 'completed';

                    // Station item filtering
                    const stationItems = ord.items.filter(
                      (it) => selectedStation === 'All' || it.kitchenStation === selectedStation
                    );

                    if (stationItems.length === 0) return null;

                    return (
                      <div
                        key={ord.id}
                        className={`bg-white p-4 rounded-2xl border-2 space-y-3 shadow-sm transition-all ${
                          isDelayed ? 'border-rose-500 bg-rose-50/20 animate-pulse' : 'border-stone/40'
                        }`}
                      >
                        {/* Order Header */}
                        <div className="flex justify-between items-start border-b border-stone/40 pb-2">
                          <div>
                            <div className="font-extrabold text-charcoal text-base">{ord.orderNumber}</div>
                            <div className="text-xs text-warm-gray font-semibold">
                              {ord.tableName || ord.orderType.toUpperCase()} · Server: {ord.serverName || 'Staff'}
                            </div>
                          </div>

                          <div
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black ${
                              isDelayed
                                ? 'bg-rose-600 text-white'
                                : 'bg-stone-100 text-charcoal/80'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{ageMins}m</span>
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-2 py-1">
                          {stationItems.map((item, idx) => (
                            <div key={idx} className="text-xs font-semibold text-charcoal space-y-0.5">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-sm">
                                  {item.quantity}× {item.name}
                                </span>
                                <span className="text-[10px] text-warm-gray uppercase tracking-wider">{item.kitchenStation}</span>
                              </div>

                              {item.modifiers && item.modifiers.length > 0 && (
                                <div className="text-[11px] text-warm-gray pl-3 border-l-2 border-amber-400">
                                  {item.modifiers.map((m) => m.optionName).join(', ')}
                                </div>
                              )}

                              {item.notes && (
                                <div className="text-[11px] text-rose-700 font-bold italic pl-3 border-l-2 border-rose-500">
                                  Note: {item.notes}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Order Actions */}
                        <div className="pt-2 border-t border-stone/30">
                          {col.key === 'new' && (
                            <button
                              onClick={() => handleUpdateStatus(ord.id, 'preparing')}
                              className="w-full py-2 bg-amber-500 text-white font-bold text-xs rounded-xl hover:bg-amber-600 flex items-center justify-center gap-1.5"
                            >
                              <Flame className="w-3.5 h-3.5" /> Start Preparing
                            </button>
                          )}

                          {col.key === 'preparing' && (
                            <button
                              onClick={() => handleUpdateStatus(ord.id, 'ready')}
                              className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Ready
                            </button>
                          )}

                          {col.key === 'ready' && (
                            <button
                              onClick={() => handleUpdateStatus(ord.id, 'served')}
                              className="w-full py-2 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 flex items-center justify-center gap-1.5"
                            >
                              <Utensils className="w-3.5 h-3.5" /> Mark Served / Done
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
