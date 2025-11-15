import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
  required: false,
  unique: true,
  sparse: true
  },
  phone: {
    type: String,
  required: false
  },
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  photoUrl: {
    type: String
  },
  guardianName: {
    type: String
  },
  address: {
    type: String
  },
  year: {
    type: String,
    enum: ['1st Year','2nd Year','3rd Year','4th Year','Other']
  },
  branch: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Student', studentSchema);

