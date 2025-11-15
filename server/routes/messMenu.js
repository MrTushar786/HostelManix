import express from 'express';
import MessMenu from '../models/MessMenu.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get all mess menu
router.get('/', authenticate, async (req, res) => {
  try {
    const menu = await MessMenu.find().sort({ day: 1 });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get menu for specific day
router.get('/:day', authenticate, async (req, res) => {
  try {
    const menu = await MessMenu.findOne({ day: req.params.day.toLowerCase() });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found for this day' });
    }
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update mess menu
router.post('/', authenticate, async (req, res) => {
  try {
    const { day, breakfast, lunch, dinner } = req.body;
    
    const menu = await MessMenu.findOneAndUpdate(
      { day: day.toLowerCase() },
      { breakfast, lunch, dinner },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json(menu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update mess menu
router.put('/:day', authenticate, async (req, res) => {
  try {
    const menu = await MessMenu.findOneAndUpdate(
      { day: req.params.day.toLowerCase() },
      req.body,
      { new: true, runValidators: true }
    );
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found for this day' });
    }
    res.json(menu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete mess menu
router.delete('/:day', authenticate, async (req, res) => {
  try {
    const menu = await MessMenu.findOneAndDelete({ day: req.params.day.toLowerCase() });
    if (!menu) {
      return res.status(404).json({ message: 'Menu not found for this day' });
    }
    res.json({ message: 'Menu deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

