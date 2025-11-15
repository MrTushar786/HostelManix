import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['room-maintenance', 'food-quality', 'staff-behavior', 'wifi-electricity', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  resolutionMessage: {
    type: String
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.model('Complaint', complaintSchema);

