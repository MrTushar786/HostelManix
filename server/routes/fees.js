import express from 'express';
import Fee from '../models/Fee.js';
import Student from '../models/Student.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get all fees
router.get('/', authenticate, async (req, res) => {
  try {
    const fees = await Fee.find()
      .populate('studentId', 'name studentId roomId')
      .sort({ createdAt: -1 });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get fees by student
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    const fees = await Fee.find({ studentId: student._id }).sort({ createdAt: -1 });
    res.json(fees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single fee
router.get('/:id', authenticate, async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id).populate('studentId');
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    res.json(fee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create fee
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const fee = new Fee(req.body);
    await fee.save();
    const populatedFee = await Fee.findById(fee._id).populate('studentId');
    res.status(201).json(populatedFee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update fee (mark as paid, etc.)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const fee = await Fee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('studentId');
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    res.json(fee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete fee
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const fee = await Fee.findByIdAndDelete(req.params.id);
    if (!fee) {
      return res.status(404).json({ message: 'Fee not found' });
    }
    res.json({ message: 'Fee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

