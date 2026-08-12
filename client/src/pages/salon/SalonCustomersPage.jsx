import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '../../context/BusinessContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Calendar as CalendarIcon,
  Sparkles,
  Award,
  CreditCard,
  FileText,
  X,
  ChevronRight,
} from 'lucide-react';
import { Card } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export default function SalonCustomersPage() {
  const { t, i18n } = useTranslation();
  const isGu = i18n.language?.startsWith('gu');
  const { customers, addCustomer } = useBusiness();
  const { addNotification } = useNotification();
  
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);

  // Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'Female',
    address: '',
    preferredStylist: 'Riya Sharma',
    preferredServices: [],
    membershipTier: 'None',
    notes: '',
    whatsappOptIn: 'Yes'
  });

  // Available services for selection
  const serviceOptions = [
    'Haircut', 'Blow Dry', 'Hair Spa', 'Hair Coloring', 
    'Keratin Treatment', 'Facial', 'Cleanup', 'Waxing', 
    'Manicure', 'Pedicure', 'Nail Art'
  ];

  // Stylists
  const stylists = ['Riya Sharma', 'Anjali Shah', 'Kavya Rao', 'Sunita Das'];

  // Membership plans
  const membershipPlans = ['None', 'Glow Silver', 'Glow Gold', 'Glow Bridal Elite'];

  // Filter clients
  const filtered = (customers || []).filter(
    (c) =>
      (c?.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c?.phone && c.phone.includes(search))
  );

  // Client mock detailed data for profile drawer fallback
  const clientDetails = {
    'Ananya Sen': {
      avatar: 'AS',
      phone: '+91 98300 12345',
      email: 'ananya@gmail.com',
      lastVisit: '01 Aug 2026',
      totalVisits: 14,
      membershipTier: 'Glow Gold',
      lifetimeSpend: '₹25,000',
      loyaltyPoints: 350,
      preferredStylist: 'Riya Sharma',
      allergies: 'Sensitive scalp, prefers organic shampoos only.',
      upcomingAppointments: '12 Aug 2026 · Hair Spa & Styling',
      history: [
        { date: '01 Aug 2026', service: 'Hair Cut & Styling', stylist: 'Riya Sharma', cost: '₹800' },
        { date: '15 Jul 2026', service: 'Premium Hair Coloring', stylist: 'Riya Sharma', cost: '₹4,500' },
        { date: '02 Jul 2026', service: 'Hydrating Facial', stylist: 'Anjali', cost: '₹1,500' },
      ],
    },
    'Karan Malhotra': {
      avatar: 'KM',
      phone: '+91 98100 54321',
      email: 'karan@gmail.com',
      lastVisit: '05 Aug 2026',
      totalVisits: 8,
      membershipTier: 'Glow Silver',
      lifetimeSpend: '₹12,000',
      loyaltyPoints: 120,
      preferredStylist: 'Anjali',
      allergies: 'None reported.',
      upcomingAppointments: '15 Aug 2026 · Grooming & Trim',
      history: [
        { date: '05 Aug 2026', service: 'Premium Hair Coloring', stylist: 'Anjali', cost: '₹4,500' },
        { date: '20 Jun 2026', service: 'Hair Cut & Wash', stylist: 'Anjali', cost: '₹950' },
      ],
    },
    'Rohan Roy': {
      avatar: 'RR',
      phone: '+91 98400 98765',
      email: 'rohan@gmail.com',
      lastVisit: '28 Jul 2026',
      totalVisits: 5,
      membershipTier: 'None',
      lifetimeSpend: '₹8,500',
      loyaltyPoints: 50,
      preferredStylist: 'Kavya',
      allergies: 'Allergic to ammonia hair dyes.',
      upcomingAppointments: 'None scheduled',
      history: [
        { date: '28 Jul 2026', service: 'Hair Cut & Styling', stylist: 'Kavya', cost: '₹800' },
        { date: '10 Jun 2026', service: 'Hydrating Facial', stylist: 'Anjali', cost: '₹1,500' },
      ],
    },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors inline
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleServiceToggle = (service) => {
    setFormData((prev) => {
      const selected = prev.preferredServices.includes(service)
        ? prev.preferredServices.filter((s) => s !== service)
        : [...prev.preferredServices, service];
      return { ...prev, preferredServices: selected };
    });
  };

  const handleOpenModal = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      dob: '',
      gender: 'Female',
      address: '',
      preferredStylist: 'Riya Sharma',
      preferredServices: [],
      membershipTier: 'None',
      notes: '',
      whatsappOptIn: 'Yes'
    });
    setErrors({});
    setAddModalOpen(true);
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.name.trim()) {
      nextErrors.name = 'Full name is required';
    }
    
    if (!formData.phone.trim()) {
      nextErrors.phone = 'Phone number is required';
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        nextErrors.phone = 'Enter a valid 10-digit phone number';
      }
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        nextErrors.email = 'Enter a valid email address';
      }
    }

    // Check for duplicates
    const isDuplicate = customers.some(
      (c) => c.phone && c.phone.replace(/\D/g, '') === formData.phone.replace(/\D/g, '')
    );
    if (isDuplicate) {
      nextErrors.phone = 'A customer with this phone number already exists';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        category: formData.membershipTier, // standard field mapping
        notes: JSON.stringify({
          dob: formData.dob,
          gender: formData.gender,
          address: formData.address,
          preferredStylist: formData.preferredStylist,
          preferredServices: formData.preferredServices,
          whatsappOptIn: formData.whatsappOptIn,
          totalVisits: 0,
          totalSpent: 0,
          lastVisit: 'No visits yet',
          createdDate: new Date().toISOString()
        })
      };

      await addCustomer(payload);
      addNotification({ message: 'Client added successfully', type: 'success' });
      setAddModalOpen(false);
    } catch (err) {
      console.error('Failed to add client:', err);
      setErrors({ submit: err.message || 'Failed to save customer record. Please try again.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-green-forest">
            {isGu ? 'ડિરેક્ટરી' : 'Directory'}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-charcoal">
            {isGu ? 'ક્લાયન્ટ્સ અને લોયલ્ટી' : 'Clients & Loyalty'}
          </h1>
          <p className="text-sm text-warm-gray">
            {isGu ? 'સ્ટાઈલિસ્ટ પસંદગીઓ, મેમ્બરશિપ સ્તર અને બુકિંગ હિસ્ટ્રી સંચાલિત કરો' : 'Manage stylist preferences, membership tiers, and booking histories'}
          </p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-bottle hover:bg-green-forest text-white rounded-xl text-xs font-bold transition-all"
        >
          <Plus className="w-4 h-4" /> {isGu ? '+ નવો ક્લાયન્ટ ઉમેરો' : '+ Add New Client'}
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-stone shadow-subtle flex items-center">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-warm-gray absolute left-3 top-3" />
          <input
            type="text"
            placeholder={isGu ? 'ક્લાયન્ટનું નામ, ફોન દ્વારા શોધો...' : 'Search by client name, phone...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-ivory/55 border border-stone rounded-xl text-xs outline-none focus:border-green-bottle text-charcoal font-sans"
          />
        </div>
      </div>

      {/* Client List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => {
          let parsedNotes = {};
          try {
            parsedNotes = c.notes ? JSON.parse(c.notes) : {};
          } catch {
            parsedNotes = {};
          }

          const nameStr = c.name || 'Client';
          const detail = clientDetails[nameStr] || {
            avatar: nameStr.slice(0, 2).toUpperCase(),
            lastVisit: parsedNotes.lastVisit || (isGu ? 'હજી કોઈ મુલાકાત નથી' : 'No visits yet'),
            totalVisits: parsedNotes.totalVisits || 0,
            membershipTier: c.category || parsedNotes.membershipTier || (isGu ? 'કોઈ નહીં' : 'None'),
            lifetimeSpend: '₹' + (parsedNotes.totalSpent || 0).toLocaleString(),
            preferredStylist: parsedNotes.preferredStylist || (isGu ? 'અસાઇન કરેલ નથી' : 'Unassigned'),
            allergies: c.notes && !c.notes.startsWith('{') ? c.notes : (isGu ? 'કોઈ નહીં' : 'None'),
            loyaltyPoints: parsedNotes.loyaltyPoints || 0,
            upcomingAppointments: isGu ? 'કોઈ નિયત નથી' : 'None scheduled'
          };

          return (
            <div
              key={c.id}
              onClick={() => setSelectedClient({ ...c, ...detail, upcomingAppointments: detail.upcomingAppointments, history: detail.history || [] })}
              className="p-5 bg-white rounded-2xl border border-stone shadow-card flex flex-col justify-between space-y-4 hover:border-green-bottle cursor-pointer transition-all hover:scale-[1.01]"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-sage/20 border border-green-bottle/20 flex items-center justify-center font-bold text-green-bottle text-sm">
                    {detail.avatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-charcoal">{c.name}</h3>
                    <p className="text-[11px] text-warm-gray font-mono">{c.phone || (isGu ? 'ફોન નથી' : 'No phone')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-stone/50">
                  <div>
                    <span className="text-[10px] text-warm-gray block uppercase">{isGu ? 'છેલ્લી મુલાકાત' : 'Last Visit'}</span>
                    <span className="font-semibold text-charcoal">{detail.lastVisit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-warm-gray block uppercase">{isGu ? 'કુલ મુલાકાત' : 'Total Visits'}</span>
                    <span className="font-semibold text-charcoal">{detail.totalVisits} {isGu ? 'મુલાકાતો' : 'visits'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-warm-gray block uppercase">{isGu ? 'પસંદગીના સ્ટાઈલિસ્ટ' : 'Preferred Stylist'}</span>
                    <span className="font-semibold text-green-forest">{detail.preferredStylist}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-warm-gray block uppercase">{isGu ? 'મેમ્બરશિપ' : 'Membership'}</span>
                    <span className="font-semibold text-mustard">{detail.membershipTier}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone/50 text-xs">
                <span className="text-warm-gray">{isGu ? 'ખર્ચ:' : 'Spend:'} <strong className="text-charcoal">{detail.lifetimeSpend}</strong></span>
                <span className="text-green-bottle font-semibold inline-flex items-center gap-1">
                  {isGu ? 'પ્રોફાઇલ' : 'Profile'} <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Client Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white md:rounded-[20px] rounded-none border border-stone shadow-elev w-full h-full md:h-auto md:max-w-xl p-6 flex flex-col justify-between overflow-y-auto max-h-screen">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone">
                <h3 className="text-base font-bold text-charcoal">Add New Client</h3>
                <button type="button" onClick={() => setAddModalOpen(false)} className="p-1 hover:bg-cream rounded-full">
                  <X className="w-5 h-5 text-warm-gray" />
                </button>
              </div>

              <form id="clientForm" onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal font-semibold">
                
                {/* Full Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-warm-gray font-medium">Full Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                    placeholder="e.g. Krish Patel"
                  />
                  {errors.name && <p className="text-red-500 text-[10px] mt-0.5">{errors.name}</p>}
                </div>

                {/* Phone Number */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                    placeholder="e.g. 9824249704"
                  />
                  {errors.phone && <p className="text-red-500 text-[10px] mt-0.5">{errors.phone}</p>}
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                    placeholder="e.g. krish@gmail.com"
                  />
                  {errors.email && <p className="text-red-500 text-[10px] mt-0.5">{errors.email}</p>}
                </div>

                {/* Date of Birth */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Preferred Stylist */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Preferred Stylist</label>
                  <select
                    name="preferredStylist"
                    value={formData.preferredStylist}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                  >
                    {stylists.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Membership Plan */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Membership Tier</label>
                  <select
                    name="membershipTier"
                    value={formData.membershipTier}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                  >
                    {membershipPlans.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* Address */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-warm-gray font-medium">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                    placeholder="Enter street address"
                  />
                </div>

                {/* Preferred Services Checkboxes */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-warm-gray font-medium">Preferred Services</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {serviceOptions.map((service) => (
                      <label key={service} className="flex items-center gap-2 font-normal cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.preferredServices.includes(service)}
                          onChange={() => handleServiceToggle(service)}
                          className="w-4 h-4 rounded border-stone text-green-bottle focus:ring-green-bottle"
                        />
                        <span>{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-warm-gray font-medium">Notes & Preferences</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none resize-none"
                    placeholder="Enter preferences, hair types, or scalp conditions..."
                  />
                </div>

                {/* WhatsApp Opt-in */}
                <div className="space-y-1 sm:col-span-2 flex items-center gap-3 py-1">
                  <label className="text-warm-gray font-medium">WhatsApp Opt-in:</label>
                  <label className="flex items-center gap-1.5 font-normal cursor-pointer">
                    <input
                      type="radio"
                      name="whatsappOptIn"
                      value="Yes"
                      checked={formData.whatsappOptIn === 'Yes'}
                      onChange={handleInputChange}
                      className="text-green-bottle focus:ring-green-bottle"
                    />
                    <span>Yes</span>
                  </label>
                  <label className="flex items-center gap-1.5 font-normal cursor-pointer">
                    <input
                      type="radio"
                      name="whatsappOptIn"
                      value="No"
                      checked={formData.whatsappOptIn === 'No'}
                      onChange={handleInputChange}
                      className="text-green-bottle focus:ring-green-bottle"
                    />
                    <span>No</span>
                  </label>
                </div>

                {errors.submit && <p className="text-red-500 text-xs sm:col-span-2 mt-1">{errors.submit}</p>}
              </form>
            </div>

            <div className="flex gap-2 pt-3 border-t border-stone mt-6">
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="flex-1 py-2.5 border border-stone rounded-xl text-charcoal font-bold hover:bg-cream transition-all text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="clientForm"
                disabled={submitLoading}
                className="flex-1 py-2.5 bg-green-bottle hover:bg-green-forest text-white rounded-xl font-bold transition-all text-xs disabled:opacity-50"
              >
                {submitLoading ? 'Saving...' : 'Save Client'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Client Profile Drawer */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white h-full shadow-elev p-6 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-bottle text-white flex items-center justify-center font-bold text-lg">
                    {selectedClient.avatar}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-charcoal">{selectedClient.name}</h2>
                    <p className="text-xs text-warm-gray">{selectedClient.membershipTier} Member</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClient(null)}
                  className="p-1.5 rounded-full hover:bg-cream text-warm-gray"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1 p-3 bg-ivory/50 rounded-xl border border-stone">
                  <Phone className="w-4 h-4 text-green-forest" />
                  <span className="text-warm-gray block text-[10px]">Phone</span>
                  <span className="font-semibold text-charcoal">{selectedClient.phone || 'N/A'}</span>
                </div>
                <div className="space-y-1 p-3 bg-ivory/50 rounded-xl border border-stone">
                  <Mail className="w-4 h-4 text-green-forest" />
                  <span className="text-warm-gray block text-[10px]">Email</span>
                  <span className="font-semibold text-charcoal truncate block">{selectedClient.email || 'N/A'}</span>
                </div>
              </div>

              {/* Loyalty & Preferred */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs p-3.5 bg-yellow-butter/15 border border-yellow-butter/30 rounded-xl">
                  <span className="flex items-center gap-1.5 font-semibold text-charcoal">
                    <Award className="w-4 h-4 text-mustard" /> Loyalty Balance
                  </span>
                  <strong className="text-mustard text-sm">{selectedClient.loyaltyPoints} points</strong>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-warm-gray uppercase text-[10px]">Preferred Stylist</span>
                  <p className="font-semibold text-charcoal">{selectedClient.preferredStylist}</p>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-warm-gray uppercase text-[10px]">Upcoming Appointment</span>
                  <p className="font-semibold text-green-forest bg-green-sage/10 p-2.5 rounded-lg border border-green-bottle/20">
                    📅 {selectedClient.upcomingAppointments}
                  </p>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-warm-gray uppercase text-[10px] text-terracotta">Allergies & Preferences</span>
                  <p className="p-2.5 bg-red-50 text-terracotta rounded-lg border border-red-200 leading-relaxed font-sans">
                    ⚠️ {selectedClient.allergies}
                  </p>
                </div>
              </div>

              {/* Service History */}
              <div className="space-y-2.5 pt-4 border-t border-stone">
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">Service History</h3>
                <div className="space-y-2">
                  {selectedClient.history && selectedClient.history.length > 0 ? (
                    selectedClient.history.map((h, i) => (
                      <div key={i} className="p-3 bg-white border border-stone rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-charcoal">{h.service}</p>
                          <p className="text-[10px] text-warm-gray">{h.date} · Stylist: {h.stylist}</p>
                        </div>
                        <span className="font-mono font-bold text-green-forest">{h.cost}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-warm-gray italic text-[11px]">No prior history available</p>
                  )}
                </div>
              </div>
            </div>

            <Button onClick={() => setSelectedClient(null)} className="w-full">
              Close Profile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
