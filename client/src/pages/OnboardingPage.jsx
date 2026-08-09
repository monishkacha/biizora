import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Sparkles, ArrowRight, ArrowLeft, Building2, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = ['Business', 'Tax & Address', 'Branding'];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { activeBusinessId, refreshBusiness } = useAuth();
  const { company, showToast, reload } = useBusiness();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: company?.name || '',
    tradeName: company?.tradeName || '',
    industry: company?.industry || 'Services',
    gstin: company?.gstin || '',
    pan: company?.pan || '',
    address: company?.address || '',
    city: company?.city || '',
    state: company?.state || '',
    pincode: company?.pincode || '',
    country: company?.country || 'India',
    currency: company?.currency || 'INR',
    defaultTaxRate: company?.defaultTaxRate ?? 18,
    invoicePrefix: company?.invoicePrefix || 'INV-',
    logoUrl: company?.logoUrl || '',
    phone: company?.phone || '',
    email: company?.email || '',
  });

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const finish = async () => {
    if (!activeBusinessId) return;
    setLoading(true);
    try {
      await businessApi.onboarding(activeBusinessId, form);
      await refreshBusiness();
      await reload();
      showToast('Welcome to Biizora! Your business is ready.');
      navigate('/app');
    } catch (err) {
      showToast(err.message || 'Onboarding failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white border border-line rounded-[20px] shadow-card overflow-hidden"
      >
        <div className="px-6 py-5 border-b border-line flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ink text-white flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold text-ink">Welcome to Biizora</p>
            <p className="text-xs text-ink-muted">Set up your business in under a minute</p>
          </div>
        </div>

        <div className="px-6 pt-5 flex gap-2">
          {steps.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1 rounded-full ${i <= step ? 'bg-ink' : 'bg-line'}`} />
              <p className={`mt-2 text-[11px] font-medium ${i <= step ? 'text-ink' : 'text-ink-faint'}`}>{s}</p>
            </div>
          ))}
        </div>

        <div className="p-6 space-y-4">
          {step === 0 && (
            <>
              <Input label="Business name" value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="ABC Traders" />
              <Input label="Trade name" value={form.tradeName} onChange={(e) => set('tradeName', e.target.value)} />
              <Select label="Industry" value={form.industry} onChange={(e) => set('industry', e.target.value)}>
                {['Services', 'Retail', 'Wholesale', 'Manufacturing', 'Agency', 'Freelance', 'Restaurant', 'Other'].map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </Select>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Email" value={form.email} onChange={(e) => set('email', e.target.value)} />
                <Input label="Phone" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Input label="GSTIN" value={form.gstin} onChange={(e) => set('gstin', e.target.value)} placeholder="29ABCDE1234F1Z5" />
              <Input label="PAN" value={form.pan} onChange={(e) => set('pan', e.target.value)} />
              <Textarea label="Address" value={form.address} onChange={(e) => set('address', e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="City" value={form.city} onChange={(e) => set('city', e.target.value)} />
                <Input label="State" value={form.state} onChange={(e) => set('state', e.target.value)} />
                <Input label="PIN code" value={form.pincode} onChange={(e) => set('pincode', e.target.value)} />
                <Select label="Currency" value={form.currency} onChange={(e) => set('currency', e.target.value)}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </Select>
              </div>
              <Input
                label="Default tax rate (%)"
                type="number"
                value={form.defaultTaxRate}
                onChange={(e) => set('defaultTaxRate', Number(e.target.value))}
              />
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2 text-left">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Company Logo</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
                    if (!validTypes.includes(file.type)) {
                      showToast('Invalid file format. Please upload PNG, JPG, JPEG, or SVG.', 'error');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      set('logoUrl', reader.result);
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="w-full text-xs"
                />
                {form.logoUrl && (
                  <div className="mt-2 p-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center">
                    <img src={form.logoUrl} alt="Logo Preview" className="max-h-20 max-w-full object-contain" />
                  </div>
                )}
              </div>
              <Input label="Invoice prefix" value={form.invoicePrefix} onChange={(e) => set('invoicePrefix', e.target.value)} />
              <div className="rounded-2xl border border-line bg-canvas p-4 flex items-start gap-3">
                <Building2 className="w-5 h-5 text-ink mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-ink">{form.name || 'Your business'}</p>
                  <p className="text-xs text-ink-muted mt-1">{form.industry} · {form.city || 'India'} · GST {form.gstin || '—'}</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-line flex items-center justify-between bg-canvas/40">
          <Button variant="ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !form.name}>
              Continue <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button loading={loading} onClick={finish}>
              <Check className="w-4 h-4" /> Finish setup
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
