import mongoose from 'mongoose';

const modifierOptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const modifierGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Size", "Crust", "Spice Level", "Extras"
    required: { type: Boolean, default: false },
    multiSelect: { type: Boolean, default: false },
    options: [modifierOptionSchema],
  },
  { _id: false }
);

const recipeIngredientSchema = new mongoose.Schema(
  {
    ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
    ingredientName: { type: String, required: true },
    quantity: { type: Number, required: true }, // e.g. 0.250 for 250g
    unit: { type: String, default: 'kg' },
  },
  { _id: false }
);

const menuItemSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: { type: String, required: true, index: true }, // Starters, Main Course, Rice & Biryani, Breads, Desserts, Beverages
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0 },
    foodType: { type: String, enum: ['veg', 'non-veg', 'vegan', 'egg'], default: 'veg' },
    preparationTime: { type: Number, default: 15 }, // minutes
    kitchenStation: { type: String, enum: ['Kitchen', 'Bar', 'Grill', 'Dessert'], default: 'Kitchen' },
    availability: { type: String, enum: ['available', 'out_of_stock', 'hidden'], default: 'available' },
    image: { type: String, default: '' },
    gstRate: { type: Number, default: 5 }, // 5% for restaurant food usually
    modifiers: [modifierGroupSchema],
    recipe: [recipeIngredientSchema],
  },
  { timestamps: true }
);

menuItemSchema.index({ businessId: 1, category: 1, name: 'text' });

menuItemSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    name: this.name,
    description: this.description,
    category: this.category,
    price: this.price,
    costPrice: this.costPrice,
    foodType: this.foodType,
    preparationTime: this.preparationTime,
    kitchenStation: this.kitchenStation,
    availability: this.availability,
    image: this.image,
    gstRate: this.gstRate,
    modifiers: this.modifiers || [],
    recipe: this.recipe || [],
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const MenuItem = mongoose.model('MenuItem', menuItemSchema);
