import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Scissors,
  Sparkles,
  Filter,
  CheckCircle2,
  X,
  Phone,
  DollarSign
} from 'lucide-react';
import { useBusiness } from '../../context/BusinessContext';

const STYLISTS = ['Riya', 'Anjali', 'Kavya', 'Senior Stylist'];

const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
];

// Initial demo appointments structured with exact dates, start times, durations, stylists
const INITIAL_APPOINTMENTS = [
  {
    id: 101,
    date: '2026-08-10',
    time: '10:00 AM',
    durationMinutes: 60,
    client: 'Priya Patel',
    phone: '+91 98200 11111',
    service: 'Haircut + Blow Dry',
    stylist: 'Riya',
    status: 'Confirmed',
    price: 1200,
  },
  {
    id: 102,
    date: '2026-08-10',
    time: '11:30 AM',
    durationMinutes: 90,
    client: 'Meera Shah',
    phone: '+91 98300 22222',
    service: 'Hair Color (Balayage)',
    stylist: 'Anjali',
    status: 'In Progress',
    price: 3500,
  },
  {
    id: 103,
    date: '2026-08-10',
    time: '02:00 PM',
    durationMinutes: 120,
    client: 'Nisha Mehta',
    phone: '+91 98400 33333',
    service: 'Keratin Treatment',
    stylist: 'Riya',
    status: 'Confirmed',
    price: 5500,
  },
  {
    id: 104,
    date: '2026-08-10',
    time: '04:00 PM',
    durationMinutes: 60,
    client: 'Pooja Shah',
    phone: '+91 98500 44444',
    service: 'Hydrating Facial',
    stylist: 'Senior Stylist',
    status: 'Completed',
    price: 1500,
  },
  {
    id: 105,
    date: '2026-08-10',
    time: '10:00 AM',
    durationMinutes: 60,
    client: 'Sunita Roy',
    phone: '+91 98111 77777',
    service: 'Spa Manicure & Pedicure',
    stylist: 'Kavya',
    status: 'Confirmed',
    price: 1800,
  },
  {
    id: 106,
    date: '2026-08-11',
    time: '11:00 AM',
    durationMinutes: 45,
    client: 'Aanya Joshi',
    phone: '+91 98222 88888',
    service: 'Hair Trim & Spa',
    stylist: 'Anjali',
    status: 'Confirmed',
    price: 1100,
  },
];

