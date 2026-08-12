import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  Calendar,
  DollarSign,
  TrendingUp,
  Scissors,
  Users,
} from 'lucide-react';
import { Card } from '../../components/ui/Badge';

export default function SalonReportsPage() {
  const { t, i18n } = useTranslation();
  const isGu = i18n.language?.startsWith('gu');
  const [activeReport, setActiveReport] = useState('revenue');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-green-forest">
          {isGu ? 'એનાલિટિક્સ હબ' : 'Analytics Hub'}
        </p>
        <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-charcoal">
          {isGu ? 'રિપોર્ટ્સ અને ઈનસાઈટ્સ' : 'Reports & Insights'}
        </h1>
        <p className="text-sm text-warm-gray">
          {isGu ? 'સ્ટાઈલિસ્ટ કમિશન, પીક અવર્સ, સેવા વહેંચણી અને ગ્રાહકના આંકડા મોનિટર કરો' : 'Monitor stylist commissions, peak hours, service distributions, and client metrics'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-ivory border border-stone p-1 rounded-xl text-xs font-semibold self-start">
        {[
          { id: 'revenue', label: isGu ? 'આવકનું પૃથક્કરણ' : 'Revenue Analysis', icon: DollarSign },
          { id: 'commission', label: isGu ? 'સ્ટાઈલિસ્ટ કમિશન' : 'Stylist Commissions', icon: Scissors },
          { id: 'retention', label: isGu ? 'ગ્રાહક જાળવણી' : 'Client Retention', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id)}
              className={`px-5 py-2.5 rounded-lg capitalize transition-colors flex items-center gap-1.5 ${
                activeReport === tab.id ? 'bg-green-bottle text-white shadow-subtle' : 'text-charcoal/80 hover:bg-cream'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content based on Active Report */}
      {activeReport === 'revenue' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 border border-stone bg-white space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">{isGu ? 'દૈનિક આવક રિપોર્ટ' : 'Daily Revenue Report'}</h3>
              <p className="text-[11px] text-warm-gray mt-0.5">{isGu ? 'ઓગસ્ટ ૨૦૨૬' : 'Aug 2026'}</p>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { date: isGu ? '૧૦ ઓગસ્ટ' : '10 Aug', total: '₹18,450', appointments: '24' },
                { date: isGu ? '૦૯ ઓગસ્ટ' : '09 Aug', total: '₹14,200', appointments: '18' },
                { date: isGu ? '૦૮ ઓગસ્ટ' : '08 Aug', total: '₹22,100', appointments: '28' },
                { date: isGu ? '૦૭ ઓગસ્ટ' : '07 Aug', total: '₹12,850', appointments: '15' },
              ].map((row, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-stone/50 last:border-0">
                  <span className="font-semibold text-charcoal">{row.date} ({row.appointments} {isGu ? 'બુકિંગ' : 'bookings'})</span>
                  <span className="font-mono font-bold text-green-forest">{row.total}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5 border border-stone bg-white space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">{isGu ? 'સેવા મુજબ આવક' : 'Service-wise Revenue'}</h3>
              <p className="text-[11px] text-warm-gray mt-0.5">{isGu ? 'કુલ હિસ્સો' : 'Lifetime share'}</p>
            </div>
            <div className="space-y-3 text-xs">
              {[
                { service: isGu ? 'હેરકટ (વાળ કટીંગ)' : 'Haircut', share: '₹145,000 (42%)', color: 'bg-green-bottle' },
                { service: isGu ? 'હેર કલર' : 'Hair Color', share: '₹96,000 (28%)', color: 'bg-blue-500' },
                { service: isGu ? 'હેર સ્પા' : 'Hair Spa', share: '₹62,000 (18%)', color: 'bg-yellow-butter' },
                { service: isGu ? 'નેઇલ્સ અને બ્યુટી' : 'Nails & Beauty', share: '₹41,000 (12%)', color: 'bg-purple-500' },
              ].map((row, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span className="text-charcoal">{row.service}</span>
                    <span className="font-mono text-green-forest">{row.share}</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: row.share.match(/\d+%/)[0] }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeReport === 'commission' && (
        <Card className="p-5 border border-stone bg-white space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">{isGu ? 'સ્ટાઈલિસ્ટ શિફ્ટ અને કમિશન ખાતાવહી' : 'Stylist Shift & Commission Ledger'}</h3>
            <p className="text-[11px] text-warm-gray mt-0.5">{isGu ? 'આજના ચુકવણાં' : "Today's payouts"}</p>
          </div>
          <div className="space-y-2 text-xs">
            {[
              { name: 'Riya Sharma', rate: '20%', bookings: 8, gross: '₹6,200', pay: '₹1,240' },
              { name: 'Anjali Shah', rate: '18%', bookings: 5, gross: '₹4,850', pay: '₹873' },
              { name: 'Kavya Rao', rate: '15%', bookings: 4, gross: '₹3,400', pay: '₹510' },
            ].map((row, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-stone/50 last:border-0 items-center">
                <div>
                  <span className="font-bold text-charcoal block">{row.name}</span>
                  <span className="text-[10px] text-warm-gray">{row.bookings} {isGu ? 'બુકિંગ' : 'bookings'} · {isGu ? 'દર:' : 'Rate:'} {row.rate}</span>
                </div>
                <div className="text-right">
                  <span className="text-charcoal block">{isGu ? 'કુલ:' : 'Gross:'} {row.gross}</span>
                  <span className="font-mono font-bold text-green-forest">{isGu ? 'ચુકવણી:' : 'Payout:'} {row.pay}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeReport === 'retention' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 border border-stone bg-white space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">{isGu ? 'જાળવણી અને રૂપાંતર દર' : 'Retention & Conversion Rate'}</h3>
              <p className="text-[11px] text-warm-gray mt-0.5">{isGu ? 'સારાંશ મેટ્રિક્સ' : 'Summary metrics'}</p>
            </div>
            <div className="space-y-4 text-xs font-semibold text-charcoal">
              <div className="flex justify-between">
                <span className="text-warm-gray font-medium">{isGu ? 'ગ્રાહક જાળવણી દર' : 'Customer Retention Rate'}</span>
                <span className="text-green-forest text-sm font-bold">84%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-gray font-medium">{isGu ? 'ઓનલાઇન બુકિંગ રૂપાંતરણ' : 'Online booking Conversion'}</span>
                <span className="text-green-forest text-sm font-bold">72%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-gray font-medium">{isGu ? 'લોયલ્ટી મેમ્બરશિપ વૃદ્ધિ' : 'Loyalty membership growth'}</span>
                <span className="text-green-forest text-sm font-bold">+15% MoM</span>
              </div>
            </div>
          </Card>

          <Card className="p-5 border border-stone bg-white space-y-4">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal">{isGu ? 'પીક ફ્લોર સમય' : 'Peak Floor Hours'}</h3>
              <p className="text-[11px] text-warm-gray mt-0.5">{isGu ? 'કલાક દીઠ બુકિંગ ઘનતા' : 'Booking density by hour'}</p>
            </div>
            <div className="space-y-2 text-xs font-semibold">
              {[
                { range: '09 AM - 11 AM', density: isGu ? 'મધ્યમ' : 'Moderate', color: 'bg-yellow-honey', percent: 45 },
                { range: '11 AM - 02 PM', density: isGu ? 'ઉચ્ચ ઘનતા (પીક)' : 'High Density (Peak)', color: 'bg-terracotta', percent: 90 },
                { range: '02 PM - 05 PM', density: isGu ? 'મધ્યમ' : 'Moderate', color: 'bg-yellow-honey', percent: 55 },
                { range: '05 PM - 08 PM', density: isGu ? 'ઉચ્ચ' : 'High', color: 'bg-green-bottle', percent: 80 },
              ].map((row, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-charcoal">{row.range} ({row.density})</span>
                    <span className="text-warm-gray">{row.percent}% {isGu ? 'વ્યસ્ત' : 'busy'}</span>
                  </div>
                  <div className="w-full h-2 bg-stone rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${row.color}`} style={{ width: `${row.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
