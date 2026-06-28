import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/db.js';
import UserAchievement from '../models/userAchievement.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'eduquest_secret_key_13579';

// Middleware to protect routes
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Helper to check and update login streaks
async function updateLoginStreak(userId) {
  try {
    const users = await query('SELECT last_login, streak FROM users WHERE id = ?', [userId]);
    if (users.length === 0) return;

    const user = users[0];
    const now = new Date();
    const lastLogin = new Date(user.last_login);

    // Calculate difference in calendar days
    const diffTime = Math.abs(now - lastLogin);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = user.streak;

    if (diffDays === 1) {
      // Logged in exactly the next day
      newStreak += 1;
    } else if (diffDays > 1) {
      // Missed a day, reset streak
      newStreak = 1;
    } else if (user.streak === 0) {
      // Brand new user login
      newStreak = 1;
    }
    // If diffDays is 0 (logged in multiple times today), keep the current streak

    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP, streak = ? WHERE id = ?',
      [newStreak, userId]
    );
  } catch (error) {
    console.error('Failed to update login streak:', error);
  }
}

// User Registration (Signup)
router.post('/register', async (req, res) => {
  const { username, email, password, character } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required' });
  }

  try {
    // Check if username or email already exists
    const existing = await query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Username or email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default character
    const chosenCharacter = character || 'warrior_m';

    // Insert user (SQLite/PostgreSQL compatible returning)
    const result = await query(
      'INSERT INTO users (username, email, password, character, total_xp, level, streak, last_login) VALUES (?, ?, ?, ?, 0, 1, 1, CURRENT_TIMESTAMP) RETURNING id',
      [username, email, hashedPassword, chosenCharacter]
    );

    const userId = result[0].id;

    // Generate JWT
    const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        username,
        email,
        character: chosenCharacter,
        totalXP: 0,
        level: 1,
        streak: 1
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// User Login
router.post('/login', async (req, res) => {
  const { usernameOrEmail, password } = req.body;

  if (!usernameOrEmail || !password) {
    return res.status(400).json({ error: 'Username/Email and password are required' });
  }

  try {
    // Fetch user
    const users = await query(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [usernameOrEmail, usernameOrEmail]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid username/email or password' });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid username/email or password' });
    }

    // Update streak
    await updateLoginStreak(user.id);

    // Fetch updated user stats
    const updatedUsers = await query('SELECT * FROM users WHERE id = ?', [user.id]);
    const updatedUser = updatedUsers[0];

    // Generate JWT
    const token = jwt.sign({ id: updatedUser.id, username: updatedUser.username }, JWT_SECRET, { expiresIn: '7d' });

    // Check for 7‑day streak achievement
    if (updatedUser.streak >= 7) {
      const achRows = await query("SELECT * FROM achievements WHERE name = '7‑Day Streak'", []);
      if (achRows.length > 0) {
        const achId = achRows[0].id;
        const already = await UserAchievement.findByUserAndAchievement(updatedUser.id, achId);
        if (!already) {
          await UserAchievement.create(updatedUser.id, achId);
        }
      }
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        character: updatedUser.character,
        totalXP: updatedUser.total_xp,
        level: updatedUser.level,
        streak: updatedUser.streak
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get Current User Profile Info
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const users = await query(
      'SELECT id, username, email, character, total_xp, level, streak, last_login FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      character: user.character,
      totalXP: user.total_xp,
      level: user.level,
      streak: user.streak,
      lastLogin: user.last_login
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// Update Profile Avatar
router.put('/profile/avatar', authenticateToken, async (req, res) => {
  const { avatarId } = req.body;

  if (!avatarId) {
    return res.status(400).json({ error: 'avatarId is required' });
  }

  try {
    // Check if character exists
    const chars = await query('SELECT * FROM characters WHERE avatar_id = ?', [avatarId]);
    if (chars.length === 0) {
      return res.status(404).json({ error: 'Character avatar not found' });
    }

    const char = chars[0];

    // Fetch user XP to check if unlocked
    const users = await query('SELECT total_xp FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (users[0].total_xp < char.unlock_xp) {
      return res.status(403).json({ error: `This avatar requires ${char.unlock_xp} XP to unlock` });
    }

    // Update user's avatar
    await query('UPDATE users SET character = ? WHERE id = ?', [avatarId, req.user.id]);

    res.json({
      message: 'Avatar updated successfully',
      character: avatarId
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({ error: 'Server error updating avatar' });
  }
});

// Fetch Available Characters and unlock status
router.get('/characters', authenticateToken, async (req, res) => {
  try {
    const chars = await query('SELECT * FROM characters ORDER BY unlock_xp ASC');
    const user = await query('SELECT total_xp FROM users WHERE id = ?', [req.user.id]);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userXP = user[0].total_xp;

    const characterList = chars.map(c => ({
      id: c.id,
      name: c.name,
      gender: c.gender,
      avatarId: c.avatar_id,
      unlockXp: c.unlock_xp,
      isUnlocked: userXP >= c.unlock_xp
    }));

    res.json(characterList);
  } catch (error) {
    console.error('Characters fetch error:', error);
    res.status(500).json({ error: 'Server error fetching characters' });
  }
});

export default router;
