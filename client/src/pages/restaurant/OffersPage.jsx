import React, { useState } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { Tag, Plus, CheckCircle, Percent, Sparkles, Trash2 } from 'lucide-react';

export default function OffersPage() {
  const { offers, showToast } = useBusiness();
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState(10);
  const [minOrderAmount, setMinOrderAmount] = useState(500);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone/40 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-charcoal">Offers & Promotional Discounts</h1>
          <p className="text-sm text-warm-gray mt-0.5">
            Configure coupons, percentage discounts, flat discounts, and minimum cart rules.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 bg-green-bottle text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-bottle/90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Create Coupon Code
        </button>
      </div>

      {/* Offers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((off) => (
          <div
            key={off.id}
            className="bg-white rounded-2xl border border-stone/40 p-5 space-y-3 shadow-sm relative overflow-hidden"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-900 flex items-center justify-center font-bold">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-charcoal tracking-wider text-base uppercase">{off.code}</span>
                  <span className="block text-[11px] text-warm-gray">{off.title}</span>
                </div>
              </div>
              <span className="bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="pt-2 border-t border-stone/30 flex justify-between items-center text-xs font-semibold text-charcoal">
              <div>
                Value:{' '}
                <span className="text-green-bottle font-bold text-sm">
                  {off.type === 'percentage' ? `${off.value}% OFF` : `₹${off.value} OFF`}
                </span>
              </div>
              <div className="text-warm-gray">Min Order: ₹{off.minOrderAmount || 0}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone space-y-4">
            <h2 className="text-xl font-bold text-charcoal">Create Discount Code</h2>

            <div>
              <label className="text-xs font-semibold text-charcoal">Coupon Code (Uppercase)</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. OLIVE20"
                className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm uppercase"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal">Title / Description</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 20% OFF Weekend Special"
                className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-charcoal">Discount Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-charcoal">Discount Value</label>
                <input
                  type="number"
                  required
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-charcoal">Minimum Order Amount (₹)</label>
              <input
                type="number"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                className="w-full mt-1 p-2.5 rounded-xl border border-stone text-sm"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 bg-stone-100 text-charcoal font-semibold text-sm rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast(`Offer ${code} created!`);
                  setShowModal(false);
                }}
                className="flex-1 py-2.5 bg-green-bottle text-white font-bold text-sm rounded-xl hover:bg-green-bottle/90"
              >
                Save Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
