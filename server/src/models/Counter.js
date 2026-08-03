import mongoose from 'mongoose';

/** Atomic counters for human-readable IDs like BIO-FB-000124 */
const counterSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model('Counter', counterSchema);

export async function nextSequence(key, { pad = 6, prefix = '' } = {}) {
  const doc = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  const num = String(doc.seq).padStart(pad, '0');
  return `${prefix}${num}`;
}
