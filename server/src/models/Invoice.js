import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema(
  {
    description: String,
    hsnSac: String,
    quantity: { type: Number, default: 1 },
    rate: { type: Number, default: 0 },
    gstRate: { type: Number, default: 18 },
    amount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
  },
  { _id: true }
);

const invoiceSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    invoiceNumber: { type: String, required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: { type: String, default: '' },
    customerGstin: { type: String, default: '' },
    issueDate: { type: String, default: '' },
    dueDate: { type: String, default: '' },
    items: [invoiceItemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    taxableAmount: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    igst: { type: Number, default: 0 },
    totalTax: { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    status: { type: String, enum: ['draft', 'pending', 'paid', 'overdue', 'cancelled'], default: 'pending' },
    paidAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: 'Pending' },
    notes: { type: String, default: '' },
    terms: { type: String, default: '' },
  },
  { timestamps: true }
);

invoiceSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ businessId: 1, customerName: 'text', invoiceNumber: 'text' });

invoiceSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    invoiceNumber: this.invoiceNumber,
    customerId: this.customerId?.toString() || null,
    customerName: this.customerName,
    customerGstin: this.customerGstin,
    issueDate: this.issueDate,
    dueDate: this.dueDate,
    items: this.items.map((item) => ({
      id: item._id.toString(),
      description: item.description,
      hsnSac: item.hsnSac,
      quantity: item.quantity,
      rate: item.rate,
      gstRate: item.gstRate,
      amount: item.amount,
      taxAmount: item.taxAmount,
    })),
    subtotal: this.subtotal,
    discount: this.discount,
    taxableAmount: this.taxableAmount,
    cgst: this.cgst,
    sgst: this.sgst,
    igst: this.igst,
    totalTax: this.totalTax,
    shippingCharge: this.shippingCharge,
    grandTotal: this.grandTotal,
    status: this.status,
    paidAmount: this.paidAmount,
    paymentMethod: this.paymentMethod,
    notes: this.notes,
    terms: this.terms,
  };
};

export const Invoice = mongoose.model('Invoice', invoiceSchema);
