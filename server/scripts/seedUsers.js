import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Student from '../models/Student.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hostelmanix');
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    await connectDB();

    // Create Admin User
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const admin = new User({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Admin user created:');
      console.log('   Username: admin');
      console.log('   Password: admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create Student User
    const studentExists = await User.findOne({ username: 'student' });
    if (!studentExists) {
      const studentUser = new User({
        username: 'student',
        password: 'student123',
        role: 'student',
        studentId: 'STU001'
      });
      await studentUser.save();

      // Create Student Profile
      const studentProfile = new Student({
        studentId: 'STU001',
        name: 'John Doe',
        email: 'student@hostel.com',
        phone: '1234567890',
        userId: studentUser._id
      });
      await studentProfile.save();

      console.log('✅ Student user created:');
      console.log('   Username: student');
      console.log('   Password: student123');
      console.log('   Student ID: STU001');
    } else {
      console.log('ℹ️  Student user already exists');
    }

    console.log('\n📝 Login Credentials:');
    console.log('\nAdmin Panel:');
    console.log('   Role: Admin');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('\nStudent Portal:');
    console.log('   Role: Student');
    console.log('   Username: student');
    console.log('   Password: student123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();

