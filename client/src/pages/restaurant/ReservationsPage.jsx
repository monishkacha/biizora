import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  UserCheck,
  Phone,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

export default function ReservationsPage() {
  const { reservations, tables, createReservation, updateReservationStatus, showToast } = useBusiness();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New reservation form state
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:30');
  const [guests, setGuests] = useState(4);
  const [tableId, setTableId] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm) ||
      (r.tableName && r.tableName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateReservation = async (e) => {
    e.preventDefault();
    if (!customerName || !phone || !date || !time) return;

    try {
      await createReservation({
        customerName,
        phone,
        email,
        date,
        time,
        guests: Number(guests),
        tableId: tableId || null,
        specialRequests,
        bookingSource: 'Reservation',
      });
      setShowAddModal(false);
      setCustomerName('');
      setPhone('');
      setEmail('');
      setSpecialRequests('');
    } catch (err) {
      showToast(err.message || 'Failed to create reservation', 'error');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <span className="bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">Confirmed</span>;
      case 'seated':
        return <span className="bg-amber-500/15 text-amber-800 border border-amber-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">Seated</span>;
      case 'completed':
        return <span className="bg-blue-500/15 text-blue-800 border border-blue-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">Completed</span>;
      case 'cancelled':
        return <span className="bg-rose-500/15 text-rose-800 border border-rose-500/30 text-xs font-semibold px-2.5 py-1 rounded-full">Cancelled</span>;
      default:
        return <span className="bg-stone-200 text-charcoal text-xs font-semibold px-2.5 py-1 rounded-full">Pending</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Table Reservations</h1>
          <p className="text-sm text-warm-gray mt-0.5">
            Manage advance table bookings, guest counts, seating status, and special requests.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 bg-green-bottle text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-bottle/90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> New Reservation
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-warm-gray" />
          <input
            type="text"
            placeholder="Search reservation by name, phone, table..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone/60 bg-white text-sm focus:outline-none focus:border-green-bottle"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['all', 'confirmed', 'seated', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-green-bottle text-white shadow-subtle'
                  : 'bg-white text-charcoal/70 border border-stone hover:bg-cream'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-2xl border border-stone/40 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-cream/60 text-xs font-bold text-warm-gray uppercase border-b border-stone">
              <th className="p-4">Customer</th>
              <th className="p-4">Date & Time</th>
              <th className="p-4">Guests</th>
              <th className="p-4">Assigned Table</th>
              <th className="p-4">Source</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone/40 text-sm font-medium text-charcoal">
            {filteredReservations.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-12 text-center text-warm-gray font-semibold">
                  No reservations found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredReservations.map((res) => (
                <tr key={res.id} className="hover:bg-cream/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-charcoal">{res.customerName}</div>
                    <div className="text-xs text-warm-gray flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" /> {res.phone}
                    </div>
                    {res.specialRequests && (
                      <div className="text-[11px] text-amber-700 font-medium flex items-center gap-1 mt-1">
                        <MessageSquare className="w-3 h-3 shrink-0" /> {res.specialRequests}
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal">
                      <CalendarIcon className="w-3.5 h-3.5 text-green-bottle" /> {res.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-warm-gray mt-0.5">
                      <Clock className="w-3.5 h-3.5" /> {res.time}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold">{res.guests}</span> Guests
                  </td>
                  <td className="p-4">
                    {res.tableName ? (
                      <span className="font-bold text-green-bottle bg-green-50 px-2.5 py-1 rounded-lg border border-green-200">
                        {res.tableName}
                      </span>
                    ) : (
                      <span className="text-xs text-warm-gray">Not assigned</span>
                    )}
                  </td>
                  <td className="p-4 text-xs font-semibold text-warm-gray capitalize">
                    {res.bookingSource || 'Direct'}
                  </td>
                  <td className="p-4">{getStatusBadge(res.status)}</td>
                  <td className="p-4 text-right space-x-2">
                    {res.status === 'confirmed' && (
                      <button
                        onClick={() => updateReservationStatus(res.id, { status: 'seated', tableId: res.tableId })}
                        className="px-3 py-1.5 bg-amber-500 text-white text-xs rounded-lg font-bold hover:bg-amber-600 inline-flex items-center gap-1"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Seat
                      </button>
                    )}
                    {res.status === 'seated' && (
                      <button
                        onClick={() => updateReservationStatus(res.id, { status: 'completed' })}
                        className="px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg font-bold hover:bg-emerald-700 inline-flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                      </button>
                    )}
                    {res.status !== 'cancelled' && res.status !== 'completed' && (
                      <button
                        onClick={() => updateReservationStatus(res.id, { status: 'cancelled' })}
                        className="px-2.5 py-1.5 bg-rose-50 text-rose-700 text-xs rounded-lg font-semibold hover:bg-rose-100"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* New Reservation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateReservation} className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone space-y-4">
            <h2 className="text-xl font-extrabold text-charcoal">New Reservation</h2>

            <div>
              <label className="text-xs font-semibold text-charcoal">Customer Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-charcoal">Phone *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98200..."
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-charcoal">Guests *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-charcoal">Date *</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-charcoal">Time *</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal">Assign Table (Optional)</label>
              <select
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
              >
                <option value="">Auto assign / Select later...</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.section} - {t.capacity} seats)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal">Special Requests / Notes</label>
              <input
                type="text"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Anniversary celebration, High chair"
                className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 bg-stone-100 text-charcoal font-semibold text-sm rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-green-bottle text-white font-bold text-sm rounded-xl hover:bg-green-bottle/90"
              >
                Save Reservation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
