import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import {
  Settings,
  Store,
  Printer,
  Sliders,
  CheckCircle2,
  Save,
  MessageSquare,
} from 'lucide-react';

export default function StationerySettingsPage() {
  const { company, stationerySettings, updateStationerySettings, updateCompany, showToast } = useBusiness();

  // Profile State
  const [shopName, setShopName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [gstin, setGstin] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [invoiceFooter, setInvoiceFooter] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Toggles State
  const [thermalInvoice, setThermalInvoice] = useState(true);
  const [defaultGstMode, setDefaultGstMode] = useState('inclusive');
  const [enableBarcodeScanning, setEnableBarcodeScanning] = useState(true);
  const [enableStockWarning, setEnableStockWarning] = useState(true);
  const [enableWhatsAppSharing, setEnableWhatsAppSharing] = useState(true);

  useEffect(() => {
    if (company) {
      setShopName(company.name || '');
      setTradeName(company.tradeName || '');
      setGstin(company.gstin || company.GSTNumber || '');
      setPhone(company.phone || '');
      setAddress(typeof company.address === 'string' ? company.address : company.address?.street || '');
      setLogoUrl(company.logo || company.branding?.logo || '');
    }
    if (stationerySettings) {
      setThermalInvoice(stationerySettings.thermalInvoice ?? true);
      setDefaultGstMode(stationerySettings.defaultGstMode || 'inclusive');
      setEnableBarcodeScanning(stationerySettings.enableBarcodeScanning ?? true);
      setEnableStockWarning(stationerySettings.enableStockWarning ?? true);
      setEnableWhatsAppSharing(stationerySettings.enableWhatsAppSharing ?? true);
      setInvoiceFooter(stationerySettings.invoiceFooter || 'Thank you for shopping with us!');
    }
  }, [company, stationerySettings]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await updateStationerySettings({
        settings: {
          thermalInvoice,
          defaultGstMode,
          enableBarcodeScanning,
          enableStockWarning,
          enableWhatsAppSharing,
          invoiceFooter,
        },
        business: {
          name: shopName,
          tradeName,
          gstin,
          phone,
          address: { street: address },
          logo: logoUrl,
          invoiceFooter,
        },
      });
      await updateCompany({
        name: shopName,
        phone,
        gstin,
      });
    } catch (err) {
      showToast(err.message || 'Failed to update settings', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-[20px] border border-stone shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-bottle text-white flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-charcoal">Stationery Shop Settings</h1>
            <p className="text-xs text-warm-gray">Configure shop profile, GSTIN, invoice footer & POS billing toggles</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="bz-btn-primary px-5 py-2.5 text-xs flex items-center gap-1.5 shadow-subtle"
        >
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Shop Profile Settings (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-stone rounded-[20px] shadow-subtle p-6 space-y-4">
          <h2 className="text-sm font-bold text-charcoal flex items-center gap-2 border-b border-stone pb-3">
            <Store className="w-4 h-4 text-green-bottle" /> Stationery Shop Profile
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-charcoal block mb-1">Shop Name *</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="bz-input font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Trade Name / Firm</label>
                <input
                  type="text"
                  placeholder="e.g. PageCraft Stationery & Printers"
                  value={tradeName}
                  onChange={(e) => setTradeName(e.target.value)}
                  className="bz-input"
                />
              </div>
              <div>
                <label className="font-semibold text-charcoal block mb-1">GSTIN Number</label>
                <input
                  type="text"
                  placeholder="27AAAAA0000A1Z5"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  className="bz-input font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-charcoal block mb-1">Contact Phone (+91)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bz-input"
                />
              </div>
              <div>
                <label className="font-semibold text-charcoal block mb-1">Shop Logo URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="bz-input"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-charcoal block mb-1">Shop Address</label>
              <textarea
                rows={2}
                placeholder="Shop No 12, Main Market, Station Road"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="bz-input"
              />
            </div>

            <div>
              <label className="font-semibold text-charcoal block mb-1">Printable Invoice Footer Text</label>
              <input
                type="text"
                placeholder="Thank you for shopping with us! No refund without bill."
                value={invoiceFooter}
                onChange={(e) => setInvoiceFooter(e.target.value)}
                className="bz-input"
              />
            </div>
          </div>
        </div>

        {/* POS & Billing Toggles (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-stone rounded-[20px] shadow-subtle p-6 space-y-4">
          <h2 className="text-sm font-bold text-charcoal flex items-center gap-2 border-b border-stone pb-3">
            <Sliders className="w-4 h-4 text-green-bottle" /> POS Billing Preferences
          </h2>

          <div className="space-y-4 text-xs">
            {/* Toggle 1 */}
            <div className="flex items-center justify-between p-3 bg-cream/40 rounded-xl border border-stone">
              <div>
                <p className="font-bold text-charcoal">Default Thermal Invoice Printing</p>
                <p className="text-[10px] text-warm-gray">Pre-select 80mm thermal receipt format</p>
              </div>
              <input
                type="checkbox"
                checked={thermalInvoice}
                onChange={(e) => setThermalInvoice(e.target.checked)}
                className="w-4 h-4 accent-green-bottle rounded cursor-pointer"
              />
            </div>

            {/* Toggle 2 */}
            <div className="p-3 bg-cream/40 rounded-xl border border-stone space-y-1">
              <label className="font-bold text-charcoal block">Default GST Calculation Mode</label>
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="gstMode"
                    value="inclusive"
                    checked={defaultGstMode === 'inclusive'}
                    onChange={(e) => setDefaultGstMode(e.target.value)}
                    className="accent-green-bottle"
                  />
                  <span>GST Inclusive</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="gstMode"
                    value="exclusive"
                    checked={defaultGstMode === 'exclusive'}
                    onChange={(e) => setDefaultGstMode(e.target.value)}
                    className="accent-green-bottle"
                  />
                  <span>GST Exclusive</span>
                </label>
              </div>
            </div>

            {/* Toggle 3 */}
            <div className="flex items-center justify-between p-3 bg-cream/40 rounded-xl border border-stone">
              <div>
                <p className="font-bold text-charcoal">Barcode Scanner Auto-Input</p>
                <p className="text-[10px] text-warm-gray">Auto add items when barcode scanned</p>
              </div>
              <input
                type="checkbox"
                checked={enableBarcodeScanning}
                onChange={(e) => setEnableBarcodeScanning(e.target.checked)}
                className="w-4 h-4 accent-green-bottle rounded cursor-pointer"
              />
            </div>

            {/* Toggle 4 */}
            <div className="flex items-center justify-between p-3 bg-cream/40 rounded-xl border border-stone">
              <div>
                <p className="font-bold text-charcoal">Low Stock Warning Alert</p>
                <p className="text-[10px] text-warm-gray">Warn at checkout if item is out of stock</p>
              </div>
              <input
                type="checkbox"
                checked={enableStockWarning}
                onChange={(e) => setEnableStockWarning(e.target.checked)}
                className="w-4 h-4 accent-green-bottle rounded cursor-pointer"
              />
            </div>

            {/* Toggle 5 */}
            <div className="flex items-center justify-between p-3 bg-cream/40 rounded-xl border border-stone">
              <div>
                <p className="font-bold text-charcoal">WhatsApp Invoice Sharing</p>
                <p className="text-[10px] text-warm-gray">Enable direct WhatsApp link after billing</p>
              </div>
              <input
                type="checkbox"
                checked={enableWhatsAppSharing}
                onChange={(e) => setEnableWhatsAppSharing(e.target.checked)}
                className="w-4 h-4 accent-green-bottle rounded cursor-pointer"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
