import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useBusiness } from '../context/BusinessContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Tabs, Card } from '../components/ui/Badge';
import {
  Building2,
  User,
  Sliders,
  Palette,
  Globe,
  Copy,
  ExternalLink,
  QrCode,
  Share2,
} from 'lucide-react';

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const isGu = i18n.language?.startsWith('gu');
  const { company, updateCompany, showToast } = useBusiness();
  const { user, updateProfile } = useAuth();
  const { bgStyle } = useTheme();
  const [activeTab, setActiveTab] = useState('organization');
  const [saving, setSaving] = useState(false);

  const [bookingEnabled, setBookingEnabled] = useState(() => {
    return localStorage.getItem('salon_booking_enabled') !== 'false';
  });
  const bookingUrl = `${window.location.origin}/book`;

  const copyBookingLink = () => {
    navigator.clipboard.writeText(bookingUrl);
    showToast(isGu ? 'બુકિંગ લિંક ક્લિપબોર્ડ પર કોપી થઈ ગઈ!' : 'Booking link copied to clipboard!');
  };

  const [companyForm, setCompanyForm] = useState(company);
  const [bankForm, setBankForm] = useState(company?.bankDetails || {});
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });
  const [prefs, setPrefs] = useState({
    timezone: user?.preferences?.timezone || 'Asia/Kolkata',
    language: user?.preferences?.language || 'en',
    brandColor: company?.branding?.brandColor || '#171717',
  });

  useEffect(() => {
    setCompanyForm(company);
    setBankForm(company?.bankDetails || {});
  }, [company]);

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      phone: user?.phone || '',
      avatar: user?.avatar || '',
    });
    setPrefs((p) => ({
      ...p,
      timezone: user?.preferences?.timezone || 'Asia/Kolkata',
      language: user?.preferences?.language || 'en',
    }));
  }, [user]);

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      showToast('Invalid file format. Please upload PNG, JPG, JPEG, or SVG.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setCompanyForm(prev => ({
        ...prev,
        [field]: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const saveOrg = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCompany({
        ...companyForm,
        bankDetails: bankForm,
        branding: { ...(companyForm.branding || {}), brandColor: prefs.brandColor },
      });
    } finally {
      setSaving(false);
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profileForm);
      showToast(isGu ? 'પ્રોફાઇલ અપડેટ થઈ ગઈ' : 'Profile updated');
    } catch (err) {
      showToast(err.message || 'Failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const savePrefs = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        preferences: {
          theme: 'light',
          timezone: prefs.timezone,
          language: prefs.language,
          bgStyle,
        },
      });
      await updateCompany({
        branding: { brandColor: prefs.brandColor, invoiceTheme: companyForm.invoiceTheme || 'modern' },
      });
      showToast(isGu ? 'પસંદગીઓ સાચવવામાં આવી' : 'Preferences saved');
    } catch (err) {
      showToast(err.message || 'Failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const themes = [
    { id: 'modern', name: 'Modern' },
    { id: 'classic', name: 'Classic' },
    { id: 'minimal', name: 'Minimal Mono' },
    { id: 'corporate', name: 'Corporate' },
    { id: 'tally', name: 'Professional Tally GST' },
    { id: 'gst_standard', name: 'Standard GST Bill' }
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isGu ? 'સેટિંગ્સ' : 'Settings'}
        description={isGu ? 'સંસ્થા, પ્રોફાઇલ અને બિઝનેસ પસંદગીઓ.' : 'Organization, profile, and business preferences.'}
      />

      <Tabs
        tabs={[
          { id: 'organization', label: isGu ? 'સંસ્થા (ઓર્ગેનાઇઝેશન)' : 'Organization' },
          { id: 'profile', label: isGu ? 'પ્રોફાઇલ' : 'Profile' },
          { id: 'preferences', label: isGu ? 'પસંદગીઓ' : 'Preferences' },
          { id: 'themes', label: isGu ? 'ઇનવોઇસ થીમ' : 'Invoice theme' },
          ...(company?.businessType === 'salon' ? [{ id: 'booking', label: isGu ? 'ઓનલાઇન બુકિંગ' : 'Online Booking' }] : []),
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      <Card className="p-6 sm:p-8">
        {activeTab === 'organization' && (
          <form onSubmit={saveOrg} className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-ink-muted" />
              <h3 className="text-sm font-semibold text-ink">Business profile</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Registered name" value={companyForm?.name || ''} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} />
              <Input label="Trade name" value={companyForm?.tradeName || ''} onChange={(e) => setCompanyForm({ ...companyForm, tradeName: e.target.value })} />
              <Input label="GSTIN" value={companyForm?.gstin || ''} onChange={(e) => setCompanyForm({ ...companyForm, gstin: e.target.value })} />
              <Input label="PAN" value={companyForm?.pan || ''} onChange={(e) => setCompanyForm({ ...companyForm, pan: e.target.value })} />
              <Input label="Email" value={companyForm?.email || ''} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} />
              <Input label="Phone" value={companyForm?.phone || ''} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} />
            </div>
            <Input label="Address" value={companyForm?.address || ''} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="City" value={companyForm?.city || ''} onChange={(e) => setCompanyForm({ ...companyForm, city: e.target.value })} />
              <Input label="State" value={companyForm?.state || ''} onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value })} />
              <Input label="PIN" value={companyForm?.pincode || ''} onChange={(e) => setCompanyForm({ ...companyForm, pincode: e.target.value })} />
            </div>
            <div className="pt-4 border-t border-line">
              <h4 className="text-sm font-semibold text-ink mb-3">Bank & UPI</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Bank name" value={bankForm.bankName || ''} onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })} />
                <Input label="Account name" value={bankForm.accountName || ''} onChange={(e) => setBankForm({ ...bankForm, accountName: e.target.value })} />
                <Input label="Account number" value={bankForm.accountNumber || ''} onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })} />
                <Input label="IFSC" value={bankForm.ifscCode || ''} onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value })} />
                <Input label="Branch" value={bankForm.branch || ''} onChange={(e) => setBankForm({ ...bankForm, branch: e.target.value })} />
                <Input label="UPI ID" value={bankForm.upiId || ''} onChange={(e) => setBankForm({ ...bankForm, upiId: e.target.value })} />
              </div>
            </div>
            <div className="pt-4 border-t border-line">
              <h4 className="text-sm font-semibold text-ink mb-3 font-semibold text-ink">Logo, Signature & Stamp</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-ink-muted">Company Logo</label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                    onChange={(e) => handleFileChange(e, 'logoUrl')}
                    className="w-full text-xs"
                  />
                  {companyForm?.logoUrl && (
                    <div className="mt-2 p-2 border border-line rounded-lg bg-canvas flex items-center justify-center">
                      <img src={companyForm.logoUrl} alt="Logo Preview" className="max-h-20 max-w-full object-contain" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-ink-muted">Digital Signature</label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                    onChange={(e) => handleFileChange(e, 'digitalSignatureUrl')}
                    className="w-full text-xs"
                  />
                  {companyForm?.digitalSignatureUrl && (
                    <div className="mt-2 p-2 border border-line rounded-lg bg-canvas flex items-center justify-center">
                      <img src={companyForm.digitalSignatureUrl} alt="Signature Preview" className="max-h-20 max-w-full object-contain" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-ink-muted">Company Stamp</label>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                    onChange={(e) => handleFileChange(e, 'stampUrl')}
                    className="w-full text-xs"
                  />
                  {companyForm?.stampUrl && (
                    <div className="mt-2 p-2 border border-line rounded-lg bg-canvas flex items-center justify-center">
                      <img src={companyForm.stampUrl} alt="Stamp Preview" className="max-h-20 max-w-full object-contain" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit" loading={saving}>Save organization</Button>
              <Link to="/app/team" className="inline-flex items-center px-4 py-2 text-sm rounded-xl border border-line hover:bg-canvas">Manage team</Link>
              <Link to="/app/activity" className="inline-flex items-center px-4 py-2 text-sm rounded-xl border border-line hover:bg-canvas">Activity log</Link>
            </div>
          </form>
        )}

        {activeTab === 'profile' && (
          <form onSubmit={saveProfile} className="space-y-4 max-w-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-ink-muted" />
              <h3 className="text-sm font-semibold text-ink">Your profile</h3>
            </div>
            <Input label="Full name" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
            <Input label="Phone" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
            <Input label="Avatar URL" value={profileForm.avatar} onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })} />
            <p className="text-xs text-ink-muted">Signed in as {user?.email}</p>
            <Button type="submit" loading={saving}>Save profile</Button>
          </form>
        )}

        {activeTab === 'preferences' && (
          <form onSubmit={savePrefs} className="space-y-4 max-w-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sliders className="w-4 h-4 text-ink-muted" />
              <h3 className="text-sm font-semibold text-ink">Preferences</h3>
            </div>
            <Select label="Timezone" value={prefs.timezone} onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York</option>
            </Select>
            <Select label="Language" value={prefs.language} onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="gu">Gujarati</option>
            </Select>
            <Input label="Brand accent color" type="color" value={prefs.brandColor} onChange={(e) => setPrefs({ ...prefs, brandColor: e.target.value })} className="h-11 p-1" />
            <Button type="submit" loading={saving}>Save preferences</Button>
          </form>
        )}

        {activeTab === 'themes' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Palette className="w-4 h-4 text-ink-muted" />
              <h3 className="text-sm font-semibold text-ink">Invoice printable theme</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={async () => {
                    await updateCompany({ invoiceTheme: t.id });
                    showToast(`Invoice theme set to ${t.name}`);
                  }}
                  className={`text-left p-4 rounded-2xl border transition ${
                    (company?.invoiceTheme || 'modern') === t.id
                      ? 'border-ink bg-canvas'
                      : 'border-line hover:border-ink/30'
                  }`}
                >
                  <p className="text-sm font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-ink-muted mt-1">Applies to PDF / print invoices</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'booking' && (
          <div className="space-y-6 max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-ink-muted" />
              <h3 className="text-sm font-semibold text-ink">Online Booking Portal</h3>
            </div>
            
            <div className="p-4 bg-cream/30 border border-stone rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-charcoal">Online Booking Status</h4>
                  <p className="text-[10px] text-warm-gray">Enable or disable public appointment scheduling</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookingEnabled}
                    onChange={(e) => {
                      setBookingEnabled(e.target.checked);
                      localStorage.setItem('salon_booking_enabled', e.target.checked ? 'true' : 'false');
                      showToast('Online booking status updated!');
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-bottle" />
                </label>
              </div>

              {bookingEnabled && (
                <div className="space-y-3 pt-3 border-t border-stone/50">
                  <div className="space-y-1.5 text-xs">
                    <label className="font-semibold text-charcoal block">Public Booking URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={bookingUrl}
                        className="flex-1 px-3.5 py-2.5 bg-ivory/55 border border-stone rounded-xl outline-none text-[11px] font-mono text-warm-gray"
                      />
                      <button
                        type="button"
                        onClick={copyBookingLink}
                        className="px-3.5 bg-ivory hover:bg-cream border border-stone rounded-xl text-charcoal font-bold flex items-center justify-center gap-1.5"
                        title="Copy Link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a
                        href="/book"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 bg-[#2F6B59] hover:bg-[#1C4337] text-white rounded-xl font-bold flex items-center justify-center"
                        title="Open Booking Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-3">
                    <div className="p-3 bg-white border border-stone rounded-2xl shadow-subtle shrink-0">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(bookingUrl)}`}
                        alt="Booking QR Code"
                        className="w-[120px] h-[120px]"
                      />
                    </div>
                    <div className="text-xs space-y-2">
                      <h5 className="font-bold text-charcoal">Scan QR Code</h5>
                      <p className="text-[10px] text-warm-gray leading-relaxed">
                        Download or print this QR Code and place it at your salon counter or marketing brochures to let clients book instantly from their phones.
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingUrl)}`, '_blank');
                          }}
                          className="px-3 py-1.5 bg-ivory hover:bg-cream border border-stone rounded-lg font-bold text-[10px] flex items-center gap-1"
                        >
                          <QrCode className="w-3.5 h-3.5" /> View Enlarged
                        </button>
                        <button
                          type="button"
                          onClick={copyBookingLink}
                          className="px-3 py-1.5 bg-ivory hover:bg-cream border border-stone rounded-lg font-bold text-[10px] flex items-center gap-1"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Share URL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
