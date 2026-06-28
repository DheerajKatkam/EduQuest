import express from 'express';
import { query } from '../db/db.js';
import { authenticateToken } from './auth.js';
import { getAIExplanation } from '../services/groq.js';

const router = express.Router();

// Get all subjects and include user progress summaries
router.get('/subjects', authenticateToken, async (req, res) => {
  try {
    const subjects = await query('SELECT * FROM subjects');
    const userId = req.user.id;

    const subjectsWithProgress = [];
    for (const sub of subjects) {
      // Count total levels for this subject
      const totalLevelsRes = await query(
        'SELECT count(*) as count FROM levels WHERE subject_id = ?',
        [sub.id]
      );
      const totalLevels = parseInt(totalLevelsRes[0].count);

      // Count completed levels for this user in this subject
      const completedLevelsRes = await query(
        `SELECT count(up.id) as count 
         FROM user_progress up 
         JOIN levels l ON up.level_id = l.id 
         WHERE up.user_id = ? AND l.subject_id = ? AND up.completed = 1`,
        [userId, sub.id]
      );
      const completedLevels = parseInt(completedLevelsRes[0].count);

      subjectsWithProgress.push({
        id: sub.id,
        name: sub.name,
        totalLevels,
        completedLevels
      });
    }

    res.json(subjectsWithProgress);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ error: 'Server error fetching subjects' });
  }
});

// Get levels for a specific subject with completion status
router.get('/subjects/:subjectId/levels', authenticateToken, async (req, res) => {
  const { subjectId } = req.params;
  const userId = req.user.id;

  try {
    const levels = await query(
      'SELECT id, difficulty, xp_reward FROM levels WHERE subject_id = ? ORDER BY id ASC',
      [subjectId]
    );

    const levelsWithProgress = [];
    for (const lvl of levels) {
      const progress = await query(
        'SELECT completed FROM user_progress WHERE user_id = ? AND level_id = ?',
        [userId, lvl.id]
      );

      levelsWithProgress.push({
        id: lvl.id,
        difficulty: lvl.difficulty,
        xpReward: lvl.xp_reward,
        isCompleted: progress.length > 0 ? !!progress[0].completed : false
      });
    }

    res.json(levelsWithProgress);
  } catch (error) {
    console.error('Error fetching levels:', error);
    res.status(500).json({ error: 'Server error fetching levels' });
  }
});

// Get gameplay questions for a level (without correct answers to prevent cheats)
router.get('/levels/:levelId/questions', authenticateToken, async (req, res) => {
  const { levelId } = req.params;

  try {
    const questions = await query(
      'SELECT id, text, options FROM questions WHERE level_id = ? ORDER BY id ASC',
      [levelId]
    );

    // Parse options string back to JSON array
    const formattedQuestions = questions.map(q => ({
      id: q.id,
      text: q.text,
      options: JSON.parse(q.options)
    }));

    res.json(formattedQuestions);
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Server error fetching questions' });
  }
});

// Check a specific question answer (Secure backend grading)
router.post('/questions/:questionId/check', authenticateToken, async (req, res) => {
  const { questionId } = req.params;
  const { selectedOption } = req.body;

  if (selectedOption === undefined) {
    return res.status(400).json({ error: 'selectedOption index is required' });
  }

  try {
    const qList = await query(
      'SELECT correct_option, explanation FROM questions WHERE id = ?',
      [questionId]
    );

    if (qList.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const question = qList[0];
    const isCorrect = question.correct_option === parseInt(selectedOption);

    res.json({
      isCorrect,
      correctOption: question.correct_option,
      explanation: question.explanation
    });
  } catch (error) {
    console.error('Error checking answer:', error);
    res.status(500).json({ error: 'Server error checking answer' });
  }
});

// Complete a level & Reward XP
router.post('/levels/:levelId/complete', authenticateToken, async (req, res) => {
  const { levelId } = req.params;
  const userId = req.user.id;

  try {
    // 1. Get level details
    const levels = await query('SELECT xp_reward FROM levels WHERE id = ?', [levelId]);
    if (levels.length === 0) {
      return res.status(404).json({ error: 'Level not found' });
    }

    const xpReward = levels[0].xp_reward;

    // 2. Check if level was already completed by this user
    const existingProgress = await query(
      'SELECT completed FROM user_progress WHERE user_id = ? AND level_id = ?',
      [userId, levelId]
    );

    let isFirstTimeCompletion = true;
    if (existingProgress.length > 0) {
      isFirstTimeCompletion = false;
      // If already completed, don't reward XP again
      await query(
        'UPDATE user_progress SET completed_at = CURRENT_TIMESTAMP WHERE user_id = ? AND level_id = ?',
        [userId, levelId]
      );
    } else {
      // Record new completion
      await query(
        'INSERT INTO user_progress (user_id, level_id, completed, xp_earned) VALUES (?, ?, 1, ?)',
        [userId, levelId, xpReward]
      );
    }

    // 3. Update user total XP and Level (only if first time)
    const userResult = await query('SELECT total_xp, level FROM users WHERE id = ?', [userId]);
    let currentXp = userResult[0].total_xp;
    let currentLevel = userResult[0].level;
    let xpEarnedThisTime = 0;
    let leveledUp = false;

    if (isFirstTimeCompletion) {
      currentXp += xpReward;
      xpEarnedThisTime = xpReward;
      
      // Level progression curve: 500 XP per level
      const newLevel = Math.floor(currentXp / 500) + 1;
      if (newLevel > currentLevel) {
        currentLevel = newLevel;
        leveledUp = true;
      }

      await query(
        'UPDATE users SET total_xp = ?, level = ? WHERE id = ?',
        [currentXp, currentLevel, userId]
      );
    }

    res.json({
      message: isFirstTimeCompletion ? 'Level completed! XP rewarded.' : 'Level completed again (No duplicate XP awarded).',
      xpEarned: xpEarnedThisTime,
      totalXp: currentXp,
      level: currentLevel,
      leveledUp
    });
  } catch (error) {
    console.error('Error completing level:', error);
    res.status(500).json({ error: 'Server error completing level' });
  }
});

// Fetch Hint from Groq AI Tutor
router.post('/questions/:questionId/hint', authenticateToken, async (req, res) => {
  const { questionId } = req.params;

  try {
    // Get question and subject details
    const qDetails = await query(
      `SELECT q.text, q.explanation, s.name as subject 
       FROM questions q
       JOIN levels l ON q.level_id = l.id
       JOIN subjects s ON l.subject_id = s.id
       WHERE q.id = ?`,
      [questionId]
    );

    if (qDetails.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    const { text, explanation, subject } = qDetails[0];

    // Generate explanation via Groq (falls back to mock automatically if key isn't set)
    const hintText = await getAIExplanation(subject, text, explanation);

    res.json({ hint: hintText });
  } catch (error) {
    console.error('Error generating AI hint:', error);
    res.status(500).json({ error: 'Server error generating hint' });
  }
});

export default router;
