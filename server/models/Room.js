import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  block: {
    type: String,
    default: 'A'
  },
  roomNumber: {
    type: Number,
    required: true,
    unique: true
  },
  floor: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    default: 4
  },
  occupants: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['occupied', 'vacant', 'maintenance'],
    default: 'vacant'
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }]
}, {
  timestamps: true
});

export default mongoose.model('Room', roomSchema);

