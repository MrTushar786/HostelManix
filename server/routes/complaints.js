import express from 'express';
import Complaint from '../models/Complaint.js';
import Student from '../models/Student.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all complaints
router.get('/', authenticate, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('studentId', 'name studentId')
      .populate('resolvedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get complaints by student
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const complaints = await Complaint.find({ studentId: student._id })
      .populate('resolvedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single complaint
router.get('/:id', authenticate, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('studentId')
      .populate('resolvedBy', 'username');
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create complaint
router.post('/', authenticate, async (req, res) => {
  try {
    // Get student from user token
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const complaint = new Complaint({
      ...req.body,
      studentId: student._id,
      submittedAt: new Date()
    });
    await complaint.save();
    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate('studentId', 'name studentId')
      .populate('resolvedBy', 'username');
    res.status(201).json(populatedComplaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update complaint (resolve, etc.)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.status === 'resolved') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = req.user.userId;
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('studentId', 'name studentId')
      .populate('resolvedBy', 'username');
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete complaint
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

