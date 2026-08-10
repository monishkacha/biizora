import React, { useState } from 'react';
import { restaurantApi } from '../../api/client';
import { PoweredByBizora } from '../../components/ui/PoweredByBizora';
import { Calendar, Clock, Users, CheckCircle2, Sparkles, Utensils, Phone, Mail } from 'lucide-react';

export default function PublicBookingPage() {
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('19:30');
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');

  const [loading, setLoading] = useState(false);
  const [confirmedReservation, setConfirmedReservation] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await restaurantApi.publicCreateReservation({
        customerName,
        phone,
        email,
        date,
        time,
        guests: Number(guests),
        specialRequests,
      });

      if (res.reservation) {
        setConfirmedReservation(res.reservation);
      }
    } catch (err) {
      setError(err.message || 'Table reservation failed. Please try another time slot.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream/50 flex flex-col justify-between p-4 sm:p-6 font-sans">
      <div className="max-w-md mx-auto w-full space-y-6">
        {/* Restaurant Branding Header */}
        <div className="text-center space-y-2 pt-4">
          <div className="w-16 h-16 rounded-3xl bg-green-bottle text-white flex items-center justify-center mx-auto shadow-md">
            <Utensils className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-charcoal tracking-tight">The Olive Table</h1>
          <p className="text-xs text-warm-gray font-medium">Fine Dining & Culinary Excellence · Reserve Your Table</p>
        </div>

        {confirmedReservation ? (
          /* Confirmation State */
          <div className="bg-white rounded-3xl p-6 border border-stone shadow-xl space-y-5 text-center animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-charcoal">Reservation Confirmed!</h2>
              <p className="text-xs text-warm-gray mt-1">We look forward to welcoming you to The Olive Table.</p>
            </div>

            <div className="bg-cream/60 p-4 rounded-2xl border border-stone/50 space-y-2 text-left text-xs font-semibold text-charcoal">
              <div className="flex justify-between border-b border-stone/30 pb-1.5">
                <span className="text-warm-gray">Guest Name</span>
                <span>{confirmedReservation.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-stone/30 pb-1.5">
                <span className="text-warm-gray">Date & Time</span>
                <span>{confirmedReservation.date} at {confirmedReservation.time}</span>
              </div>
              <div className="flex justify-between border-b border-stone/30 pb-1.5">
                <span className="text-warm-gray">Party Size</span>
                <span>{confirmedReservation.guests} Guests</span>
              </div>
              {confirmedReservation.tableName && (
                <div className="flex justify-between">
                  <span className="text-warm-gray">Assigned Table</span>
                  <span className="text-green-bottle font-bold">{confirmedReservation.tableName}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setConfirmedReservation(null)}
              className="w-full py-3 bg-green-bottle text-white font-bold text-sm rounded-xl hover:bg-green-bottle/90"
            >
              Book Another Table
            </button>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-stone shadow-xl space-y-4">
            <h2 className="text-lg font-extrabold text-charcoal border-b border-stone/40 pb-3">
              Table Reservation Form
            </h2>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-charcoal">Your Full Name *</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full mt-1 p-3 rounded-xl border border-stone text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-charcoal">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98200..."
                  className="w-full mt-1 p-3 rounded-xl border border-stone text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Number of Guests *</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl border border-stone text-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
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
                  className="w-full mt-1 p-3 rounded-xl border border-stone text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Time *</label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full mt-1 p-3 rounded-xl border border-stone text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal">Special Requests (Optional)</label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g. Birthday setup, Quiet corner, High chair..."
                className="w-full mt-1 p-3 rounded-xl border border-stone text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-green-bottle text-white font-bold text-sm rounded-xl hover:bg-green-bottle/90 transition-all shadow-md disabled:opacity-50"
            >
              {loading ? 'Confirming Availability...' : 'Confirm Table Reservation'}
            </button>
          </form>
        )}
      </div>

      <div className="pt-8 pb-4 text-center">
        <PoweredByBizora className="justify-center" />
      </div>
    </div>
  );
}
