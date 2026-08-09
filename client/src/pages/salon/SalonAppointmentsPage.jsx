import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Search,
  Plus,
  Filter,
  Calendar,
  Clock,
  Check,
  X,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Card } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

// Predefined services list
const serviceList = [
  { name: 'Haircut', duration: '45 mins', price: 800 },
  { name: 'Hair Spa', duration: '60 mins', price: 1500 },
  { name: 'Hair Coloring', duration: '120 mins', price: 4500 },
  { name: 'Keratin Treatment', duration: '180 mins', price: 5500 },
  { name: 'Facial', duration: '60 mins', price: 1500 },
  { name: 'Cleanup', duration: '30 mins', price: 800 },
  { name: 'Waxing', duration: '45 mins', price: 1200 },
  { name: 'Manicure', duration: '45 mins', price: 1000 },
  { name: 'Pedicure', duration: '60 mins', price: 1500 },
  { name: 'Nail Art', duration: '90 mins', price: 2500 },
];

// Predefined stylists list
const stylistList = ['Riya', 'Anjali', 'Kavya', 'Senior Stylist', 'Sunita Das'];

// Predefined time slots
const timeSlots = [
  '09:00 AM', '10:00 AM', '11:00 AM', '11:30 AM', 
  '12:00 PM', '01:00 PM', '02:00 PM', '02:15 PM', 
  '03:00 PM', '04:00 PM', '05:00 PM', '05:30 PM', '06:00 PM'
];

