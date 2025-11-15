import express from 'express';
import Maintenance from '../models/Maintenance.js';
import Student from '../models/Student.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all maintenance requests
router.get('/', authenticate, async (req, res) => {
  try {
    const requests = await Maintenance.find()
      .populate('studentId', 'name studentId')
      .populate('resolvedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get maintenance by student
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const requests = await Maintenance.find({ studentId: student._id })
      .populate('resolvedBy', 'username')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single maintenance request
router.get('/:id', authenticate, async (req, res) => {
  try {
    const request = await Maintenance.findById(req.params.id)
      .populate('studentId')
      .populate('resolvedBy', 'username');
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create maintenance request
router.post('/', authenticate, async (req, res) => {
  try {
    // Get student from user token
    const student = await Student.findOne({ userId: req.user.userId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const request = new Maintenance({
      ...req.body,
      studentId: student._id,
      date: new Date()
    });
    await request.save();
    const populatedRequest = await Maintenance.findById(request._id)
      .populate('studentId', 'name studentId')
      .populate('resolvedBy', 'username');
    res.status(201).json(populatedRequest);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update maintenance request
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.body.status === 'resolved') {
      updateData.resolvedAt = new Date();
      updateData.resolvedBy = req.user.userId;
    }

    const request = await Maintenance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('studentId', 'name studentId')
      .populate('resolvedBy', 'username');
    
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }
    res.json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete maintenance request
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const request = await Maintenance.findByIdAndDelete(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }
    res.json({ message: 'Maintenance request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

