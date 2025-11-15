import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Change password
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ message: 'New password required' });
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'admin') {
      // Students must verify current password
      const ok = await user.comparePassword(currentPassword || '');
      if (!ok) return res.status(401).json({ message: 'Current password incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update my user profile (admin profile)
router.put('/me', authenticate, async (req, res) => {
  try {
    const allowed = ['displayName','email','photoUrl'];
    const update = {};
    for (const key of allowed) {
      if (typeof req.body[key] !== 'undefined') update[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.user.userId, update, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    if (error?.code === 11000) return res.status(400).json({ message: 'Email already in use' });
    res.status(400).json({ message: error.message });
  }
});

export default router;


