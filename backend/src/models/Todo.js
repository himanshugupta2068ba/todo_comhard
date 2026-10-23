import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 2000, default: '' },
    status: { type: String, enum: ['pending', 'in_progress', 'review', 'completed'], default: 'pending' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
    statusHistory: [{
      status: { type: String, enum: ['pending', 'in_progress', 'review', 'completed'] },
      enteredAt: { type: Date, required: true }
    }],
    dueDate: { type: Date, default: null },
    attachment: {
      originalName: { type: String, default: '' },
      storedName: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      size: { type: Number, default: 0 },
      path: { type: String, default: '' }
    },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Todo = mongoose.model('Todo', todoSchema);
