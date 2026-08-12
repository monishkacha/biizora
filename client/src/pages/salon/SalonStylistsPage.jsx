import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../context/NotificationContext';
import {
  Users,
  Plus,
  Sparkles,
  Award,
  Calendar,
  Settings,
  Scissors,
  X,
  Phone,
  Mail,
  Briefcase,
  Clock,
} from 'lucide-react';
import { Card } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

// Specialities options
const specialtiesOptions = [
  'Haircut', 'Hair Styling', 'Hair Coloring', 'Keratin', 
  'Facial', 'Makeup', 'Nails', 'Manicure', 'Pedicure', 
  'Beard Grooming'
];

// Role options
const roleOptions = [
  'Senior Stylist',
  'Stylist',
  'Hair Coloring Expert',
  'Skin & Beauty Therapist',
  'Nail Artist & Manicurist',
  'Receptionist',
  'Other'
];

// Week days
const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SalonStylistsPage() {
  const { t, i18n } = useTranslation();
  const isGu = i18n.language?.startsWith('gu');
  const { addNotification } = useNotification();

  const [stylists, setStylists] = useState(() => {
    const saved = localStorage.getItem('salon_stylists');
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'Riya Sharma', role: 'Senior Stylist', activeBookings: 8, todayRevenue: '₹6,200', rating: '4.9★', status: 'Active', commissionRate: '20%', phone: '9876543211', email: 'riya@glow.com', specialization: ['Haircut', 'Hair Styling'], workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
      { id: 2, name: 'Anjali Shah', role: 'Hair Coloring Expert', activeBookings: 5, todayRevenue: '₹4,850', rating: '4.8★', status: 'Active', commissionRate: '18%', phone: '9876543212', email: 'anjali@glow.com', specialization: ['Hair Coloring', 'Keratin'], workingDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
      { id: 3, name: 'Kavya Rao', role: 'Skin & Beauty Therapist', activeBookings: 4, todayRevenue: '₹3,400', rating: '4.7★', status: 'Active', commissionRate: '15%', phone: '9876543213', email: 'kavya@glow.com', specialization: ['Facial', 'Makeup'], workingDays: ['Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
      { id: 4, name: 'Sunita Das', role: 'Nail Artist & Manicurist', activeBookings: 2, todayRevenue: '₹1,500', rating: '4.6★', status: 'Break', commissionRate: '12%', phone: '9876543214', email: 'sunita@glow.com', specialization: ['Nails', 'Manicure', 'Pedicure'], workingDays: ['Thursday', 'Friday', 'Saturday', 'Sunday'] },
    ];
  });

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: '',
    specialization: [],
    experience: '',
    commission: '20',
    joiningDate: '',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    shiftStart: '09:00 AM',
    shiftEnd: '07:00 PM',
    breakTime: '01:00 PM - 02:00 PM',
    status: 'Active',
    notes: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSpecialtyToggle = (spec) => {
    setFormData((prev) => {
      const selected = prev.specialization.includes(spec)
        ? prev.specialization.filter((s) => s !== spec)
        : [...prev.specialization, spec];
      return { ...prev, specialization: selected };
    });
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const selected = prev.workingDays.includes(day)
        ? prev.workingDays.filter((d) => d !== day)
        : [...prev.workingDays, day];
      return { ...prev, workingDays: selected };
    });
  };

  const handleOpenModal = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      role: 'Stylist',
      specialization: [],
      experience: '',
      commission: '20',
      joiningDate: new Date().toISOString().split('T')[0],
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      shiftStart: '09:00 AM',
      shiftEnd: '07:00 PM',
      breakTime: '01:00 PM - 02:00 PM',
      status: 'Active',
      notes: '',
    });
    setErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.name.trim()) {
      nextErrors.name = 'Stylist name is required';
    }
    
    if (!formData.phone.trim()) {
      nextErrors.phone = 'Phone number is required';
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        nextErrors.phone = 'Please enter a valid phone number';
      }
    }

    if (!formData.role) {
      nextErrors.role = 'Job role is required';
    }

    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        nextErrors.email = 'Enter a valid email address';
      }
    }

    const commissionNum = Number(formData.commission);
    if (isNaN(commissionNum) || commissionNum < 0 || commissionNum > 100) {
      nextErrors.commission = 'Commission must be between 0% and 100%';
    }

    // Duplicate check
    const isDuplicate = stylists.some(
      (s) => s.phone && s.phone.replace(/\D/g, '') === formData.phone.replace(/\D/g, '')
    );
    if (isDuplicate) {
      nextErrors.phone = 'A stylist with this phone number already exists.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newStylist = {
      id: Date.now(),
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      role: formData.role,
      specialization: formData.specialization,
      experience: formData.experience,
      commissionRate: `${formData.commission}%`,
      joiningDate: formData.joiningDate,
      workingDays: formData.workingDays,
      shiftStart: formData.shiftStart,
      shiftEnd: formData.shiftEnd,
      breakTime: formData.breakTime,
      status: formData.status,
      activeBookings: 0,
      todayRevenue: '₹0',
      rating: 'New',
      notes: formData.notes,
      createdAt: new Date().toISOString()
    };

    const updated = [...stylists, newStylist];
    setStylists(updated);
    localStorage.setItem('salon_stylists', JSON.stringify(updated));

    addNotification({ message: 'Stylist added successfully', type: 'success' });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-green-forest">{isGu ? 'ટીમ મેનેજમેન્ટ' : 'Team Management'}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-charcoal">
            {isGu ? 'સ્ટાઈલિસ્ટ્સ અને સ્ટાફ' : 'Stylists & Staff'}
          </h1>
          <p className="text-sm text-warm-gray">{isGu ? 'સ્ટાઈલિસ્ટ કમિશન, કામગીરીના માપદંડો અને શિફ્ટનું ધ્યાન રાખો' : 'Monitor stylist commissions, performance metrics, and shifts'}</p>
        </div>
        <button
          onClick={handleOpenModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-bottle hover:bg-green-forest text-white rounded-xl text-xs font-bold transition-all"
        >
          <Plus className="w-4 h-4" /> {isGu ? 'નવા સ્ટાઈલિસ્ટ ઉમેરો' : 'Add New Stylist'}
        </button>
      </div>

      {/* Stylist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stylists.map((st) => (
          <Card key={st.id} className="p-5 border border-stone bg-white flex flex-col justify-between space-y-4 hover:border-green-bottle transition-all">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-full bg-green-sage/20 border border-green-bottle/20 flex items-center justify-center font-bold text-green-bottle text-sm">
                  {st.name.split(' ').map(n => n[0]).join('')}
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  st.status === 'Active' ? 'bg-green-sage/20 text-green-bottle' : 'bg-yellow-champagne text-mustard'
                }`}>
                  {st.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-charcoal">{st.name}</h3>
                <p className="text-[11px] text-warm-gray">{st.role}</p>
              </div>

              <div className="pt-2 border-t border-stone/50 space-y-1.5 text-xs text-charcoal font-semibold">
                <div className="flex justify-between">
                  <span className="text-warm-gray font-medium">{isGu ? 'કમિશન દર:' : 'Commission:'}</span>
                  <span>{st.commissionRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-gray font-medium">{isGu ? 'આજના બુકિંગ:' : 'Bookings Today:'}</span>
                  <span>{st.activeBookings}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-gray font-medium">{isGu ? 'આવક જનરેટ થયેલ:' : 'Revenue generated:'}</span>
                  <span className="font-mono text-green-forest">{st.todayRevenue}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-stone/50 text-xs">
              <span className="text-mustard font-bold flex items-center gap-0.5">
                <Sparkles className="w-3.5 h-3.5 fill-yellow-champagne" /> {st.rating}
              </span>
              <button className="text-green-bottle hover:underline flex items-center gap-1 font-semibold">
                <Settings className="w-3.5 h-3.5" /> {isGu ? 'શિફ્ટ સંચાલન →' : 'Shifts →'}
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add New Stylist Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white md:rounded-[20px] rounded-none border border-stone shadow-elev w-full h-full md:h-auto md:max-w-xl p-6 flex flex-col justify-between overflow-y-auto max-h-screen">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone">
                <div>
                  <h3 className="text-base font-bold text-charcoal">Add New Stylist</h3>
                  <p className="text-[11px] text-warm-gray">Add a new stylist or staff member to your salon</p>
                </div>
                <button type="button" onClick={() => setModalOpen(false)} className="p-1 hover:bg-cream rounded-full">
                  <X className="w-5 h-5 text-warm-gray" />
                </button>
              </div>

              <form id="stylistForm" onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal font-semibold">
                
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Full Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                    placeholder="e.g. Riya Sharma"
                  />
                  {errors.name && <p className="text-red-500 text-[10px] mt-0.5">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                    placeholder="e.g. 9876543211"
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
                    placeholder="e.g. riya@glow.com"
                  />
                  {errors.email && <p className="text-red-500 text-[10px] mt-0.5">{errors.email}</p>}
                </div>

                {/* Job Role */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Job Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                  >
                    {roleOptions.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {errors.role && <p className="text-red-500 text-[10px] mt-0.5">{errors.role}</p>}
                </div>

                {/* Experience */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Experience (Years)</label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                    placeholder="e.g. 5 Years"
                  />
                </div>

                {/* Commission % */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Commission % *</label>
                  <input
                    type="number"
                    name="commission"
                    value={formData.commission}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                    placeholder="e.g. 20"
                  />
                  {errors.commission && <p className="text-red-500 text-[10px] mt-0.5">{errors.commission}</p>}
                </div>

                {/* Joining Date */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Joining Date</label>
                  <input
                    type="date"
                    name="joiningDate"
                    value={formData.joiningDate}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Break">On Break</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Specialties */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-warm-gray font-medium">Specializations</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {specialtiesOptions.map(spec => (
                      <label key={spec} className="flex items-center gap-2 font-normal cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.specialization.includes(spec)}
                          onChange={() => handleSpecialtyToggle(spec)}
                          className="w-4 h-4 rounded border-stone text-green-bottle focus:ring-green-bottle"
                        />
                        <span>{spec}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Shift Timings */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Shift Start</label>
                  <input
                    type="text"
                    name="shiftStart"
                    value={formData.shiftStart}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Shift End</label>
                  <input
                    type="text"
                    name="shiftEnd"
                    value={formData.shiftEnd}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                  />
                </div>

                {/* Working Days */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-warm-gray font-medium">Working Days</label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {weekDays.map(day => (
                      <label key={day} className="flex items-center gap-1.5 font-normal cursor-pointer select-none bg-ivory/50 px-2.5 py-1.5 border border-stone rounded-lg hover:bg-cream">
                        <input
                          type="checkbox"
                          checked={formData.workingDays.includes(day)}
                          onChange={() => handleDayToggle(day)}
                          className="w-3.5 h-3.5 rounded border-stone text-green-bottle focus:ring-green-bottle"
                        />
                        <span>{day.slice(0, 3)}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-warm-gray font-medium">Notes</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none resize-none"
                    placeholder="Enter additional details or review comments..."
                  />
                </div>

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
                form="stylistForm"
                className="flex-1 py-2.5 bg-green-bottle hover:bg-green-forest text-white rounded-xl font-bold transition-all text-xs"
              >
                Add Stylist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
