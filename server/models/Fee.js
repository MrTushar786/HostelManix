import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['paid', 'pending', 'overdue'],
    default: 'pending'
  },
  paidDate: {
    type: Date
  },
  paymentMethod: {
    type: String
  },
  transactionId: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Fee', feeSchema);

