import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  room: {
    type: Number,
    required: true
  },
  problemType: {
    type: String,
    enum: ['electrical', 'plumbing', 'furniture', 'other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved'],
    default: 'open'
  },
  date: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Maintenance', maintenanceSchema);

