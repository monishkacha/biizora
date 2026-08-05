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
    discount: { type: Number, default: 0 },
    discountType: { type: String, default: 'fixed' }, // 'fixed' or 'percent'
    taxableValue: { type: Number, default: 0 },
    cgstRate: { type: Number, default: 0 },
    sgstRate: { type: Number, default: 0 },
    igstRate: { type: Number, default: 0 },
    cgstAmount: { type: Number, default: 0 },
    sgstAmount: { type: Number, default: 0 },
    igstAmount: { type: Number, default: 0 },
    totalGst: { type: Number, default: 0 },
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
    packingCharge: { type: Number, default: 0 },
    handlingCharge: { type: Number, default: 0 },
    loadingCharge: { type: Number, default: 0 },
    insuranceCharge: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
    roundOffEnabled: { type: Boolean, default: false },
    roundOffAmount: { type: Number, default: 0 },
    customHeaders: { type: Array, default: [] }, // array of { label: String, value: String }
    copyTypes: { type: Array, default: [] },
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
      discount: item.discount,
      discountType: item.discountType,
      taxableValue: item.taxableValue,
      cgstRate: item.cgstRate,
      sgstRate: item.sgstRate,
      igstRate: item.igstRate,
      cgstAmount: item.cgstAmount,
      sgstAmount: item.sgstAmount,
      igstAmount: item.igstAmount,
      totalGst: item.totalGst,
    })),
    subtotal: this.subtotal,
    discount: this.discount,
    taxableAmount: this.taxableAmount,
    cgst: this.cgst,
    sgst: this.sgst,
    igst: this.igst,
    totalTax: this.totalTax,
    shippingCharge: this.shippingCharge,
    packingCharge: this.packingCharge,
    handlingCharge: this.handlingCharge,
    loadingCharge: this.loadingCharge,
    insuranceCharge: this.insuranceCharge,
    otherCharges: this.otherCharges,
    roundOffEnabled: this.roundOffEnabled,
    roundOffAmount: this.roundOffAmount,
    customHeaders: this.customHeaders,
    copyTypes: this.copyTypes,
    grandTotal: this.grandTotal,
    status: this.status,
    paidAmount: this.paidAmount,
    paymentMethod: this.paymentMethod,
    notes: this.notes,
    terms: this.terms,
  };
};

export const Invoice = mongoose.model('Invoice', invoiceSchema);
