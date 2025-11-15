import express from 'express';
import Leave from '../models/Leave.js';
import Student from '../models/Student.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all leaves
router.get('/', authenticate, async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('studentId', 'name studentId')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get leaves by student
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const leaves = await Leave.find({ studentId: student._id })
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single leave
router.get('/:id', authenticate, async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('studentId')
      .populate('reviewedBy', 'username');
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    res.json(leave);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create leave
router.post('/', authenticate, async (req, res) => {
  try {
    // Prefer authenticated user mapping to student profile
    let student = await Student.findOne({ userId: req.user.userId });
    if (!student && req.body.hostelNo) {
      // Fallback for legacy clients sending hostelNo as studentId
      student = await Student.findOne({ studentId: req.body.hostelNo });
    }
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const leave = new Leave({
      ...req.body,
      studentId: student._id,
      appliedOn: new Date()
    });
    await leave.save();
    const populatedLeave = await Leave.findById(leave._id)
      .populate('studentId', 'name studentId')
      .populate('reviewedBy', 'username');
    res.status(201).json(populatedLeave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update leave (approve/reject)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        reviewedBy: req.user.userId,
        reviewedAt: new Date()
      },
      { new: true, runValidators: true }
    )
      .populate('studentId', 'name studentId')
      .populate('reviewedBy', 'username');
    
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    res.json(leave);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete leave
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const leave = await Leave.findByIdAndDelete(req.params.id);
    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }
    res.json({ message: 'Leave deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

