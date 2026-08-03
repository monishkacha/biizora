import mongoose from 'mongoose';

const feedbackReplySchema = new mongoose.Schema(
  {
    feedbackId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Feedback',
      required: true,
      index: true,
    },
    authorType: {
      type: String,
      enum: ['user', 'admin', 'system'],
      required: true,
    },
    authorName: { type: String, required: true },
    authorUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    body: { type: String, required: true, trim: true },
    isInternal: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

feedbackReplySchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    feedbackId: this.feedbackId.toString(),
    authorType: this.authorType,
    authorName: this.authorName,
    authorUserId: this.authorUserId?.toString() || null,
    body: this.body,
    isInternal: this.isInternal,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const FeedbackReply = mongoose.model('FeedbackReply', feedbackReplySchema);