export default function SalonCalendarPage() {
  const { t, i18n } = useTranslation();
  const isGu = i18n.language?.startsWith('gu');
  const { showToast } = useBusiness();

  const [view, setView] = useState('day'); // 'day', 'week', 'month'
  const [selectedDateStr, setSelectedDateStr] = useState('2026-08-10');
  const [stylistFilter, setStylistFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('salon_schedule');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState('10:00 AM');
  const [newSlotStylist, setNewSlotStylist] = useState('Riya');

  const [newApptForm, setNewApptForm] = useState({
    client: '',
    phone: '',
    service: 'Haircut + Blow Dry',
    price: 1200,
    durationMinutes: 60,
    status: 'Confirmed',
  });

  // Date Navigation
  const handlePrevDate = () => {
    const d = new Date(selectedDateStr);
    d.setDate(d.getDate() - (view === 'week' ? 7 : 1));
    setSelectedDateStr(d.toISOString().slice(0, 10));
  };

  const handleNextDate = () => {
    const d = new Date(selectedDateStr);
    d.setDate(d.getDate() + (view === 'week' ? 7 : 1));
    setSelectedDateStr(d.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    setSelectedDateStr('2026-08-10');
  };

  // Filtered Appointments
  const activeAppointments = appointments.filter((a) => {
    const matchesStylist = stylistFilter === 'All' || a.stylist === stylistFilter;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesStylist && matchesStatus;
  });

  const dayAppointments = activeAppointments.filter((a) => a.date === selectedDateStr);

  const handleQuickAdd = (time, stylist) => {
    setNewSlotTime(time);
    setNewSlotStylist(stylist);
    setNewApptForm({
      client: '',
      phone: '',
      service: 'Haircut + Blow Dry',
      price: 1200,
      durationMinutes: 60,
      status: 'Confirmed',
    });
    setIsAddModalOpen(true);
  };

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    if (!newApptForm.client.trim()) {
      showToast('Client name is required', 'error');
      return;
    }

    const newObj = {
      id: Date.now(),
      date: selectedDateStr,
      time: newSlotTime,
      stylist: newSlotStylist,
      client: newApptForm.client,
      phone: newApptForm.phone || '+91 98000 00000',
      service: newApptForm.service,
      price: Number(newApptForm.price) || 1000,
      durationMinutes: Number(newApptForm.durationMinutes) || 45,
      status: newApptForm.status,
    };

    const updated = [newObj, ...appointments];
    setAppointments(updated);
    localStorage.setItem('salon_schedule', JSON.stringify(updated));
    showToast(`Appointment booked for ${newObj.client} with ${newObj.stylist}`);
    setIsAddModalOpen(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Completed':
        return 'bg-stone-200 text-charcoal border-stone-300';
      case 'Pending':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      default:
        return 'bg-cream text-charcoal border-stone';
    }
  };

  const visibleStylists = stylistFilter === 'All' ? STYLISTS : [stylistFilter];

  return (
    <div className="space-y-6 pb-20">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[22px] border border-stone shadow-card">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-green-forest uppercase tracking-wider mb-1">
            <span>Salon Operations</span>
            <span>•</span>
            <span>Stylist Chair Schedule Board</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-charcoal flex items-center gap-2.5">
            <Scissors className="w-7 h-7 text-green-bottle" /> {isGu ? 'કેલેન્ડર બોડ' : 'Salon Appointments Calendar'}
          </h1>
          <p className="text-xs text-warm-gray mt-1">
            {isGu
              ? 'રીયલ-ટાઇમ સ્ટાઈલિસ્ટ ખુરશીઓ, વોક-ઈન અને બુકિંગ સ્લોટ સંચાલિત કરો'
              : 'Real-time chair allocation, stylist dispatch, and client appointment board'}
          </p>
        </div>

        {/* View Switch Toggles & Add Button */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-cream/70 border border-stone p-1 rounded-xl text-xs font-semibold">
            {[
              { id: 'day', label: isGu ? 'દિવસ (સ્ટાઈલિસ્ટ બોર્ડ)' : 'Stylist Day Board' },
              { id: 'week', label: isGu ? 'સપ્તાહ' : 'Week Agenda' },
              { id: 'month', label: isGu ? 'મહિનો' : 'Month Overview' },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  view === v.id ? 'bg-green-bottle text-white shadow-subtle font-bold' : 'text-charcoal/80 hover:bg-white'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleQuickAdd('10:00 AM', STYLISTS[0])}
            className="px-4 py-2.5 bg-green-bottle hover:bg-green-forest text-white rounded-xl text-xs font-bold shadow-subtle transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> {isGu ? '+ નવું બુકિંગ' : '+ Book Appointment'}
          </button>
        </div>
      </div>

      {/* Date Navigation & Filter Controls Bar */}
      <div className="bg-white p-4 rounded-[18px] border border-stone shadow-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevDate}
            className="p-2 rounded-xl bg-cream border border-stone text-charcoal hover:bg-stone/20 transition-all"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-cream/50 border border-stone rounded-xl">
            <CalendarIcon className="w-4 h-4 text-green-bottle" />
            <span className="text-xs font-bold font-mono text-charcoal">{selectedDateStr}</span>
          </div>
          <button
            onClick={handleNextDate}
            className="p-2 rounded-xl bg-cream border border-stone text-charcoal hover:bg-stone/20 transition-all"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-xl border border-stone bg-white text-xs font-semibold text-charcoal hover:bg-cream transition-all"
          >
            {isGu ? 'આજે' : 'Today'}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto text-xs text-charcoal font-medium">
          <div className="flex items-center gap-2">
            <span className="text-warm-gray">Stylist:</span>
            <select
              value={stylistFilter}
              onChange={(e) => setStylistFilter(e.target.value)}
              className="px-3 py-1.5 bg-cream/40 border border-stone rounded-xl text-xs font-semibold text-charcoal"
            >
              <option value="All">All Stylists ({STYLISTS.length})</option>
              {STYLISTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-warm-gray">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-cream/40 border border-stone rounded-xl text-xs font-semibold text-charcoal"
            >
              <option value="All">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: DAY VIEW (STYLIST SCHEDULING BOARD FOR DESKTOP) */}
      {view === 'day' && (
        <div className="space-y-4">
          {/* Desktop Stylist Column Grid Board */}
          <div className="hidden md:block bg-white rounded-[22px] border border-stone shadow-card overflow-hidden">
            {/* Header Row: Time Column + Stylist Columns */}
            <div
              className="grid border-b border-stone bg-cream/60 p-4 text-xs font-bold text-charcoal text-center"
              style={{ gridTemplateColumns: `100px repeat(${visibleStylists.length}, 1fr)` }}
            >
              <div className="text-left uppercase tracking-wider text-warm-gray font-semibold">Time Slot</div>
              {visibleStylists.map((st) => (
                <div key={st} className="flex items-center justify-center gap-1.5 font-display text-sm font-bold text-green-bottle">
                  <User className="w-4 h-4 text-green-bottle" /> {st}
                </div>
              ))}
            </div>

            {/* Time Grid Rows */}
            <div className="divide-y divide-stone/60">
              {TIME_SLOTS.map((slot) => (
                <div
                  key={slot}
                  className="grid p-2.5 items-stretch min-h-[76px] transition-colors hover:bg-cream/20"
                  style={{ gridTemplateColumns: `100px repeat(${visibleStylists.length}, 1fr)` }}
                >
                  {/* Time Label */}
                  <div className="font-mono text-xs text-warm-gray font-bold flex items-center">
                    {slot}
                  </div>

                  {/* Stylist Columns for this Time Slot */}
                  {visibleStylists.map((stylist) => {
                    const appt = dayAppointments.find(
                      (a) => a.stylist === stylist && a.time === slot
                    );

                    return (
                      <div key={stylist} className="px-1.5 relative h-full">
                        {appt ? (
                          <div
                            onClick={() => setSelectedAppt(appt)}
                            className={`p-2.5 rounded-xl border flex flex-col justify-between h-full shadow-subtle hover:scale-[1.01] transition-all cursor-pointer ${getStatusBadge(
                              appt.status
                            )}`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-charcoal text-xs truncate">{appt.client}</span>
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white/70 text-charcoal border border-stone">
                                {appt.durationMinutes}m
                              </span>
                            </div>
                            <p className="text-[11px] text-charcoal/80 font-medium truncate mt-0.5">{appt.service}</p>
                            <div className="flex justify-between items-center text-[10px] text-warm-gray font-semibold pt-1 border-t border-stone/30 mt-1">
                              <span>₹{appt.price}</span>
                              <span className="font-bold uppercase tracking-wider">{appt.status}</span>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleQuickAdd(slot, stylist)}
                            className="w-full h-full min-h-[56px] border border-dashed border-stone/70 hover:border-green-bottle rounded-xl flex items-center justify-center text-warm-gray/60 hover:text-green-bottle hover:bg-green-bottle/5 transition-all text-[11px] font-semibold"
                          >
                            + Available
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Agenda List View (Switches automatically on small screens) */}
          <div className="block md:hidden space-y-3">
            <div className="p-3 bg-cream/50 rounded-xl border border-stone text-xs font-bold text-charcoal flex justify-between items-center">
              <span>Mobile Schedule Agenda — {selectedDateStr}</span>
              <span className="text-green-bottle">{dayAppointments.length} Bookings</span>
            </div>

            {dayAppointments.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-stone text-center text-warm-gray text-xs space-y-2">
                <CalendarIcon className="w-8 h-8 text-warm-gray/40 mx-auto" />
                <p>No appointments scheduled for this date.</p>
                <button
                  onClick={() => handleQuickAdd('10:00 AM', STYLISTS[0])}
                  className="px-4 py-2 bg-green-bottle text-white rounded-xl text-xs font-bold mt-2"
                >
                  + Add First Booking
                </button>
              </div>
            ) : (
              dayAppointments.map((appt) => (
                <div
                  key={appt.id}
                  onClick={() => setSelectedAppt(appt)}
                  className={`p-4 rounded-2xl border bg-white shadow-subtle space-y-2 cursor-pointer ${getStatusBadge(
                    appt.status
                  )}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-xs font-bold text-green-bottle bg-white/80 px-2 py-0.5 rounded border border-stone">
                        {appt.time} ({appt.durationMinutes} mins)
                      </span>
                      <h4 className="text-sm font-bold text-charcoal mt-1.5">{appt.client}</h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white text-charcoal border border-stone">
                      {appt.status}
                    </span>
                  </div>

                  <div className="text-xs text-charcoal font-medium">
                    <p className="font-semibold">{appt.service}</p>
                    <p className="text-warm-gray text-[11px]">Stylist: <strong className="text-charcoal">{appt.stylist}</strong> · Ph: {appt.phone}</p>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold pt-2 border-t border-stone/40">
                    <span>Price: ₹{appt.price}</span>
                    <span className="text-green-bottle font-semibold text-[11px]">View Details →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: WEEK AGENDA VIEW */}
      {view === 'week' && (
        <div className="bg-white rounded-[22px] border border-stone shadow-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-charcoal">Week Overview Agenda</h3>
          <div className="space-y-3">
            {dayAppointments.length === 0 ? (
              <p className="text-xs text-warm-gray">No appointments scheduled for selected date ({selectedDateStr}). Use date navigator above to browse week.</p>
            ) : (
              dayAppointments.map((a) => (
                <div key={a.id} className="p-3 bg-cream/30 border border-stone rounded-xl flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono font-bold text-green-bottle">{a.time}</span>
                    <span className="font-bold text-charcoal ml-3">{a.client}</span>
                    <span className="text-warm-gray ml-2">({a.service} with {a.stylist})</span>
                  </div>
                  <span className="font-bold text-charcoal">₹{a.price}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: MONTH OVERVIEW */}
      {view === 'month' && (
        <div className="bg-white rounded-[22px] border border-stone shadow-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-charcoal">Month Appointments Summary</h3>
          <p className="text-xs text-warm-gray">Total Active Appointments Booked: <strong className="text-charcoal">{activeAppointments.length} bookings</strong></p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {STYLISTS.map((st) => {
              const count = activeAppointments.filter((a) => a.stylist === st).length;
              return (
                <div key={st} className="p-4 bg-cream/40 border border-stone rounded-xl space-y-1">
                  <span className="font-bold text-charcoal text-sm">{st}</span>
                  <p className="text-warm-gray">{count} Appointments</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-[24px] shadow-2xl border border-stone p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-stone pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-bottle bg-green-bottle/10 px-2 py-0.5 rounded">
                  {selectedAppt.status}
                </span>
                <h3 className="text-lg font-bold text-charcoal mt-1">{selectedAppt.client}</h3>
                <p className="text-xs font-mono text-warm-gray">{selectedAppt.phone}</p>
              </div>
              <button onClick={() => setSelectedAppt(null)} className="p-1 text-warm-gray hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-cream/40 rounded-xl border border-stone space-y-1">
                <p className="font-semibold text-charcoal">Service: {selectedAppt.service}</p>
                <p className="text-warm-gray">Stylist Chair: <strong className="text-charcoal">{selectedAppt.stylist}</strong></p>
                <p className="text-warm-gray">Time: <strong className="text-charcoal">{selectedAppt.time}</strong> ({selectedAppt.durationMinutes} mins)</p>
                <p className="text-warm-gray">Date: <strong className="text-charcoal">{selectedAppt.date}</strong></p>
                <p className="text-green-bottle font-bold text-sm mt-1">Total Fee: ₹{selectedAppt.price}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setSelectedAppt(null)}
                className="w-full py-2.5 bg-green-bottle text-white font-bold text-xs rounded-xl"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white rounded-[24px] shadow-2xl border border-stone p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone pb-3">
              <div>
                <h3 className="text-base font-bold text-charcoal">+ Book Salon Chair Appointment</h3>
                <p className="text-xs text-warm-gray">Slot: {newSlotTime} · Stylist: {newSlotStylist}</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-warm-gray hover:text-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Client Name *</label>
                <input
                  type="text"
                  required
                  value={newApptForm.client}
                  onChange={(e) => setNewApptForm({ ...newApptForm, client: e.target.value })}
                  placeholder="e.g. Pooja Sharma"
                  className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newApptForm.phone}
                  onChange={(e) => setNewApptForm({ ...newApptForm, phone: e.target.value })}
                  placeholder="+91 98200 11223"
                  className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-charcoal block mb-1">Service</label>
                <input
                  type="text"
                  value={newApptForm.service}
                  onChange={(e) => setNewApptForm({ ...newApptForm, service: e.target.value })}
                  placeholder="Haircut + Blow Dry"
                  className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={newApptForm.price}
                    onChange={(e) => setNewApptForm({ ...newApptForm, price: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
                  />
                </div>
                <div>
                  <label className="font-semibold text-charcoal block mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={newApptForm.durationMinutes}
                    onChange={(e) => setNewApptForm({ ...newApptForm, durationMinutes: e.target.value })}
                    className="w-full px-3 py-2 bg-cream/40 border border-stone rounded-xl text-xs text-charcoal"
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
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
