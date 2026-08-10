import mongoose from 'mongoose';

const selectedModifierSchema = new mongoose.Schema(
  {
    groupName: { type: String, default: '' },
    optionName: { type: String, required: true },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    foodType: { type: String, default: 'veg' },
    kitchenStation: { type: String, default: 'Kitchen' },
    modifiers: [selectedModifierSchema],
    notes: { type: String, default: '' }, // e.g. "Less spicy", "No onion"
    kitchenStatus: {
      type: String,
      enum: ['new', 'pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'],
      default: 'new',
    },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    orderNumber: { type: String, required: true }, // e.g. #1042
    orderType: {
      type: String,
      enum: ['dine_in', 'takeaway', 'delivery', 'online', 'qr'],
      default: 'dine_in',
      index: true,
    },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null },
    tableName: { type: String, default: '' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
    customerName: { type: String, default: 'Walk-in Guest' },
    phone: { type: String, default: '' },
    deliveryAddress: { type: String, default: '' },

    items: [orderItemSchema],

    kitchenStatus: {
      type: String,
      enum: ['new', 'preparing', 'ready', 'served', 'completed'],
      default: 'new',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ['active', 'completed', 'cancelled', 'voided'],
      default: 'active',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partially_paid', 'paid'],
      default: 'unpaid',
      index: true,
    },

    subtotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    discountCode: { type: String, default: '' },
    taxAmount: { type: Number, default: 0 }, // GST
    serviceChargeAmount: { type: Number, default: 0 },
    tipAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    paymentMethod: { type: String, default: '' }, // Cash, UPI, Card, Split

    serverName: { type: String, default: 'Staff' },
    priority: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

orderSchema.index({ businessId: 1, createdAt: -1 });

orderSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    orderNumber: this.orderNumber,
    orderType: this.orderType,
    tableId: this.tableId ? this.tableId.toString() : null,
    tableName: this.tableName,
    customerId: this.customerId ? this.customerId.toString() : null,
    customerName: this.customerName,
    phone: this.phone,
    deliveryAddress: this.deliveryAddress,
    items: (this.items || []).map((item) => ({
      id: item._id ? item._id.toString() : null,
      menuItemId: item.menuItemId ? item.menuItemId.toString() : null,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      foodType: item.foodType,
      kitchenStation: item.kitchenStation,
      modifiers: item.modifiers || [],
      notes: item.notes,
      kitchenStatus: item.kitchenStatus,
      createdAt: item.createdAt,
    })),
    kitchenStatus: this.kitchenStatus,
    orderStatus: this.orderStatus,
    paymentStatus: this.paymentStatus,
    subtotal: this.subtotal,
    discountAmount: this.discountAmount,
    discountCode: this.discountCode,
    taxAmount: this.taxAmount,
    serviceChargeAmount: this.serviceChargeAmount,
    tipAmount: this.tipAmount,
    grandTotal: this.grandTotal,
    paidAmount: this.paidAmount,
    paymentMethod: this.paymentMethod,
    serverName: this.serverName,
    priority: this.priority,
    notes: this.notes,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Order = mongoose.model('Order', orderSchema);
