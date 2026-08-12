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
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function SalonCalendarPage() {
  const { t, i18n } = useTranslation();
  const isGu = i18n.language?.startsWith('gu');
  const [view, setView] = useState('week'); // 'day', 'week', 'month'
  const [selectedDate, setSelectedDate] = useState(isGu ? '૧૦ ઓગસ્ટ ૨૦૨૬' : '10 Aug 2026');

  // Sample appointments
  const appointments = [
    { id: 1, time: '10:00 AM', client: 'Priya Patel', service: 'Haircut + Blow Dry', stylist: 'Riya', color: 'bg-green-100 border-green-300 text-green-800' },
    { id: 2, time: '11:30 AM', client: 'Meera Shah', service: 'Hair Color', stylist: 'Anjali', color: 'bg-blue-100 border-blue-300 text-blue-800' },
    { id: 3, time: '02:15 PM', client: 'Nisha Mehta', service: 'Keratin Treatment', stylist: 'Riya', color: 'bg-green-100 border-green-300 text-green-800' },
    { id: 4, time: '04:00 PM', client: 'Bridal Trial', service: 'Bridal Styling', stylist: 'Senior Stylist', color: 'bg-purple-100 border-purple-300 text-purple-800' },
  ];

  const hours = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'];

  return (
    <div className="space-y-6 relative min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-green-forest">
            {isGu ? 'ફ્લોર કંટ્રોલ' : 'Floor Control'}
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-charcoal">
            {isGu ? 'કેલેન્ડર' : 'Calendar'}
          </h1>
          <p className="text-sm text-warm-gray">
            {isGu ? 'રીયલ-ટાઇમ સ્ટાઈલિસ્ટ ખુરશીઓ, વોક-ઈન અને બુકિંગ હિસ્ટ્રી સંચાલિત કરો' : 'Manage real-time stylist chairs, walk-ins, and reservations'}
          </p>
        </div>
        
        {/* Toggle views */}
        <div className="flex bg-ivory border border-stone p-1 rounded-xl text-xs font-semibold self-start sm:self-center">
          {[
            { id: 'day', label: isGu ? 'દિવસ' : 'day' },
            { id: 'week', label: isGu ? 'સપ્તાહ' : 'week' },
            { id: 'month', label: isGu ? 'મહિનો' : 'month' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                view === v.id ? 'bg-green-bottle text-white shadow-subtle' : 'text-charcoal/80 hover:bg-cream'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="flex items-center justify-between p-4 bg-white border border-stone rounded-2xl shadow-subtle">
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-cream border border-stone">
            <ChevronLeft className="w-4 h-4 text-charcoal" />
          </button>
          <span className="text-sm font-bold text-charcoal">{selectedDate}</span>
          <button className="p-2 rounded-lg hover:bg-cream border border-stone">
            <ChevronRight className="w-4 h-4 text-charcoal" />
          </button>
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-2 bg-ivory border border-stone text-xs text-charcoal rounded-xl hover:bg-cream transition-colors">
          <CalendarIcon className="w-4 h-4 text-green-bottle" /> {isGu ? 'આજે' : 'Today'}
        </button>
      </div>

      {/* Time-grid Calendar Layout */}
      <div className="bg-white border border-stone rounded-[20px] shadow-subtle overflow-hidden">
        <div className="grid grid-cols-6 border-b border-stone bg-ivory/50 p-4 text-xs font-semibold text-charcoal text-center">
          <div className="text-left">{isGu ? 'સમય' : 'Time'}</div>
          <div>{isGu ? 'સોમ ૧૦' : 'Mon 10'}</div>
          <div>{isGu ? 'મંગળ ૧૧' : 'Tue 11'}</div>
          <div>{isGu ? 'બુધ ૧૨' : 'Wed 12'}</div>
          <div>{isGu ? 'ગુરુ ૧૩' : 'Thu 13'}</div>
          <div>{isGu ? 'શુક્ર ૧૪' : 'Fri 14'}</div>
        </div>

        <div className="divide-y divide-stone/60">
          {hours.map((hour) => {
            const appt = appointments.find((a) => a.time === hour);
            return (
              <div key={hour} className="grid grid-cols-6 p-4 items-center min-h-[72px] text-xs">
                <div className="font-mono text-warm-gray font-semibold">{hour}</div>
                
                {/* Monday slot */}
                <div className="col-span-5 relative h-full">
                  {appt ? (
                    <div
                      className={`p-3 rounded-xl border flex flex-col justify-between h-full shadow-sm hover:scale-[1.01] transition-transform cursor-pointer ${appt.color}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold">{appt.client}</span>
                        <span className="text-[10px] uppercase font-bold bg-white/40 px-1.5 py-0.2 rounded">
                          {appt.stylist}
                        </span>
                      </div>
                      <p className="text-[10px] mt-1 font-medium">{appt.service}</p>
                    </div>
                  ) : (
                    <div className="border border-dashed border-stone/60 rounded-xl h-full flex items-center justify-center text-text-disabled hover:bg-cream/40 transition-colors cursor-pointer text-[10px] font-semibold py-2">
                      + Empty slot (Available)
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Add Appointment Button */}
      <button className="fixed bottom-6 right-20 z-40 w-12 h-12 rounded-full bg-yellow-butter hover:bg-yellow-honey text-charcoal shadow-elev flex items-center justify-center transition-all duration-[220ms] hover:scale-105 active:scale-95">
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
