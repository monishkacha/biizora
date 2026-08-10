import mongoose from 'mongoose';

const schoolOrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    description: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    quotedPrice: { type: Number, default: 0 },
  },
  { _id: true }
);

const schoolOrderSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    orderNumber: { type: String, required: true },
    schoolName: { type: String, required: true, trim: true },
    contactPerson: { type: String, default: '' },
    phone: { type: String, default: '' },
    orderDate: { type: String, default: '' },
    deliveryDate: { type: String, default: '' },
    items: [schoolOrderItemSchema],
    quotedTotal: { type: Number, default: 0 },
    advanceReceived: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Quotation', 'Confirmed', 'Packed', 'Delivered', 'Paid'],
      default: 'Quotation',
    },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

schoolOrderSchema.index({ businessId: 1, orderNumber: 1 }, { unique: true });

schoolOrderSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    orderNumber: this.orderNumber,
    schoolName: this.schoolName,
    contactPerson: this.contactPerson,
    phone: this.phone,
    orderDate: this.orderDate,
    deliveryDate: this.deliveryDate,
    items: this.items.map((item) => ({
      id: item._id.toString(),
      productId: item.productId?.toString() || null,
      description: item.description,
      quantity: item.quantity,
      quotedPrice: item.quotedPrice,
    })),
    quotedTotal: this.quotedTotal,
    advanceReceived: this.advanceReceived,
    status: this.status,
    customerId: this.customerId?.toString() || null,
    invoiceId: this.invoiceId?.toString() || null,
    notes: this.notes,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const SchoolOrder = mongoose.model('SchoolOrder', schoolOrderSchema);
