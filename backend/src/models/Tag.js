import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

tagSchema.index({ owner: 1, name: 1 }, { unique: true });

export const Tag = mongoose.model('Tag', tagSchema);
