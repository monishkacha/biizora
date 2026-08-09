import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import {
  Scissors,
  Plus,
  Search,
  Clock,
  CheckCircle,
  Eye,
  X,
  User,
} from 'lucide-react';
import { Card } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

// Available stylists
const stylistsOptions = ['Riya Sharma', 'Anjali Shah', 'Kavya Rao', 'Sunita Das'];

export default function SalonServicesPage() {
  const { addNotification } = useNotification();
  const [activeCategory, setActiveCategory] = useState('Hair');

  // Load services from localStorage or fallbacks
  const [services, setServices] = useState(() => {
    const saved = localStorage.getItem('salon_services');
    return saved ? JSON.parse(saved) : [
      { id: 101, name: 'Haircut', category: 'Hair', duration: '45 mins', price: 800, stylists: ['Riya Sharma', 'Anjali Shah', 'Kavya Rao'], onlineBooking: true, status: 'Active', description: 'Professional haircut and blow-dry styling' },
      { id: 102, name: 'Hair Spa', category: 'Hair', duration: '60 mins', price: 1500, stylists: ['Riya Sharma', 'Kavya Rao'], onlineBooking: true, status: 'Active', description: 'Hydrating hair mask and scalp massage' },
      { id: 103, name: 'Hair Coloring', category: 'Hair', duration: '120 mins', price: 4500, stylists: ['Anjali Shah'], onlineBooking: true, status: 'Active', description: 'Premium ammonia-free global hair coloring' },
      { id: 104, name: 'Keratin Treatment', category: 'Hair', duration: '180 mins', price: 5500, stylists: ['Riya Sharma', 'Anjali Shah'], onlineBooking: true, status: 'Active', description: 'Protein smoothing treatment for frizzy hair' },
      { id: 201, name: 'Facial', category: 'Beauty', duration: '60 mins', price: 1500, stylists: ['Anjali Shah', 'Kavya Rao'], onlineBooking: true, status: 'Active', description: 'Hydrating organic fruit facial' },
      { id: 202, name: 'Cleanup', category: 'Beauty', duration: '30 mins', price: 800, stylists: ['Kavya Rao'], onlineBooking: true, status: 'Active', description: 'Quick herbal skin cleansing' },
      { id: 203, name: 'Waxing', category: 'Beauty', duration: '45 mins', price: 1200, stylists: ['Kavya Rao'], onlineBooking: true, status: 'Active', description: 'Full arms and legs honey waxing' },
      { id: 301, name: 'Manicure', category: 'Nails', duration: '45 mins', price: 1000, stylists: ['Sunita Das'], onlineBooking: true, status: 'Active', description: 'Classic spa nail shaping and polish' },
      { id: 302, name: 'Pedicure', category: 'Nails', duration: '60 mins', price: 1500, stylists: ['Sunita Das'], onlineBooking: true, status: 'Active', description: 'Relaxing foot scrub and pedicure styling' },
      { id: 303, name: 'Nail Art', category: 'Nails', duration: '90 mins', price: 2500, stylists: ['Sunita Das'], onlineBooking: true, status: 'Active', description: 'Custom gel nail designs' },
    ];
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('salon_services', JSON.stringify(services));
  }, [services]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    category: 'Hair',
    description: '',
    duration: '45',
    price: '',
    stylists: ['Riya Sharma'],
    onlineBooking: true,
    status: 'Active',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleToggleOnline = (e) => {
    setFormData((prev) => ({ ...prev, onlineBooking: e.target.checked }));
  };

  const handleStylistToggle = (stName) => {
    setFormData((prev) => {
      const selected = prev.stylists.includes(stName)
        ? prev.stylists.filter((name) => name !== stName)
        : [...prev.stylists, stName];
      return { ...prev, stylists: selected };
    });
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      category: activeCategory,
      description: '',
      duration: '45',
      price: '',
      stylists: ['Riya Sharma'],
      onlineBooking: true,
      status: 'Active',
    });
    setEditingService(null);
    setErrors({});
    setModalOpen(true);
  };

  const handleOpenEdit = (srv) => {
    const numericDuration = srv.duration.replace(/\D/g, '');
    setFormData({
      name: srv.name,
      category: srv.category,
      description: srv.description || '',
      duration: numericDuration || '45',
      price: srv.price,
      stylists: srv.stylists || [],
      onlineBooking: srv.onlineBooking ?? true,
      status: srv.status || 'Active',
    });
    setEditingService(srv);
    setErrors({});
    setModalOpen(true);
  };

  const handleRowToggleOnline = (id, checked) => {
    const updated = services.map((s) =>
      s.id === id ? { ...s, onlineBooking: checked } : s
    );
    setServices(updated);
    addNotification({ message: 'Online booking option updated successfully', type: 'success' });
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.name.trim()) {
      nextErrors.name = 'Service name is required';
    }
    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      nextErrors.price = 'Price cannot be negative';
    }
    const durationNum = Number(formData.duration);
    if (isNaN(durationNum) || durationNum <= 0) {
      nextErrors.duration = 'Duration must be greater than 0';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingService) {
      const updated = services.map((s) =>
        s.id === editingService.id
          ? {
              ...s,
              name: formData.name,
              category: formData.category,
              description: formData.description,
              duration: `${formData.duration} mins`,
              price: Number(formData.price),
              stylists: formData.stylists,
              onlineBooking: formData.onlineBooking,
              status: formData.status,
            }
          : s
      );
      setServices(updated);
      addNotification({ message: 'Service updated successfully', type: 'success' });
    } else {
      const newSrv = {
        id: Date.now(),
        name: formData.name,
        category: formData.category,
        description: formData.description,
        duration: `${formData.duration} mins`,
        price: Number(formData.price),
        stylists: formData.stylists,
        onlineBooking: formData.onlineBooking,
        status: formData.status,
      };
      const nextServices = [...services, newSrv];
      setServices(nextServices);
      localStorage.setItem('salon_services', JSON.stringify(nextServices));
      setActiveCategory(formData.category);
      addNotification({ message: 'Service added successfully', type: 'success' });
    }
    setModalOpen(false);
  };

  // Filter list by category
  const filteredServices = services.filter((s) => s.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-green-forest">Menu Management</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-charcoal">
            Services & Catalog
          </h1>
          <p className="text-sm text-warm-gray">Define service categories, pricing tables, stylist assignments, and booking options</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-green-bottle hover:bg-green-forest text-white rounded-xl text-xs font-bold transition-all"
        >
          <Plus className="w-4 h-4" /> Add New Service
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-ivory border border-stone p-1 rounded-xl text-xs font-semibold self-start">
        {['Hair', 'Beauty', 'Nails'].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-lg capitalize transition-colors ${
              activeCategory === cat ? 'bg-green-bottle text-white shadow-subtle' : 'text-charcoal/80 hover:bg-cream'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Table List */}
      <Card className="overflow-hidden border border-stone">
        <div className="overflow-x-auto">
          <table className="bz-table w-full text-left">
            <thead>
              <tr className="bg-ivory/50 text-charcoal text-xs border-b border-stone">
                <th className="p-4">Service</th>
                <th className="p-4">Duration</th>
                <th className="p-4">Assigned Stylists</th>
                <th className="p-4 text-center">Online Booking</th>
                <th className="p-4 text-right">Price</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-stone/50 bg-white">
              {filteredServices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-warm-gray py-10">No services defined in this category.</td>
                </tr>
              ) : (
                filteredServices.map((srv) => (
                  <tr key={srv.id} className="hover:bg-cream/20">
                    <td className="p-4 font-bold text-charcoal flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-green-bottle shrink-0" />
                      <div>
                        <span className="block">{srv.name}</span>
                        {srv.status === 'Inactive' && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase">Inactive</span>}
                      </div>
                    </td>
                    <td className="p-4 text-warm-gray font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-green-olive" /> {srv.duration}
                    </td>
                    <td className="p-4 font-semibold text-charcoal">
                      {(srv.stylists || []).join(', ') || 'None'}
                    </td>
                    <td className="p-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer justify-center">
                        <input
                          type="checkbox"
                          checked={srv.onlineBooking ?? true}
                          onChange={(e) => handleRowToggleOnline(srv.id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-stone peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-bottle" />
                      </label>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-charcoal">₹{srv.price}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleOpenEdit(srv)}
                        className="text-green-forest hover:underline font-semibold"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add / Edit Service Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white md:rounded-[20px] rounded-none border border-stone shadow-elev w-full h-full md:h-auto md:max-w-xl p-6 flex flex-col justify-between overflow-y-auto max-h-screen">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone">
                <div>
                  <h3 className="text-base font-bold text-charcoal">{editingService ? 'Edit Service' : 'Add New Service'}</h3>
                  <p className="text-[11px] text-warm-gray">Create a service that customers can book online.</p>
                </div>
                <button type="button" onClick={() => setModalOpen(false)} className="p-1 hover:bg-cream rounded-full">
                  <X className="w-5 h-5 text-warm-gray" />
                </button>
              </div>

              <form id="serviceForm" onSubmit={handleFormSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal font-semibold">
                
                {/* Service Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-warm-gray font-medium">Service Name *</label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                    placeholder="e.g. Haircut"
                  />
                  {errors.name && <p className="text-red-500 text-[10px] mt-0.5">{errors.name}</p>}
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                  >
                    <option value="Hair">Hair</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Nails">Nails</option>
                  </select>
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Duration (minutes) *</label>
                  <input
                    type="number"
                    required
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                    placeholder="e.g. 45"
                  />
                  {errors.duration && <p className="text-red-500 text-[10px] mt-0.5">{errors.duration}</p>}
                </div>

                {/* Price */}
                <div className="space-y-1">
                  <label className="block text-warm-gray font-medium">Price (₹) *</label>
                  <input
                    type="number"
                    required
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none"
                    placeholder="e.g. 800"
                  />
                  {errors.price && <p className="text-red-500 text-[10px] mt-0.5">{errors.price}</p>}
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
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-warm-gray font-medium">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none resize-none"
                    placeholder="Enter service details..."
                  />
                </div>

                {/* Assigned Stylists */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-warm-gray font-medium">Assigned Stylists</label>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {stylistsOptions.map((stName) => (
                      <label key={stName} className="flex items-center gap-2 font-normal cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={formData.stylists.includes(stName)}
                          onChange={() => handleStylistToggle(stName)}
                          className="w-4 h-4 rounded border-stone text-green-bottle focus:ring-green-bottle"
                        />
                        <span>{stName}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Online Booking Toggle */}
                <div className="space-y-1 sm:col-span-2 flex items-center gap-3 pt-2">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.onlineBooking}
                      onChange={handleToggleOnline}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-bottle" />
                  </label>
                  <span className="text-[#171717] font-semibold text-xs">Available for Online Booking</span>
                </div>

                <div className="flex gap-2 pt-3 border-t border-stone mt-6 sm:col-span-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 border border-stone rounded-xl text-charcoal font-bold hover:bg-cream transition-all text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-green-bottle hover:bg-green-forest text-white rounded-xl font-bold transition-all text-xs"
                  >
                    {editingService ? 'Save Changes' : 'Add Service'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
