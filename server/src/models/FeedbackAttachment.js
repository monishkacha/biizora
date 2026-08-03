import mongoose from 'mongoose';

const feedbackAttachmentSchema = new mongoose.Schema(
  {
    feedbackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      required: true,
      index: true,
    },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, default: 0 },
    /** data URL or future CDN/S3 URL */
    url: { type: String, required: true },
    storage: {
      type: String,
      enum: ['inline', 'local', 's3', 'cdn'],
      default: 'inline',
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

feedbackAttachmentSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    feedbackId: this.feedbackId.toString(),
    filename: this.filename,
    mimeType: this.mimeType,
    size: this.size,
    url: this.url,
    storage: this.storage,
    createdAt: this.createdAt,
  };
};

export const FeedbackAttachment = mongoose.model('FeedbackAttachment', feedbackAttachmentSchema);
