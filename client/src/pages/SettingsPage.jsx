import React, { useState } from 'react';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import { Settings, Building2, CreditCard, Palette, Shield, UserPlus, Save, CheckCircle, Check } from 'lucide-react';

export default function SettingsPage() {
  const { company, updateCompany, showToast } = useBusiness();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('company');

  const [companyForm, setCompanyForm] = useState(company);
  const [bankForm, setBankForm] = useState(company.bankDetails || {
    bankName: 'HDFC Bank',
    accountName: 'Amexora Technologies Pvt Ltd',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0001234',
    branch: 'Koramangala',
    upiId: 'amexora@hdfcbank'
  });

  const themes = [
    { id: 'modern', name: 'Modern Blue', desc: 'Sleek rounded header with indigo accents', color: '#2563EB', bgClass: 'from-blue-600 to-indigo-600' },
    { id: 'classic', name: 'Classic Slate', desc: 'Traditional corporate layout with slate borders', color: '#0F172A', bgClass: 'from-slate-900 to-slate-800' },
    { id: 'minimal', name: 'Minimal Mono', desc: 'Ultra-clean monochrome typography & lines', color: '#334155', bgClass: 'from-slate-700 to-slate-900' },
    { id: 'corporate', name: 'Corporate Teal', desc: 'Vibrant teal header with accent badges', color: '#14B8A6', bgClass: 'from-teal-600 to-emerald-600' }
  ];

  const currentThemeId = company.invoiceTheme || 'modern';

  const handleSelectTheme = (themeId) => {
    updateCompany({ invoiceTheme: themeId });
    showToast(`Invoice Printable Theme changed to "${themes.find(t => t.id === themeId).name}"!`);
  };

  const handleSaveCompany = (e) => {
    e.preventDefault();
    updateCompany({ ...companyForm, bankDetails: bankForm });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-600" /> Company Settings & Team Permissions
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">Configure company GST details, bank payouts, invoice themes & RBAC permissions.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { id: 'company', label: 'Company & GST Profile', icon: Building2 },
          { id: 'bank', label: 'Bank & UPI Payouts', icon: CreditCard },
          { id: 'themes', label: 'Invoice Themes', icon: Palette },
          { id: 'rbac', label: 'Team Invites & Roles', icon: Shield }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Form Container */}
      <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-card">
        
        {/* Tab 1: Company Profile */}
        {activeTab === 'company' && (
          <form onSubmit={handleSaveCompany} className="space-y-4 max-w-3xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Business Entity Profile</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Company Registered Name</label>
                <input type="text" value={companyForm.name} onChange={(e) => setCompanyForm({...companyForm, name: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Trade Name</label>
                <input type="text" value={companyForm.tradeName} onChange={(e) => setCompanyForm({...companyForm, tradeName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">GSTIN Number</label>
                <input type="text" value={companyForm.gstin} onChange={(e) => setCompanyForm({...companyForm, gstin: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-mono uppercase font-bold text-blue-600" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">PAN Number</label>
                <input type="text" value={companyForm.pan} onChange={(e) => setCompanyForm({...companyForm, pan: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-mono uppercase font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Billing Email</label>
                <input type="email" value={companyForm.email} onChange={(e) => setCompanyForm({...companyForm, email: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Phone Number</label>
                <input type="text" value={companyForm.phone} onChange={(e) => setCompanyForm({...companyForm, phone: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Office Address</label>
              <textarea rows={2} value={companyForm.address} onChange={(e) => setCompanyForm({...companyForm, address: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
            </div>

            <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
              <Save className="w-4 h-4" /> Save Company Details
            </button>
          </form>
        )}

        {/* Tab 2: Bank & UPI */}
        {activeTab === 'bank' && (
          <form onSubmit={handleSaveCompany} className="space-y-4 max-w-3xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Bank Payout & UPI QR Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Bank Name</label>
                <input type="text" value={bankForm.bankName} onChange={(e) => setBankForm({...bankForm, bankName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Account Holder Name</label>
                <input type="text" value={bankForm.accountName} onChange={(e) => setBankForm({...bankForm, accountName: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-bold" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Account Number</label>
                <input type="text" value={bankForm.accountNumber} onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-mono font-bold" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">IFSC Code</label>
                <input type="text" value={bankForm.ifscCode} onChange={(e) => setBankForm({...bankForm, ifscCode: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-mono uppercase" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">UPI VPA ID (For Instant Invoice QR)</label>
              <input type="text" value={bankForm.upiId} onChange={(e) => setBankForm({...bankForm, upiId: e.target.value})} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl text-xs font-mono font-bold text-teal-600" />
            </div>

            <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
              <Save className="w-4 h-4" /> Save Bank Payout Details
            </button>
          </form>
        )}

        {/* Tab 3: Interactive Themes */}
        {activeTab === 'themes' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Select Invoice Printable Theme</h3>
              <p className="text-xs text-slate-400 mt-1">Choose how your GST PDF invoices and printouts are styled.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {themes.map((theme) => {
                const isSelected = currentThemeId === theme.id;

                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelectTheme(theme.id)}
                    className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-4 relative ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/40 shadow-xl scale-[1.02]'
                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 bg-white dark:bg-slate-900'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute -top-3 right-4 px-2.5 py-0.5 bg-blue-600 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Check className="w-3 h-3" /> Active Theme
                      </span>
                    )}

                    <div className="space-y-3">
                      {/* Theme Palette Bar Preview */}
                      <div className={`h-16 rounded-2xl bg-gradient-to-r ${theme.bgClass} p-3 flex items-center justify-between text-white shadow-md`}>
                        <div className="space-y-1">
                          <p className="text-[11px] font-bold">INV-2026-001</p>
                          <p className="text-[9px] opacity-80">TAX INVOICE</p>
                        </div>
                        <Palette className="w-6 h-6 opacity-80" />
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {theme.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {theme.desc}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white'
                      }`}
                    >
                      {isSelected ? 'Currently Selected' : 'Apply Theme'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: RBAC Roles */}
        {activeTab === 'rbac' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Team Members & Role-Based Permissions</h3>
              <button className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
                <UserPlus className="w-4 h-4" /> Invite Team Member
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Krish Patel (You)</p>
                  <p className="text-slate-400">kpatel3360@gmail.com</p>
                </div>
                <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-600 font-bold rounded-lg uppercase">
                  Role: Owner
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Ananya Sen</p>
                  <p className="text-slate-400">ananya@amexora.in</p>
                </div>
                <span className="px-2.5 py-1 bg-teal-100 dark:bg-teal-950 text-teal-600 font-bold rounded-lg uppercase">
                  Role: Accountant
                </span>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
