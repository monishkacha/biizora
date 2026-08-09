import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBusiness } from '../../context/BusinessContext';
import { useNotification } from '../../context/NotificationContext';
import {
  Scissors,
  User,
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Award,
  Phone,
  Mail,
  CheckCircle,
  X,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Card } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PoweredByBizora } from '../../components/ui/PoweredByBizora';

// Flat stylists list
const stylistList = [
  { id: 'riya', name: 'Riya Sharma', role: 'Senior Stylist', status: 'Active' },
  { id: 'anjali', name: 'Anjali Shah', role: 'Hair Coloring Expert', status: 'Active' },
  { id: 'kavya', name: 'Kavya Rao', role: 'Skin & Beauty Therapist', status: 'Active' },
  { id: 'sunita', name: 'Sunita Das', role: 'Nail Artist & Manicurist', status: 'Active' },
];

export default function PublicBookingPage() {
  const { customers, addCustomer } = useBusiness();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  // Customer details
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});

  // Success details
  const [bookingId, setBookingId] = useState(null);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Load services from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('salon_services');
    if (saved) {
      setServices(JSON.parse(saved));
    } else {
      // Fallback default list
      const defaults = [
        { id: 101, name: 'Haircut', category: 'Hair', duration: '45 mins', price: 800, stylists: ['Riya Sharma', 'Anjali Shah', 'Kavya Rao'], onlineBooking: true, status: 'Active' },
        { id: 102, name: 'Hair Spa', category: 'Hair', duration: '60 mins', price: 1500, stylists: ['Riya Sharma', 'Kavya Rao'], onlineBooking: true, status: 'Active' },
        { id: 103, name: 'Hair Coloring', category: 'Hair', duration: '120 mins', price: 4500, stylists: ['Anjali Shah'], onlineBooking: true, status: 'Active' },
        { id: 104, name: 'Keratin Treatment', category: 'Hair', duration: '180 mins', price: 5500, stylists: ['Riya Sharma', 'Anjali Shah'], onlineBooking: true, status: 'Active' },
        { id: 105, name: 'Facial', category: 'Beauty', duration: '60 mins', price: 1500, stylists: ['Anjali Shah', 'Kavya Rao'], onlineBooking: true, status: 'Active' },
      ];
      setServices(defaults);
      localStorage.setItem('salon_services', JSON.stringify(defaults));
    }
  }, []);

  // Filter bookable services
  const bookableServices = services.filter(
    (s) => s.onlineBooking === true && s.status === 'Active'
  );

  // Get active stylists assigned to selected service
  const serviceStylists = selectedService
    ? stylistList.filter(
        (st) =>
          st.status === 'Active' &&
          (selectedService.stylists || []).some(
            (name) => name.toLowerCase().includes(st.name.split(' ')[0].toLowerCase())
          )
      )
    : [];

  // Available Time calculation based on business hours and existing bookings
  const businessStartHour = 9; // 9:00 AM
  const businessEndHour = 20;  // 8:00 PM
  
  const generateTimeSlots = () => {
    const slots = [];
    let currentHour = businessStartHour;
    let currentMin = 0;

    while (currentHour < businessEndHour) {
      const ampm = currentHour >= 12 ? 'PM' : 'AM';
      const displayHour = currentHour > 12 ? currentHour - 12 : currentHour === 0 ? 12 : currentHour;
      const displayMin = String(currentMin).padStart(2, '0');
      slots.push(`${String(displayHour).padStart(2, '0')}:${displayMin} ${ampm}`);
      
      currentMin += 30;
      if (currentMin >= 60) {
        currentMin = 0;
        currentHour += 1;
      }
    }
    return slots;
  };

  const getAvailableSlots = () => {
    if (!selectedDate || !selectedStylist) return [];
    
    // Load existing appointments
    const savedAppts = localStorage.getItem('salon_schedule');
    const appointments = savedAppts ? JSON.parse(savedAppts) : [];

    const allSlots = generateTimeSlots();

    // Filter slots by overlapping appointments
    return allSlots.filter((slot) => {
      const isOverlapping = appointments.some((appt) => {
        if (appt.status === 'Cancelled' || appt.status === 'Available') return false;
        
        // Match stylist and date
        const matchDate = appt.date === selectedDate;
        const matchStylist = 
          selectedStylist.name === 'Any Available Stylist' || 
          appt.stylist.toLowerCase().includes(selectedStylist.name.split(' ')[0].toLowerCase());

        if (matchDate && matchStylist) {
          // Simplistic matching for slot block
          return appt.time === slot;
        }
        return false;
      });
      return !isOverlapping;
    });
  };

  const availableTimeSlots = getAvailableSlots();

  const handleNextStep = () => {
    if (step === 1 && !selectedService) {
      alert('Please select a service');
      return;
    }
    if (step === 2 && !selectedStylist) {
      alert('Please select a stylist');
      return;
    }
    if (step === 3 && (!selectedDate || !selectedTime)) {
      alert('Please select date and time');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSelectService = (srv) => {
    setSelectedService(srv);
    setSelectedStylist(null);
    setSelectedDate('');
    setSelectedTime('');
    setStep(2);
  };

  const handleSelectStylist = (st) => {
    setSelectedStylist(st);
    setSelectedDate('');
    setSelectedTime('');
    setStep(3);
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();

    if (!clientName.trim()) {
      setErrors((prev) => ({ ...prev, name: 'Full name is required' }));
      return;
    }
    if (!clientPhone.trim()) {
      setErrors((prev) => ({ ...prev, phone: 'Phone number is required' }));
      return;
    } else if (clientPhone.replace(/\D/g, '').length < 10) {
      setErrors((prev) => ({ ...prev, phone: 'Enter a valid 10-digit phone number' }));
      return;
    }

    setSubmitLoading(true);
    try {
      // Find or create customer
      let customerId = '';
      const existingCustomer = customers.find(
        (c) => c.phone && c.phone.replace(/\D/g, '') === clientPhone.replace(/\D/g, '')
      );

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const newCust = await addCustomer({
          name: clientName,
          phone: clientPhone,
          email: clientEmail,
        });
        customerId = newCust.id;
      }

      // Assign stylist if 'Any Available'
      let finalStylist = selectedStylist;
      if (selectedStylist.name === 'Any Available Stylist') {
        const eligible = serviceStylists.length > 0 ? serviceStylists[0] : { name: 'Riya Sharma' };
        finalStylist = eligible;
      }

      const generatedId = Date.now();
      const apptPayload = {
        id: generatedId,
        customerId,
        client: clientName,
        phone: clientPhone,
        email: clientEmail,
        service: selectedService.name,
        stylist: finalStylist.name.split(' ')[0], // matching stylist shortname pattern
        date: selectedDate,
        time: selectedTime,
        status: 'Pending',
        price: selectedService.price,
        amount: `₹${selectedService.price.toLocaleString('en-IN')}`,
        notes: notes,
        bookingSource: 'Online',
        createdAt: new Date().toISOString()
      };

      // Save to localStorage appointments list
      const savedAppts = localStorage.getItem('salon_schedule');
      const appointments = savedAppts ? JSON.parse(savedAppts) : [];
      const updated = [apptPayload, ...appointments.filter(a => a.status !== 'Available')];
      localStorage.setItem('salon_schedule', JSON.stringify(updated));

      // Trigger notification
      addNotification({ message: 'Online appointment request submitted successfully', type: 'success' });
      
      setBookingId(generatedId.toString().slice(-6));
      setBookingConfirmed(true);
      setStep(5);
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.message || 'Failed to submit booking request.' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const getInitials = (name) => {
    return name.split(' ').map((n) => n[0]).join('');
  };

  if (bookingConfirmed) {
    return (
      <div className="min-h-screen bg-[#F7F5F1] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-[#E5E3DD] rounded-[24px] shadow-subtle p-6 text-center space-y-6">
          <div className="w-16 h-16 bg-[#2F6B59]/10 rounded-full flex items-center justify-center mx-auto text-[#2F6B59]">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-[#171717]">Appointment Booked Successfully!</h1>
            <p className="text-xs text-[#706E6B]">
              Your appointment request has been received. The salon will confirm your appointment shortly.
            </p>
          </div>

          <div className="p-4 bg-[#F7F5F1] rounded-2xl text-left text-xs space-y-3 font-semibold text-[#171717]">
            <div className="flex justify-between">
              <span className="text-[#706E6B] font-medium">Booking ID:</span>
              <span>#{bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#706E6B] font-medium">Customer:</span>
              <span>{clientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#706E6B] font-medium">Service:</span>
              <span>{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#706E6B] font-medium">Stylist:</span>
              <span>{selectedStylist?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#706E6B] font-medium">Date & Time:</span>
              <span>{selectedDate} · {selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#706E6B] font-medium">Amount:</span>
              <span className="font-mono font-bold">₹{selectedService?.price}</span>
            </div>
          </div>

          <Button
            onClick={() => {
              setStep(1);
              setSelectedService(null);
              setSelectedStylist(null);
              setSelectedDate('');
              setSelectedTime('');
              setClientName('');
              setClientPhone('');
              setClientEmail('');
              setNotes('');
              setBookingConfirmed(false);
            }}
            className="w-full h-12 bg-[#2F6B59] hover:bg-[#1C4337] text-white border-none font-bold text-xs rounded-xl"
          >
            Book Another Appointment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F1] flex flex-col justify-between">
      {/* Navbar Header */}
      <header className="bg-white border-b border-[#E5E3DD] py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#2F6B59] text-white flex items-center justify-center font-bold text-sm tracking-wider">
              GSS
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#171717] leading-none">Glow Salon Studio ✨</h2>
              <span className="text-[10px] text-[#706E6B]">Premium Beauty & Hair Care</span>
            </div>
          </div>
          <span className="text-[10px] bg-[#EFCF63]/20 text-[#171717] px-2.5 py-1 rounded-full font-bold">
            Online Booking
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 md:py-10 space-y-6">
        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#171717]">Book Your Appointment</h1>
          <p className="text-xs text-[#706E6B]">Choose a service, stylist, and convenient time.</p>
        </div>

        {/* Steps Indicators */}
        <div className="flex justify-between items-center max-w-xs mx-auto text-[10px] font-bold text-[#706E6B]">
          <span className={`${step >= 1 ? 'text-[#2F6B59]' : ''}`}>1. Service</span>
          <span className="h-[1px] bg-[#E5E3DD] flex-1 mx-2" />
          <span className={`${step >= 2 ? 'text-[#2F6B59]' : ''}`}>2. Stylist</span>
          <span className="h-[1px] bg-[#E5E3DD] flex-1 mx-2" />
          <span className={`${step >= 3 ? 'text-[#2F6B59]' : ''}`}>3. Date & Time</span>
          <span className="h-[1px] bg-[#E5E3DD] flex-1 mx-2" />
          <span className={`${step >= 4 ? 'text-[#2F6B59]' : ''}`}>4. Details</span>
        </div>

        {/* STEP 1 - Select Service */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#171717]">Select Service</h3>
            {bookableServices.length === 0 ? (
              <div className="text-center py-10 bg-white border border-[#E5E3DD] rounded-2xl">
                <Scissors className="w-8 h-8 text-[#706E6B]/50 mx-auto mb-2" />
                <p className="text-xs text-[#706E6B] font-semibold">No services are currently available for online booking.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {bookableServices.map((srv) => (
                  <div
                    key={srv.id}
                    onClick={() => handleSelectService(srv)}
                    className={`p-4 bg-white border rounded-2xl flex justify-between items-center transition-all cursor-pointer hover:border-[#2F6B59] hover:scale-[1.005] ${
                      selectedService?.id === srv.id ? 'border-[#2F6B59] ring-1 ring-[#2F6B59]' : 'border-[#E5E3DD]'
                    }`}
                  >
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-[#171717]">{srv.name}</h4>
                      {srv.description && <p className="text-[10px] text-[#706E6B] max-w-sm">{srv.description}</p>}
                      <span className="inline-flex items-center gap-1 text-[10px] text-[#706E6B]">
                        <Clock className="w-3 h-3" /> {srv.duration}
                      </span>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-[#2F6B59]">₹{srv.price}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectService(srv);
                        }}
                        className="px-3.5 py-1.5 bg-[#2F6B59] hover:bg-[#1C4337] text-white rounded-lg text-[10px] font-bold"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 2 - Select Stylist */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={handlePrevStep} className="p-1 hover:bg-[#E5E3DD]/45 rounded-full">
                <ChevronLeft className="w-5 h-5 text-[#171717]" />
              </button>
              <h3 className="text-sm font-bold text-[#171717]">Choose Your Stylist</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Any Available option */}
              <div
                onClick={() => handleSelectStylist({ id: 'any', name: 'Any Available Stylist', role: 'Fastest selection' })}
                className={`p-4 bg-white border rounded-2xl flex items-center gap-3 cursor-pointer hover:border-[#2F6B59] transition-all ${
                  selectedStylist?.id === 'any' ? 'border-[#2F6B59] ring-1 ring-[#2F6B59]' : 'border-[#E5E3DD]'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-[#EFCF63]/20 flex items-center justify-center font-bold text-[#171717] text-sm">
                  ★
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#171717]">Any Available Stylist</h4>
                  <p className="text-[10px] text-[#706E6B]">System auto-assigns floor stylist</p>
                </div>
              </div>

              {/* Service specific stylists */}
              {serviceStylists.map((st) => (
                <div
                  key={st.id}
                  onClick={() => handleSelectStylist(st)}
                  className={`p-4 bg-white border rounded-2xl flex items-center gap-3 cursor-pointer hover:border-[#2F6B59] transition-all ${
                    selectedStylist?.id === st.id ? 'border-[#2F6B59] ring-1 ring-[#2F6B59]' : 'border-[#E5E3DD]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-[#2F6B59]/10 flex items-center justify-center font-bold text-[#2F6B59] text-xs">
                    {getInitials(st.name)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#171717]">{st.name}</h4>
                    <p className="text-[10px] text-[#706E6B]">{st.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 - Select Date & Time */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={handlePrevStep} className="p-1 hover:bg-[#E5E3DD]/45 rounded-full">
                <ChevronLeft className="w-5 h-5 text-[#171717]" />
              </button>
              <h3 className="text-sm font-bold text-[#171717]">Select Date & Time</h3>
            </div>

            <Card className="p-5 bg-white border border-[#E5E3DD] space-y-4 text-xs font-semibold text-[#171717]">
              {/* Date selection */}
              <div className="space-y-1">
                <label className="text-[#706E6B] font-medium block">Choose Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime('');
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#F7F5F1] border border-[#E5E3DD] rounded-xl outline-none"
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="space-y-2 pt-2">
                  <label className="text-[#706E6B] font-medium block">Available Slots</label>
                  {availableTimeSlots.length === 0 ? (
                    <p className="text-[#706E6B] text-[11px] italic">No slots available on this day. Please select another date.</p>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableTimeSlots.map((slot) => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2 border rounded-xl font-bold transition-all text-[10px] ${
                            selectedTime === slot
                              ? 'bg-[#2F6B59] text-white border-[#2F6B59]'
                              : 'bg-white border-[#E5E3DD] text-[#171717] hover:bg-[#F7F5F1]'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {selectedDate && selectedTime && (
              <Button
                onClick={handleNextStep}
                className="w-full h-12 bg-[#2F6B59] hover:bg-[#1C4337] text-white border-none font-bold text-xs rounded-xl"
              >
                Proceed to Details
              </Button>
            )}
          </div>
        )}

        {/* STEP 4 - Customer Details & Booking Summary */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <button onClick={handlePrevStep} className="p-1 hover:bg-[#E5E3DD]/45 rounded-full">
                <ChevronLeft className="w-5 h-5 text-[#171717]" />
              </button>
              <h3 className="text-sm font-bold text-[#171717]">Contact Information & Summary</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Form panel */}
              <div className="md:col-span-7 space-y-4">
                <Card className="p-5 bg-white border border-[#E5E3DD] space-y-4 text-xs font-semibold text-[#171717]">
                  <div className="space-y-1">
                    <label className="text-[#706E6B] font-medium block">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                      }}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 bg-[#F7F5F1] border border-[#E5E3DD] rounded-xl outline-none"
                    />
                    {errors.name && <p className="text-red-500 text-[10px] mt-0.5">{errors.name}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#706E6B] font-medium block">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={clientPhone}
                      onChange={(e) => {
                        setClientPhone(e.target.value);
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                      }}
                      placeholder="e.g. 9824249704"
                      className="w-full px-3.5 py-2.5 bg-[#F7F5F1] border border-[#E5E3DD] rounded-xl outline-none"
                    />
                    {errors.phone && <p className="text-red-500 text-[10px] mt-0.5">{errors.phone}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#706E6B] font-medium block">Email Address</label>
                    <input
                      type="email"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="e.g. rahul@gmail.com"
                      className="w-full px-3.5 py-2.5 bg-[#F7F5F1] border border-[#E5E3DD] rounded-xl outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#706E6B] font-medium block">Appointment Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any requests or scalp considerations..."
                      rows="2"
                      className="w-full px-3.5 py-2.5 bg-[#F7F5F1] border border-[#E5E3DD] rounded-xl outline-none resize-none"
                    />
                  </div>
                </Card>
              </div>

              {/* Summary panel */}
              <div className="md:col-span-5">
                <Card className="p-5 bg-white border border-[#E5E3DD] space-y-4 text-xs font-semibold text-[#171717] flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <h4 className="font-bold border-b border-[#E5E3DD] pb-2 text-[#171717]">Booking Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#706E6B] font-medium">Service:</span>
                        <span>{selectedService?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#706E6B] font-medium">Stylist:</span>
                        <span>{selectedStylist?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#706E6B] font-medium">Date:</span>
                        <span>{selectedDate}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#706E6B] font-medium">Time:</span>
                        <span>{selectedTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#706E6B] font-medium">Duration:</span>
                        <span>{selectedService?.duration}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-[#E5E3DD] pt-2 text-[#171717]">
                        <span>Price:</span>
                        <span className="font-mono">₹{selectedService?.price}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleConfirmBooking}
                    className="w-full h-12 bg-[#2F6B59] hover:bg-[#1C4337] text-white border-none font-bold text-xs rounded-xl mt-4"
                  >
                    Confirm Appointment
                  </Button>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Branding */}
      <footer className="bg-white border-t border-[#E5E3DD] py-3 text-center">
        <PoweredByBizora />
      </footer>
    </div>
  );
}
