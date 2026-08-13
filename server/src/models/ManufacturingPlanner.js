import mongoose from 'mongoose';

// Schema for raw materials used in a production plan
const planMaterialSchema = new mongoose.Schema(
  {
    materialName: { type: String, required: true, trim: true },
    materialCode: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, default: 'kg' },
    vendor: { type: String, default: '' },
    grade: { type: String, default: 'Standard' },
  },
  { _id: false }
);

// Main Production Plan Schema
const productionPlanSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    workspaceId: { type: String, default: '' },
    planNumber: { type: String, required: true, trim: true },
    planName: { type: String, required: true, trim: true },
    productCategory: { type: String, required: true, default: 'General' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String, default: '' },
    scheduledDate: { type: Date, default: Date.now },
    shift: { type: String, default: 'Shift 1' },
    machineId: { type: String, default: '' },
    manufacturingLine: { type: String, default: '' },
    supervisor: { type: String, default: '' },
    materials: [planMaterialSchema],
    productSpecs: {
      dimension: { type: String, default: '' },
      thickness: { type: String, default: '' },
      width: { type: String, default: '' },
      length: { type: String, default: '' },
      diameter: { type: String, default: '' },
      density: { type: String, default: '' },
      batchSize: { type: Number, default: 1000 },
      customAttributes: [{ key: String, value: String }],
    },
    status: {
      type: String,
      enum: ['Draft', 'Scheduled', 'In Progress', 'Completed', 'Converted to Order', 'Cancelled'],
      default: 'Scheduled',
    },
    predictedOutputQty: { type: Number, default: 0 },
    predictedWasteQty: { type: Number, default: 0 },
    predictedWastePct: { type: Number, default: 0 },
    predictedYieldPct: { type: Number, default: 0 },
    materialEfficiencyPct: { type: Number, default: 0 },
    estimatedDurationMinutes: { type: Number, default: 360 },
    confidenceScore: { type: Number, default: 90 },
    riskIndicators: [
      {
        riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
        title: { type: String },
        description: { type: String },
      },
    ],
    isTemplate: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    convertedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true }
);

productionPlanSchema.index({ businessId: 1, planNumber: 1 });
productionPlanSchema.index({ businessId: 1, status: 1 });
productionPlanSchema.index({ businessId: 1, productCategory: 1 });

// Schema for workspace yield rules
const yieldRuleSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    workspaceId: { type: String, default: '' },
    productCategory: { type: String, required: true },
    materialType: { type: String, default: 'All' },
    machineType: { type: String, default: 'All' },
    standardYieldRate: { type: Number, default: 0.94 }, // 94%
    startupLossRate: { type: Number, default: 0.02 }, // 2%
    changeoverLossRate: { type: Number, default: 0.015 }, // 1.5%
    shrinkageFactor: { type: Number, default: 0.01 }, // 1%
  },
  { timestamps: true }
);

yieldRuleSchema.index({ businessId: 1, productCategory: 1 }, { unique: true });

// Schema for isolated AI yield prediction history
const predictionHistorySchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    workspaceId: { type: String, default: '' },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductionPlan' },
    inputSnapshot: { type: Object, required: true },
    predictionSnapshot: { type: Object, required: true },
    actualResultSnapshot: { type: Object },
    modelVersion: { type: String, default: 'yield-predictor-v1' },
  },
  { timestamps: true }
);

export const ProductionPlan = mongoose.model('ProductionPlan', productionPlanSchema);
export const YieldRule = mongoose.model('YieldRule', yieldRuleSchema);
export const PredictionHistory = mongoose.model('PredictionHistory', predictionHistorySchema);
