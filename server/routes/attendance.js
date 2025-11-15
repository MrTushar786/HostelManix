import express from 'express';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all attendance records
router.get('/', authenticate, async (req, res) => {
  try {
    const { studentId, startDate, endDate } = req.query;
    let query = {};
    
    if (studentId) {
      const student = await Student.findOne({ studentId });
      if (student) {
        query.studentId = student._id;
      }
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('studentId', 'name studentId')
      .populate('markedBy', 'username')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance by student
router.get('/student/:studentId', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let query = { studentId: student._id };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(query)
      .populate('markedBy', 'username')
      .sort({ date: -1 });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance stats for a student
router.get('/student/:studentId/stats', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const attendance = await Attendance.find({ studentId: student._id });
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const rate = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    res.json({ total, present, absent, late, rate: parseFloat(rate) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create attendance record
router.post('/', authenticate, async (req, res) => {
  try {
    const { studentId, date, status } = req.body;
    
    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if attendance already exists for this date
    const existing = await Attendance.findOne({
      studentId: student._id,
      date: new Date(date)
    });

    if (existing) {
      // Update existing record
      existing.status = status;
      existing.markedBy = req.user.userId;
      await existing.save();
      const populated = await Attendance.findById(existing._id)
        .populate('studentId', 'name studentId')
        .populate('markedBy', 'username');
      return res.json(populated);
    }

    const attendance = new Attendance({
      studentId: student._id,
      date: new Date(date),
      status,
      markedBy: req.user.userId
    });
    await attendance.save();
    const populated = await Attendance.findById(attendance._id)
      .populate('studentId', 'name studentId')
      .populate('markedBy', 'username');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Bulk create attendance for multiple students (room-wise marking)
router.post('/bulk', authenticate, async (req, res) => {
  try {
    const { studentIds, date, status } = req.body;
    
    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Student IDs array is required' });
    }

    const attendanceDate = new Date(date);
    const results = [];

    for (const studentIdStr of studentIds) {
      const student = await Student.findOne({ studentId: studentIdStr });
      if (!student) {
        results.push({ studentId: studentIdStr, error: 'Student not found' });
        continue;
      }

      // Check if attendance already exists for this date
      const existing = await Attendance.findOne({
        studentId: student._id,
        date: attendanceDate
      });

      if (existing) {
        // Update existing record
        existing.status = status;
        existing.markedBy = req.user.userId;
        await existing.save();
        const populated = await Attendance.findById(existing._id)
          .populate('studentId', 'name studentId')
          .populate('markedBy', 'username');
        results.push({ studentId: studentIdStr, attendance: populated });
      } else {
        // Create new record
        const newAttendance = new Attendance({
          studentId: student._id,
          date: attendanceDate,
          status,
          markedBy: req.user.userId
        });
        await newAttendance.save();
        const populated = await Attendance.findById(newAttendance._id)
          .populate('studentId', 'name studentId')
          .populate('markedBy', 'username');
        results.push({ studentId: studentIdStr, attendance: populated });
      }
    }

    res.status(201).json({ message: 'Bulk attendance marked', results });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update attendance
router.put('/:id', authenticate, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { ...req.body, markedBy: req.user.userId },
      { new: true, runValidators: true }
    )
      .populate('studentId', 'name studentId')
      .populate('markedBy', 'username');
    
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json(attendance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete attendance
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

