import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { id, password, role } = req.body;

    if (!id || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find user by username/studentId and role
    const user = await User.findOne({
      $or: [
        { username: id },
        { studentId: id }
      ],
      role: role.toLowerCase()
    });

    if (!user) {
      return res.status(401).json({ message: `Incorrect ${role} ID or Password` });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: `Incorrect ${role} ID or Password` });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role, studentId: user.studentId },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
      { expiresIn: '7d' }
    );

    // Get student info if student
    let studentInfo = null;
    if (user.role === 'student' && user.studentId) {
      studentInfo = await Student.findOne({ studentId: user.studentId });
    }

    res.json({
      token,
      user: {
        id: user._id,
        role: user.role,
        studentId: user.studentId,
        studentInfo
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Register (for initial setup)
router.post('/register', async (req, res) => {
  try {
    const { username, password, role, studentId } = req.body;

    const existingUser = await User.findOne({
      $or: [
        { username },
        ...(studentId ? [{ studentId }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      username,
      password,
      role: role.toLowerCase(),
      ...(studentId && { studentId })
    });

    await user.save();

    res.status(201).json({ message: 'User created successfully', userId: user._id });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

export default router;

