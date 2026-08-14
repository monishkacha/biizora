import mongoose from 'mongoose';

const growthOpportunitySchema = new mongoose.Schema(
  {
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
      index: true,
    },
    industry: {
      type: String,
      default: 'general',
    },
    category: {
      type: String,
      enum: ['CUSTOMERS', 'REVENUE', 'INVENTORY', 'PAYMENTS', 'OPERATIONS', 'PRODUCTION', 'MARKETING'],
      default: 'REVENUE',
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'High',
    },
    estimatedImpact: {
      type: Number,
      default: 0,
    },
    detectedAt: {
      type: Date,
      default: Date.now,
    },
    actionType: {
      type: String,
      required: true,
    },
    recommendedAction: {
      type: String,
      default: 'Take Action',
    },
    status: {
      type: String,
      enum: ['detected', 'executed', 'dismissed'],
      default: 'detected',
      index: true,
    },
    result: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

growthOpportunitySchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    businessId: this.businessId?.toString() || null,
    industry: this.industry,
    category: this.category,
    title: this.title,
    description: this.description,
    priority: this.priority,
    estimatedImpact: this.estimatedImpact,
    detectedAt: this.detectedAt || this.createdAt,
    actionType: this.actionType,
    recommendedAction: this.recommendedAction,
    status: this.status,
    result: this.result,
    completedAt: this.completedAt,
  };
};

export const GrowthOpportunity = mongoose.model('GrowthOpportunity', growthOpportunitySchema);
