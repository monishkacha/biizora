import React, { useState } from 'react';
import { Card } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Store,
  ShoppingCart,
  Barcode,
  Search,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Users,
  Truck,
  FileText
} from 'lucide-react';

export function RetailBillingPage() {
  const [cart, setCart] = useState([
    { id: 1, name: 'Smart Touchscreen POS Terminal X1', price: 16500, qty: 1, tax: 18 },
    { id: 2, name: 'Thermal Receipt Rolls (Box 50)', price: 1250, qty: 2, tax: 12 },
  ]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const taxTotal = cart.reduce((sum, item) => sum + (item.price * item.qty * (item.tax / 100)), 0);
  const grandTotal = subtotal + taxTotal;

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-green-bottle uppercase tracking-wider">Retail POS Terminal</span>
          <h1 className="text-2xl font-display font-semibold text-charcoal">Retail Counter Billing</h1>
          <p className="text-xs text-warm-gray mt-0.5">Fast barcode scanning, GST tax auto-calculation, and quick receipt printing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Product Selector & Cart */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 space-y-3">
            <div className="relative">
              <Barcode className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray" />
              <input
                type="text"
                placeholder="Scan barcode or type product name..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-green-bottle font-mono"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 border-b border-stone-200 text-warm-gray uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Price</th>
                    <th className="py-2.5 px-3">Qty</th>
                    <th className="py-2.5 px-3">GST</th>
                    <th className="py-2.5 px-3">Subtotal</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {cart.map((item) => (
                    <tr key={item.id} className="hover:bg-cream/30">
                      <td className="py-3 px-3 font-bold text-charcoal">{item.name}</td>
                      <td className="py-3 px-3">₹{item.price.toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 border border-stone-300 rounded-lg px-2 py-0.5 w-fit">
                          <button onClick={() => updateQty(item.id, -1)} className="font-bold text-stone-600">-</button>
                          <span className="font-bold px-1">{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="font-bold text-stone-600">+</button>
                        </div>
                      </td>
                      <td className="py-3 px-3">{item.tax}%</td>
                      <td className="py-3 px-3 font-bold text-charcoal">₹{(item.price * item.qty).toLocaleString()}</td>
                      <td className="py-3 px-3">
                        <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Side: Total Summary & Checkout */}
        <Card className="p-5 space-y-4 h-fit">
          <h3 className="text-sm font-bold text-charcoal border-b border-stone-200 pb-2">Bill Summary</h3>
          <div className="space-y-2 text-xs text-warm-gray">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-charcoal">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (GST)</span>
              <span className="font-bold text-charcoal">₹{taxTotal.toLocaleString()}</span>
            </div>
            <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-bold text-charcoal">
              <span>Grand Total</span>
              <span className="text-green-bottle">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Button variant="accent" className="w-full" size="lg" onClick={() => alert('Receipt generated! Total: ₹' + grandTotal.toLocaleString())}>
              <Printer className="w-4 h-4" /> Complete & Print Bill
            </Button>
            <Button variant="secondary" className="w-full" size="sm">
              Hold Bill / Draft
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function StockAlertsPage() {
  const alerts = [
    { name: 'POS Thermal Roll 80mm', sku: 'AMX-ROLL80', stock: 4, minLevel: 15, supplier: 'PaperCraft Ltd', urgency: 'Critical' },
    { name: 'Wireless Barcode Scanner X1', sku: 'AMX-SCN-WL', stock: 2, minLevel: 5, supplier: 'Apex Electronics', urgency: 'High' },
    { name: 'Android Cash Drawer Unit', sku: 'AMX-CDR-01', stock: 1, minLevel: 3, supplier: 'Apex Electronics', urgency: 'Medium' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold text-green-bottle uppercase tracking-wider">Inventory Intelligence</span>
        <h1 className="text-2xl font-display font-semibold text-charcoal">Low Stock & Reorder Alerts</h1>
        <p className="text-xs text-warm-gray mt-0.5">Automated safety threshold warnings and vendor reorder recommendations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map((a, idx) => (
          <Card key={idx} className="p-4 space-y-3 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{a.sku}</span>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">{a.urgency}</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-charcoal">{a.name}</h3>
              <p className="text-xs text-warm-gray">Supplier: {a.supplier}</p>
            </div>
            <div className="text-xs font-bold text-charcoal flex justify-between bg-stone-50 p-2.5 rounded-xl">
              <span>Current: <span className="text-red-600">{a.stock} units</span></span>
              <span>Reorder: {a.minLevel} units</span>
            </div>
            <Button variant="secondary" size="sm" className="w-full" onClick={() => alert(`PO Requisition generated for ${a.name}`)}>
              Generate Reorder PO
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function SuppliersPage() {
  const suppliers = [
    { name: 'Apex Electronics Private Ltd', contact: 'Rahul Verma', phone: '+91 98111 22334', city: 'Mumbai', state: 'Maharashtra', totalPurchases: 450000, status: 'Active' },
    { name: 'Century Paper & Stationery Mills', contact: 'S. K. Gupta', phone: '+91 11 26589900', city: 'Delhi', state: 'Delhi', totalPurchases: 180000, status: 'Active' },
    { name: 'Jindal Industrial Metals', contact: 'A. K. Jindal', phone: '+91 22 66554433', city: 'Pune', state: 'Maharashtra', totalPurchases: 890000, status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-green-bottle uppercase tracking-wider">Procurement</span>
          <h1 className="text-2xl font-display font-semibold text-charcoal">Supplier Directory</h1>
          <p className="text-xs text-warm-gray mt-0.5">Manage vendors, purchase order histories, and payment terms</p>
        </div>
        <Button variant="accent" onClick={() => alert('New Supplier modal opened')}>
          <Plus className="w-4 h-4" /> Add Vendor
        </Button>
      </div>

      <Card className="p-5 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 border-b border-stone-200 text-warm-gray uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Supplier Name</th>
                <th className="py-3 px-4">Contact Person</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Total Orders Value</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {suppliers.map((s, idx) => (
                <tr key={idx} className="hover:bg-cream/30">
                  <td className="py-3 px-4 font-bold text-charcoal">{s.name}</td>
                  <td className="py-3 px-4 text-warm-gray">{s.contact}</td>
                  <td className="py-3 px-4 font-mono">{s.phone}</td>
                  <td className="py-3 px-4 text-warm-gray">{s.city}, {s.state}</td>
                  <td className="py-3 px-4 font-bold text-charcoal">₹{s.totalPurchases.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
