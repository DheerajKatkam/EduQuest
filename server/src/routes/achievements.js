// server/src/routes/achievements.js
import express from 'express';
import Achievement from '../models/achievement.js';
import UserAchievement from '../models/userAchievement.js';

const router = express.Router();

// Get all achievement definitions
router.get('/', async (req, res) => {
  try {
    const list = await Achievement.listAll();
    res.json(list);
  } catch (err) {
    console.error('Error fetching achievements', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Unlock an achievement for a user
router.post('/unlock', async (req, res) => {
  const { userId, achievementId } = req.body;
  if (!userId || !achievementId) {
    return res.status(400).json({ error: 'userId and achievementId required' });
  }
  try {
    // check if already unlocked
    const existing = await UserAchievement.findByUserAndAchievement(userId, achievementId);
    if (existing) {
      return res.status(200).json({ message: 'Already unlocked' });
    }
    await UserAchievement.create(userId, achievementId);
    res.status(201).json({ message: 'Achievement unlocked' });
  } catch (err) {
    console.error('Unlock error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
