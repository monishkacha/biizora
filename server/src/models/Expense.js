import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    title: { type: String, required: true },
    category: { type: String, default: '' },
    amount: { type: Number, required: true },
    date: { type: String, default: '' },
    paymentMode: { type: String, default: '' },
    vendor: { type: String, default: '' },
    gstClaimable: { type: Boolean, default: false },
    gstAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['paid', 'pending'], default: 'paid' },
    receiptUrl: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

expenseSchema.index({ businessId: 1, title: 'text', vendor: 'text' });

expenseSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    title: this.title,
    category: this.category,
    amount: this.amount,
    date: this.date,
    paymentMode: this.paymentMode,
    vendor: this.vendor,
    gstClaimable: this.gstClaimable,
    gstAmount: this.gstAmount,
    status: this.status,
    receiptUrl: this.receiptUrl,
    notes: this.notes,
  };
};

export const Expense = mongoose.model('Expense', expenseSchema);