export default function SalonAppointmentsPage() {
  const { customers, addCustomer } = useBusiness();
  const { addNotification } = useNotification();

  const [search, setSearch] = useState('');
  const [stylistFilter, setStylistFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Load appointments from localStorage or fallbacks
  const [appointments, setAppointments] = useState(() => {
    const saved = localStorage.getItem('salon_schedule');
    return saved ? JSON.parse(saved) : [
      { id: 1, time: '10:00 AM', date: '2026-08-10', client: 'Priya Patel', phone: '+91 98200 11111', service: 'Haircut', stylist: 'Riya', status: 'Confirmed', price: 1200 },
      { id: 2, time: '11:30 AM', date: '2026-08-10', client: 'Meera Shah', phone: '+91 98300 22222', service: 'Hair Color', stylist: 'Anjali', status: 'In Progress', price: 3500 },
      { id: 3, time: '01:00 PM', date: '2026-08-10', client: 'Walk-in Slot', phone: '', service: 'Available Slot', stylist: 'Unassigned', status: 'Available', price: 0 },
      { id: 4, time: '02:15 PM', date: '2026-08-10', client: 'Nisha Mehta', phone: '+91 98400 33333', service: 'Keratin Treatment', stylist: 'Riya', status: 'Confirmed', price: 5500 },
      { id: 5, time: '04:00 PM', date: '2026-08-10', client: 'Pooja Shah', phone: '+91 98500 44444', service: 'Hydrating Facial', stylist: 'Anjali', status: 'Completed', price: 1500 },
      { id: 6, time: '05:30 PM', date: '2026-08-10', client: 'Karan Malhotra', phone: '+91 98100 54321', service: 'Beard Trim & Wash', stylist: 'Kavya', status: 'Pending', price: 950 },
    ];
  });

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [isNewCustomer, setIsNewCustomer] = useState(false);
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    customerId: '',
    newClientName: '',
    newClientPhone: '',
    newClientEmail: '',
    date: '',
    time: '',
    serviceName: '',
    stylistName: '',
    status: 'Pending',
    notes: '',
    priceOverride: '',
  });

  const handleUpdateStatus = (id, newStatus) => {
    const updated = appointments.map((a) =>
      a.id === id ? { ...a, status: newStatus } : a
    );
    setAppointments(updated);
    localStorage.setItem('salon_schedule', JSON.stringify(updated));
    addNotification({ message: `Appointment marked as ${newStatus}`, type: 'success' });
  };

  const handleOpenModal = () => {
    setFormData({
      customerId: '',
      newClientName: '',
      newClientPhone: '',
      newClientEmail: '',
      date: new Date().toISOString().split('T')[0],
      time: '',
      serviceName: '',
      stylistName: '',
      status: 'Pending',
      notes: '',
      priceOverride: '',
    });
    setIsNewCustomer(false);
    setErrors({});
    setModalOpen(true);
  };

  const handleServiceChange = (e) => {
    const sName = e.target.value;
    const match = serviceList.find(s => s.name === sName);
    setFormData(prev => ({
      ...prev,
      serviceName: sName,
      priceOverride: match ? match.price : ''
    }));
    if (errors.serviceName) {
      setErrors(prev => ({ ...prev, serviceName: null }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    if (isNewCustomer) {
      if (!formData.newClientName.trim()) {
        nextErrors.newClientName = 'Client name is required';
      }
      if (!formData.newClientPhone.trim()) {
        nextErrors.newClientPhone = 'Phone number is required';
      } else if (formData.newClientPhone.replace(/\D/g, '').length < 10) {
        nextErrors.newClientPhone = 'Enter a valid 10-digit phone number';
      }
    } else {
      if (!formData.customerId) {
        nextErrors.customerId = 'Please select a customer';
      }
    }

    if (!formData.date) {
      nextErrors.date = 'Date is required';
    }
    if (!formData.time) {
      nextErrors.time = 'Time is required';
    }
    if (!formData.serviceName) {
      nextErrors.serviceName = 'Service is required';
    }
    if (!formData.stylistName) {
      nextErrors.stylistName = 'Stylist is required';
    }

    // Double booking verification
    if (formData.stylistName && formData.time && formData.date) {
      const isBooked = appointments.some(
        (a) =>
          a.stylist === formData.stylistName &&
          a.time === formData.time &&
          a.date === formData.date &&
          a.status !== 'Cancelled'
      );
      if (isBooked) {
        nextErrors.stylistName = 'Stylist is already booked at this time.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      let finalClientName = '';
      let finalClientPhone = '';
      let finalCustomerId = '';

      if (isNewCustomer) {
        const payload = {
          name: formData.newClientName,
          phone: formData.newClientPhone,
          email: formData.newClientEmail,
        };
        const createdCustomer = await addCustomer(payload);
        finalClientName = createdCustomer.name;
        finalClientPhone = createdCustomer.phone;
        finalCustomerId = createdCustomer.id;
      } else {
        const customer = customers.find(c => c.id === formData.customerId || c.name === formData.customerId);
        finalClientName = customer ? customer.name : formData.customerId;
        finalClientPhone = customer ? customer.phone : '';
        finalCustomerId = customer ? customer.id : '';
      }

      const activePrice = formData.priceOverride ? Number(formData.priceOverride) : 0;
      const newAppt = {
        id: Date.now(),
        customerId: finalCustomerId,
        client: finalClientName,
        phone: finalClientPhone,
        service: formData.serviceName,
        stylist: formData.stylistName,
        date: formData.date,
        time: formData.time,
        status: formData.status,
        price: activePrice,
        amount: `₹${activePrice.toLocaleString('en-IN')}`,
        notes: formData.notes,
        createdAt: new Date().toISOString()
      };

      const updated = [newAppt, ...appointments.filter(a => a.status !== 'Available')];
      setAppointments(updated);
      localStorage.setItem('salon_schedule', JSON.stringify(updated));

      addNotification({ message: 'Appointment created successfully', type: 'success' });
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.message || 'Failed to save appointment. Please try again.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Filters
  const filtered = appointments.filter((a) => {
    const matchesSearch =
      a.client.toLowerCase().includes(search.toLowerCase()) ||
      (a.phone && a.phone.includes(search));
    const matchesStylist = stylistFilter === 'All' || a.stylist === stylistFilter;
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    return matchesSearch && matchesStylist && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-green-forest">Floor Control</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-charcoal">
            Appointments
          </h1>
          <p className="text-sm text-warm-gray">Manage bookings, assignments, status chips, and pricing totals</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-bottle hover:bg-green-forest text-white rounded-xl text-xs font-bold transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Appointment
        </button>
      </div>

      {/* Filter / Search bar */}
      <div className="p-4 bg-white border border-stone rounded-2xl shadow-subtle flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-warm-gray absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by client name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-ivory/55 border border-stone rounded-xl text-xs outline-none focus:border-green-bottle text-charcoal font-sans"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto text-xs text-charcoal font-semibold">
          <label className="flex items-center gap-2">
            <span className="text-warm-gray font-medium">Stylist:</span>
            <select
              value={stylistFilter}
              onChange={(e) => setStylistFilter(e.target.value)}
              className="px-3 py-2 bg-ivory/55 border border-stone rounded-xl outline-none"
            >
              <option value="All">All Stylists</option>
              {stylistList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>

          <label className="flex items-center gap-2">
            <span className="text-warm-gray font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-ivory/55 border border-stone rounded-xl outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>
        </div>
      </div>

      {/* Appointments List Table */}
      <Card className="overflow-hidden border border-stone">
        <div className="overflow-x-auto">
          <table className="bz-table w-full text-left">
            <thead>
              <tr className="bg-ivory/50 text-charcoal text-xs border-b border-stone">
                <th className="p-4">Time</th>
                <th className="p-4">Date</th>
                <th className="p-4">Client</th>
                <th className="p-4">Service</th>
                <th className="p-4">Stylist</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-stone/50 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-warm-gray py-10">No appointments found matching filters.</td>
                </tr>
              ) : (
                filtered.map((appt, i) => (
                  <tr key={i} className="hover:bg-cream/20">
                    <td className="p-4 font-mono font-bold text-green-forest">{appt.time}</td>
                    <td className="p-4 font-semibold text-warm-gray">{appt.date}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-charcoal">{appt.client}</p>
                        {appt.phone && <p className="text-[10px] text-warm-gray font-mono">{appt.phone}</p>}
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-charcoal">{appt.service}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 bg-cream px-2.5 py-1 border border-stone rounded-lg font-bold">
                        {appt.stylist}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        appt.status === 'Confirmed' ? 'bg-green-sage/20 text-green-bottle' :
                        appt.status === 'In Progress' ? 'bg-blue-50 text-blue-600' :
                        appt.status === 'Completed' ? 'bg-stone text-warm-gray' :
                        appt.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                        'bg-yellow-champagne text-mustard'
                      }`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-charcoal">{appt.amount || `₹${appt.price}`}</td>
                    <td className="p-4 text-center space-x-1.5">
                      <button 
                        onClick={() => handleUpdateStatus(appt.id, 'Confirmed')}
                        className="p-1.5 text-green-bottle hover:bg-green-sage/10 rounded-lg" 
                        title="Confirm appointment"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(appt.id, 'Cancelled')}
                        className="p-1.5 text-terracotta hover:bg-red-50 rounded-lg" 
                        title="Cancel appointment"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add New Appointment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white md:rounded-[20px] rounded-none border border-stone shadow-elev w-full h-full md:h-auto md:max-w-xl p-6 flex flex-col justify-between overflow-y-auto max-h-screen">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone">
                <div>
                  <h3 className="text-base font-bold text-charcoal">Add New Appointment</h3>
                  <p className="text-[11px] text-warm-gray">Schedule a new appointment for your salon</p>
                </div>
                <button type="button" onClick={() => setModalOpen(false)} className="p-1 hover:bg-cream rounded-full">
                  <X className="w-5 h-5 text-warm-gray" />
                </button>
              </div>

              <form id="apptForm" onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal font-semibold">
                
                {/* Customer selection toggle */}
                <div className="sm:col-span-2 flex items-center justify-between pb-1">
                  <span className="text-warm-gray">Select client option:</span>
                  <button
                    type="button"
                    onClick={() => setIsNewCustomer(!isNewCustomer)}
                    className="text-green-bottle hover:underline font-bold text-[11px]"
                  >
                    {isNewCustomer ? 'Or Select Existing Customer' : 'Or Create New Customer'}
                  </button>
                </div>

                {isNewCustomer ? (
                  <>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-warm-gray font-medium">New Customer Name *</label>
                      <input
                        type="text"
                        required
                        name="newClientName"
                        value={formData.newClientName}
                        onChange={(e) => setFormData(prev => ({ ...prev, newClientName: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                        placeholder="e.g. Krish Patel"
                      />
                      {errors.newClientName && <p className="text-red-500 text-[10px] mt-0.5">{errors.newClientName}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-warm-gray font-medium">New Customer Phone *</label>
                      <input
                        type="tel"
                        required
                        name="newClientPhone"
                        value={formData.newClientPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, newClientPhone: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                        placeholder="e.g. 9824249704"
                      />
                      {errors.newClientPhone && <p className="text-red-500 text-[10px] mt-0.5">{errors.newClientPhone}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-warm-gray font-medium">New Customer Email</label>
                      <input
                        type="email"
                        name="newClientEmail"
                        value={formData.newClientEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, newClientEmail: e.target.value }))}
                        className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                        placeholder="e.g. krish@gmail.com"
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-warm-gray font-medium">Select Customer *</label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                    >
                      <option value="">Choose customer</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name} — {c.phone}</option>
                      ))}
                    </select>
                    {errors.customerId && <p className="text-red-500 text-[10px] mt-0.5">{errors.customerId}</p>}
                  </div>
                )}

                {/* Appointment Date */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                  />
                  {errors.date && <p className="text-red-500 text-[10px] mt-0.5">{errors.date}</p>}
                </div>

                {/* Appointment Time */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Appointment Time *</label>
                  <select
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.time && <p className="text-red-500 text-[10px] mt-0.5">{errors.time}</p>}
                </div>

                {/* Select Service */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Select Service *</label>
                  <select
                    value={formData.serviceName}
                    onChange={handleServiceChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                  >
                    <option value="">Choose service</option>
                    {serviceList.map(s => (
                      <option key={s.name} value={s.name}>{s.name} (₹{s.price} - {s.duration})</option>
                    ))}
                  </select>
                  {errors.serviceName && <p className="text-red-500 text-[10px] mt-0.5">{errors.serviceName}</p>}
                </div>

                {/* Select Stylist */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Select Stylist *</label>
                  <select
                    value={formData.stylistName}
                    onChange={(e) => setFormData(prev => ({ ...prev, stylistName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                  >
                    <option value="">Choose stylist</option>
                    {stylistList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errors.stylistName && <p className="text-red-500 text-[10px] mt-0.5">{errors.stylistName}</p>}
                </div>

                {/* Status Selection */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Price Override */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.priceOverride}
                    onChange={(e) => setFormData(prev => ({ ...prev, priceOverride: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                    placeholder="Auto-calculated from service"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-warm-gray font-medium">Appointment Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows="2"
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none resize-none"
                    placeholder="Enter special instructions or requests..."
                  />
                </div>

                {errors.submit && <p className="text-red-500 text-xs sm:col-span-2 mt-1">{errors.submit}</p>}
              </form>
            </div>

            <div className="flex gap-2 pt-3 border-t border-stone mt-6">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2.5 border border-stone rounded-xl text-charcoal font-bold hover:bg-cream transition-all text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="apptForm"
                disabled={submitLoading}
                className="flex-1 py-2.5 bg-green-bottle hover:bg-green-forest text-white rounded-xl font-bold transition-all text-xs disabled:opacity-50"
              >
                {submitLoading ? 'Saving...' : 'Create Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
