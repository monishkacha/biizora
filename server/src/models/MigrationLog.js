import mongoose from 'mongoose';

const migrationLogSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    importType: {
      type: String,
      required: true,
      enum: ['inventory', 'customers', 'suppliers', 'orders', 'transactions', 'complete'],
    },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    totalRows: { type: Number, default: 0 },
    importedCount: { type: Number, default: 0 },
    updatedCount: { type: Number, default: 0 },
    skippedCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    warningCount: { type: Number, default: 0 },
    importStrategy: { type: String, default: 'new_only' },
    errorDetails: [
      {
        row: Number,
        field: String,
        message: String,
        data: mongoose.Schema.Types.Mixed,
      },
    ],
    createdRecordIds: {
      products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
      customers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Customer' }],
      expenses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Expense' }],
      invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }],
    },
    undoable: { type: Boolean, default: true },
    isUndone: { type: Boolean, default: false },
    undoneAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

migrationLogSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    importType: this.importType,
    fileName: this.fileName,
    fileType: this.fileType,
    fileSize: this.fileSize,
    totalRows: this.totalRows,
    importedCount: this.importedCount,
    updatedCount: this.updatedCount,
    skippedCount: this.skippedCount,
    failedCount: this.failedCount,
    warningCount: this.warningCount,
    importStrategy: this.importStrategy,
    errorDetails: this.errorDetails || [],
    undoable: this.undoable && !this.isUndone,
    isUndone: this.isUndone,
    undoneAt: this.undoneAt,
    createdAt: this.createdAt,
  };
};

export const MigrationLog = mongoose.model('MigrationLog', migrationLogSchema);
