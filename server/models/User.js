import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  displayName: {
    type: String
  },
  email: {
    type: String,
    unique: true,
    sparse: true
  },
  photoUrl: {
    type: String
  },
  role: {
    type: String,
    enum: ['admin', 'student'],
    required: true
  },
  studentId: {
    type: String,
    sparse: true,
    unique: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);

