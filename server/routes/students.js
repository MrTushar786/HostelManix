import express from 'express';
import Student from '../models/Student.js';
import Room from '../models/Room.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all students
router.get('/', authenticate, async (req, res) => {
  try {
    const students = await Student.find().populate('roomId userId');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Self profile endpoints MUST be defined before any dynamic :id routes
router.get('/me', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ userId: req.user.userId }).populate('roomId userId');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/me', authenticate, async (req, res) => {
  try {
    const allowed = ['name','email','phone','guardianName','address','photoUrl','year','branch'];
    const update = {};
    for (const key of allowed) {
      if (typeof req.body[key] !== 'undefined') update[key] = req.body[key];
    }
    const student = await Student.findOneAndUpdate(
      { userId: req.user.userId },
      update,
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Get student by studentId
router.get('/by-student-id/:studentId', authenticate, async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId }).populate('roomId userId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get students by room
router.get('/room/:roomId', authenticate, async (req, res) => {
  try {
    const students = await Student.find({ roomId: req.params.roomId }).populate('roomId userId');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single student
router.get('/:id', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('roomId userId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create student
router.post('/', authenticate, async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    
    // If roomId is provided, update the room
    if (student.roomId) {
      const room = await Room.findById(student.roomId);
      if (room) {
        // Add student to room's students array if not already there
        if (!room.students.includes(student._id)) {
          room.students.push(student._id);
          room.occupants = room.students.length;
          // Update status if needed
          if (room.occupants >= room.capacity) {
            room.status = 'occupied';
          } else if (room.occupants > 0) {
            room.status = 'occupied';
          }
          await room.save();
        }
      }
    }
    
    const populated = await Student.findById(student._id).populate('roomId userId');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update student
router.put('/:id', authenticate, async (req, res) => {
  try {
    // Get the old student data to check room changes
    const oldStudent = await Student.findById(req.params.id);
    if (!oldStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const oldRoomId = oldStudent.roomId;
    const newRoomId = req.body.roomId;

    // Update the student
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Handle room changes
    // Remove from old room if room changed
    if (oldRoomId && oldRoomId.toString() !== newRoomId?.toString()) {
      const oldRoom = await Room.findById(oldRoomId);
      if (oldRoom) {
        oldRoom.students = oldRoom.students.filter(
          id => id.toString() !== student._id.toString()
        );
        oldRoom.occupants = oldRoom.students.length;
        if (oldRoom.occupants === 0) {
          oldRoom.status = 'vacant';
        }
        await oldRoom.save();
      }
    }

    // Add to new room if roomId is provided and different from old
    if (newRoomId && (!oldRoomId || oldRoomId.toString() !== newRoomId.toString())) {
      const newRoom = await Room.findById(newRoomId);
      if (newRoom) {
        // Add student to room's students array if not already there
        if (!newRoom.students.some(id => id.toString() === student._id.toString())) {
          newRoom.students.push(student._id);
          newRoom.occupants = newRoom.students.length;
          // Update status if needed
          if (newRoom.occupants >= newRoom.capacity) {
            newRoom.status = 'occupied';
          } else if (newRoom.occupants > 0) {
            newRoom.status = 'occupied';
          }
          await newRoom.save();
        }
      }
    }

    const populated = await Student.findById(student._id).populate('roomId userId');
    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Remove from room if assigned
    if (student.roomId) {
      const room = await Room.findById(student.roomId);
      if (room) {
        room.students = room.students.filter(
          id => id.toString() !== student._id.toString()
        );
        room.occupants = room.students.length;
        if (room.occupants === 0) {
          room.status = 'vacant';
        }
        await room.save();
      }
    }

    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

