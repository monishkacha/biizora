import React from 'react';

export default function PrintableInvoice({ invoice, company, settings, format = 'a4' }) {
  if (!invoice) return null;

  const isThermal = format === 'thermal';
  const items = invoice.items || [];
  const shopName = company?.name || 'PageCraft Stationery';
  const shopAddress = company?.address ? `${company.address.street || ''}, ${company.address.city || ''} ${company.address.pincode || ''}` : 'Main Market, Station Road';
  const shopPhone = company?.phone || '+91 98765 43210';
  const shopGstin = company?.gstin || company?.GSTNumber || '27AAAAA0000A1Z5';
  const logoUrl = company?.logo || company?.branding?.logo;
  const footerText = settings?.invoiceFooter || 'Thank you for shopping with us! Visit Again.';

  if (isThermal) {
    return (
      <div id="printable-invoice" className="thermal-invoice text-charcoal bg-white font-mono text-[11px] leading-tight p-2 w-[80mm] mx-auto border border-dashed border-stone">
        {/* Thermal Header */}
        <div className="text-center pb-2 border-b border-dashed border-stone space-y-1">
          {logoUrl && <img src={logoUrl} alt="Logo" className="h-8 mx-auto mb-1 object-contain" />}
          <h2 className="font-bold text-sm uppercase">{shopName}</h2>
          <p className="text-[10px]">{shopAddress}</p>
          <p className="text-[10px]">Ph: {shopPhone} | GSTIN: {shopGstin}</p>
        </div>

        {/* Invoice Meta */}
        <div className="py-2 border-b border-dashed border-stone text-[10px] space-y-0.5">
          <div className="flex justify-between">
            <span>Bill No: <strong>{invoice.invoiceNumber}</strong></span>
            <span>Date: {invoice.issueDate ? String(invoice.issueDate).slice(0, 10) : new Date().toLocaleDateString('en-IN')}</span>
          </div>
          {invoice.customerName && (
            <div className="flex justify-between">
              <span>Customer: {invoice.customerName}</span>
              {invoice.customerPhone && <span>Ph: {invoice.customerPhone}</span>}
            </div>
          )}
          {invoice.invoiceType && <div className="text-[9px] uppercase tracking-wider text-warm-gray">Type: {invoice.invoiceType}</div>}
        </div>

        {/* Table */}
        <table className="w-full my-2 text-[10px]">
          <thead>
            <tr className="border-b border-dashed border-stone text-left">
              <th className="py-1">Item</th>
              <th className="py-1 text-center">Qty</th>
              <th className="py-1 text-right">Rate</th>
              <th className="py-1 text-right">Amt</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-stone/20">
                <td className="py-1 pr-1 truncate max-w-[110px]">
                  {item.description}
                  {item.gstRate ? <span className="block text-[8px] text-warm-gray">GST {item.gstRate}%</span> : null}
                </td>
                <td className="py-1 text-center">{item.quantity}</td>
                <td className="py-1 text-right">₹{item.rate}</td>
                <td className="py-1 text-right font-semibold">₹{Number(item.amount || item.quantity * item.rate).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="py-1 border-t border-dashed border-stone space-y-0.5 text-[10px]">
          <div className="flex justify-between"><span>Subtotal:</span><span>₹{Number(invoice.subtotal || invoice.grandTotal).toFixed(2)}</span></div>
          {Number(invoice.discount) > 0 && <div className="flex justify-between text-green-forest"><span>Discount:</span><span>-₹{Number(invoice.discount).toFixed(2)}</span></div>}
          {Number(invoice.cgst) > 0 && <div className="flex justify-between text-warm-gray"><span>CGST:</span><span>₹{Number(invoice.cgst).toFixed(2)}</span></div>}
          {Number(invoice.sgst) > 0 && <div className="flex justify-between text-warm-gray"><span>SGST:</span><span>₹{Number(invoice.sgst).toFixed(2)}</span></div>}
          <div className="flex justify-between text-xs font-bold pt-1 border-t border-stone">
            <span>Grand Total:</span>
            <span>₹{Number(invoice.grandTotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-[10px] pt-0.5">
            <span>Payment ({invoice.paymentMethod || 'Cash'}):</span>
            <span>₹{Number(invoice.amountReceived || invoice.paidAmount || invoice.grandTotal).toFixed(2)}</span>
          </div>
          {Number(invoice.balanceDue) > 0 ? (
            <div className="flex justify-between text-[10px] font-bold text-terracotta">
              <span>Balance Due:</span>
              <span>₹{Number(invoice.balanceDue).toFixed(2)}</span>
            </div>
          ) : (
            <div className="flex justify-between text-[9px] text-warm-gray">
              <span>Change Paid:</span>
              <span>₹{Math.max(0, Number(invoice.amountReceived || 0) - Number(invoice.grandTotal || 0)).toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center pt-2 border-t border-dashed border-stone text-[9px] text-warm-gray">
          <p>{footerText}</p>
          <p className="mt-0.5">Powered by Biizora POS</p>
        </div>
      </div>
    );
  }

  // A4 Printable Invoice
  return (
    <div id="printable-invoice" className="a4-invoice text-charcoal bg-white p-8 max-w-4xl mx-auto border border-stone shadow-sm rounded-lg font-sans">
      {/* Header */}
      <div className="flex justify-between items-start pb-6 border-b border-stone">
        <div>
          {logoUrl ? (
            <img src={logoUrl} alt="Shop Logo" className="h-12 object-contain mb-2" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-green-bottle text-white font-bold flex items-center justify-center text-lg mb-2">
              📄
            </div>
          )}
          <h1 className="text-xl font-bold text-charcoal">{shopName}</h1>
          <p className="text-xs text-warm-gray">{shopAddress}</p>
          <p className="text-xs text-warm-gray">Phone: {shopPhone} | GSTIN: {shopGstin}</p>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-green-bottle/10 text-green-bottle text-xs font-bold uppercase tracking-wider rounded-md border border-green-bottle/20 mb-2">
            Tax Invoice
          </span>
          <p className="text-sm font-bold text-charcoal">Invoice #{invoice.invoiceNumber}</p>
          <p className="text-xs text-warm-gray">Date: {invoice.issueDate ? String(invoice.issueDate).slice(0, 10) : new Date().toLocaleDateString('en-IN')}</p>
          <p className="text-xs text-warm-gray">Status: <strong className="capitalize">{invoice.status || 'Paid'}</strong></p>
        </div>
      </div>

      {/* Customer & Billing Info */}
      <div className="grid grid-cols-2 gap-6 py-4 border-b border-stone text-xs">
        <div>
          <h3 className="font-semibold text-charcoal text-xs uppercase tracking-wider text-warm-gray mb-1">Billed To:</h3>
          <p className="font-bold text-sm text-charcoal">{invoice.customerName || 'Walk-in Customer'}</p>
          {invoice.customerPhone && <p className="text-warm-gray">Phone: {invoice.customerPhone}</p>}
          {invoice.customerGstin && <p className="text-warm-gray">GSTIN: {invoice.customerGstin}</p>}
        </div>
        <div className="text-right">
          <h3 className="font-semibold text-charcoal text-xs uppercase tracking-wider text-warm-gray mb-1">Payment Info:</h3>
          <p><span className="text-warm-gray">Mode:</span> <strong>{invoice.paymentMethod || 'Cash'}</strong></p>
          <p><span className="text-warm-gray">Amount Paid:</span> <strong>₹{Number(invoice.amountReceived || invoice.paidAmount || invoice.grandTotal).toFixed(2)}</strong></p>
          {Number(invoice.balanceDue) > 0 && (
            <p className="text-terracotta font-bold"><span className="text-warm-gray">Balance Due:</span> ₹{Number(invoice.balanceDue).toFixed(2)}</p>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full my-6 text-xs border-collapse">
        <thead>
          <tr className="bg-cream/60 border-y border-stone text-charcoal font-semibold">
            <th className="p-2.5 text-left">#</th>
            <th className="p-2.5 text-left">Item / Service Description</th>
            <th className="p-2.5 text-center">Qty</th>
            <th className="p-2.5 text-right">Rate (₹)</th>
            <th className="p-2.5 text-right">GST %</th>
            <th className="p-2.5 text-right">Taxable (₹)</th>
            <th className="p-2.5 text-right">Amount (₹)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone/40">
          {items.map((item, idx) => {
            const qty = Number(item.quantity) || 1;
            const rate = Number(item.rate) || 0;
            const lineAmt = Number(item.amount || qty * rate);
            const gstRate = Number(item.gstRate) || 0;
            const taxable = Number(item.taxableValue || (lineAmt / (1 + gstRate / 100)));
            return (
              <tr key={idx} className="hover:bg-cream/20">
                <td className="p-2.5 text-warm-gray">{idx + 1}</td>
                <td className="p-2.5 font-medium text-charcoal">
                  {item.description}
                  {item.itemType === 'service' && <span className="ml-1 text-[10px] text-green-forest font-semibold">(Service)</span>}
                </td>
                <td className="p-2.5 text-center">{qty}</td>
                <td className="p-2.5 text-right">₹{rate.toFixed(2)}</td>
                <td className="p-2.5 text-right">{gstRate}%</td>
                <td className="p-2.5 text-right">₹{taxable.toFixed(2)}</td>
                <td className="p-2.5 text-right font-semibold text-charcoal">₹{lineAmt.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-between items-start pt-4 border-t border-stone text-xs">
        <div className="w-1/2 space-y-2">
          {invoice.notes && (
            <div className="p-3 bg-cream/40 rounded-lg border border-stone">
              <p className="font-semibold text-charcoal">Notes:</p>
              <p className="text-warm-gray mt-0.5">{invoice.notes}</p>
            </div>
          )}
          <div className="p-3 bg-ivory/60 rounded-lg border border-stone/60 text-[11px] text-warm-gray space-y-1">
            <p className="font-semibold text-charcoal">GST Summary:</p>
            <p>CGST Total: ₹{Number(invoice.cgst || (invoice.totalTax || 0) / 2).toFixed(2)}</p>
            <p>SGST Total: ₹{Number(invoice.sgst || (invoice.totalTax || 0) / 2).toFixed(2)}</p>
          </div>
        </div>

        <div className="w-72 space-y-1.5 text-right">
          <div className="flex justify-between text-warm-gray"><span>Subtotal:</span><span>₹{Number(invoice.subtotal || invoice.grandTotal).toFixed(2)}</span></div>
          {Number(invoice.discount) > 0 && <div className="flex justify-between text-green-forest font-medium"><span>Discount:</span><span>-₹{Number(invoice.discount).toFixed(2)}</span></div>}
          <div className="flex justify-between text-warm-gray"><span>Total Tax (GST):</span><span>₹{Number(invoice.totalTax || 0).toFixed(2)}</span></div>
          <div className="flex justify-between text-sm font-bold text-charcoal pt-2 border-t border-stone">
            <span>Grand Total:</span>
            <span className="text-green-bottle">₹{Number(invoice.grandTotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs pt-1">
            <span>Amount Received:</span>
            <span>₹{Number(invoice.amountReceived || invoice.paidAmount || invoice.grandTotal).toFixed(2)}</span>
          </div>
          {Number(invoice.balanceDue) > 0 ? (
            <div className="flex justify-between text-xs font-bold text-terracotta">
              <span>Balance Due:</span>
              <span>₹{Number(invoice.balanceDue).toFixed(2)}</span>
            </div>
          ) : (
            <div className="flex justify-between text-xs text-warm-gray">
              <span>Change Paid:</span>
              <span>₹{Math.max(0, Number(invoice.amountReceived || 0) - Number(invoice.grandTotal || 0)).toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-stone text-center text-xs text-warm-gray">
        <p className="font-medium text-charcoal">{footerText}</p>
        <p className="text-[11px] mt-1">This is a computer-generated invoice created via Biizora POS.</p>
      </div>
    </div>
  );
}
