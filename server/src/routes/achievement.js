import express from 'express';
import Achievement from '../models/achievement.js';
import UserAchievement from '../models/userAchievement.js';
import { query } from '../db/db.js';

const router = express.Router();

// List all achievements
router.get('/', async (req, res) => {
  try {
    const achievements = await Achievement.listAll();
    res.json(achievements);
  } catch (err) {
    console.error('Error listing achievements', err);
    res.status(500).json({ error: 'Failed to list achievements' });
  }
});

// Create a new achievement (admin endpoint)
router.post('/', async (req, res) => {
  const { name, description, icon, criteria } = req.body;
  if (!name || !description || !icon || !criteria) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const id = await Achievement.create(name, description, icon, criteria);
    res.status(201).json({ id });
  } catch (err) {
    console.error('Error creating achievement', err);
    res.status(500).json({ error: 'Failed to create achievement' });
  }
});

// Award achievement to a user based on criteria (e.g., streak)
router.post('/award', async (req, res) => {
  const { userId, type, value } = req.body;
  if (!userId || !type || value == null) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    // Find matching achievement definition
    const matches = await Achievement.findByCriteria(type, value);
    if (!matches.length) {
      return res.status(404).json({ error: 'No achievement matches criteria' });
    }
    const achievementId = matches[0].id;
    // Check if already awarded, if not insert
    const existing = await UserAchievement.findByUserAndAchievement(userId, achievementId);
    if (!existing) {
      await UserAchievement.create(userId, achievementId);
    }
    res.json({ message: 'Achievement awarded', achievementId });
  } catch (err) {
    console.error('Error awarding achievement', err);
    res.status(500).json({ error: 'Failed to award achievement' });
  }
});

export default router;
