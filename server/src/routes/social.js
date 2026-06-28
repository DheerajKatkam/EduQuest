import express from 'express';
import { query } from '../db/db.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get global leaderboard ranked by XP
router.get('/leaderboard', authenticateToken, async (req, res) => {
  try {
    const players = await query(
      `SELECT id, username, character, total_xp, level, streak
       FROM users
       ORDER BY total_xp DESC
       LIMIT 50`
    );

    // Map database keys to frontend-friendly camelCase
    const rankedLeaderboard = players.map((player, index) => ({
      rank: index + 1,
      id: player.id,
      username: player.username,
      character: player.character,
      totalXP: player.total_xp,
      level: player.level,
      streak: player.streak
    }));

    res.json(rankedLeaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
});

// Get user's friend list (both accepted and pending)
router.get('/friends', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Fetch active (accepted) friends
    // Friends can be stored either way: (userId, friendId) or (friendId, userId)
    const activeFriends = await query(
      `SELECT u.id, u.username, u.character, u.total_xp, u.level, u.streak
       FROM friends f
       JOIN users u ON (f.friend_id = u.id AND f.user_id = ?) OR (f.user_id = u.id AND f.friend_id = ?)
       WHERE f.status = 'accepted'`,
      [userId, userId]
    );

    // 2. Fetch incoming pending requests (where this user is the friend_id)
    const incomingPending = await query(
      `SELECT u.id, u.username, u.character, u.level
       FROM friends f
       JOIN users u ON f.user_id = u.id
       WHERE f.friend_id = ? AND f.status = 'pending'`,
      [userId]
    );

    // 3. Fetch outgoing pending requests (where this user is the user_id)
    const outgoingPending = await query(
      `SELECT u.id, u.username, u.character, u.level
       FROM friends f
       JOIN users u ON f.friend_id = u.id
       WHERE f.user_id = ? AND f.status = 'pending'`,
      [userId]
    );

    res.json({
      friends: activeFriends.map(f => ({
        id: f.id,
        username: f.username,
        character: f.character,
        totalXP: f.total_xp,
        level: f.level,
        streak: f.streak
      })),
      incomingRequests: incomingPending.map(f => ({
        id: f.id,
        username: f.username,
        character: f.character,
        level: f.level
      })),
      outgoingRequests: outgoingPending.map(f => ({
        id: f.id,
        username: f.username,
        character: f.character,
        level: f.level
      }))
    });
  } catch (error) {
    console.error('Error fetching friends:', error);
    res.status(500).json({ error: 'Server error fetching friends list' });
  }
});

// Send a friend request by searching username
router.post('/friends/request', authenticateToken, async (req, res) => {
  const { friendUsername } = req.body;
  const userId = req.user.id;

  if (!friendUsername) {
    return res.status(400).json({ error: 'Username is required' });
  }

  if (friendUsername === req.user.username) {
    return res.status(400).json({ error: 'You cannot friend yourself!' });
  }

  try {
    // Check if target user exists
    const targets = await query('SELECT id FROM users WHERE username = ?', [friendUsername]);
    if (targets.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const friendId = targets[0].id;

    // Check if friendship relationship already exists
    const existing = await query(
      `SELECT id, status, user_id FROM friends 
       WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
      [userId, friendId, friendId, userId]
    );

    if (existing.length > 0) {
      const friendship = existing[0];
      if (friendship.status === 'accepted') {
        return res.status(400).json({ error: 'You are already friends!' });
      } else if (friendship.user_id === userId) {
        return res.status(400).json({ error: 'Friend request already sent and pending.' });
      } else {
        // They sent a request to you already! Let's auto-accept it to make life easy
        await query(
          "UPDATE friends SET status = 'accepted' WHERE id = ?",
          [friendship.id]
        );
        return res.json({ message: 'Friend request accepted automatically!', status: 'accepted' });
      }
    }

    // Insert new pending relationship
    await query(
      "INSERT INTO friends (user_id, friend_id, status) VALUES (?, ?, 'pending')",
      [userId, friendId]
    );

    res.status(201).json({ message: 'Friend request sent!', status: 'pending' });
  } catch (error) {
    console.error('Error sending friend request:', error);
    res.status(500).json({ error: 'Server error sending friend request' });
  }
});

// Accept an incoming friend request
router.post('/friends/accept', authenticateToken, async (req, res) => {
  const { friendId } = req.body;
  const userId = req.user.id;

  if (!friendId) {
    return res.status(400).json({ error: 'friendId is required' });
  }

  try {
    const friendship = await query(
      "SELECT id FROM friends WHERE user_id = ? AND friend_id = ? AND status = 'pending'",
      [friendId, userId] // The friend sent it, so user_id = friendId
    );

    if (friendship.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    await query(
      "UPDATE friends SET status = 'accepted' WHERE id = ?",
      [friendship[0].id]
    );

    res.json({ message: 'Friend request accepted!' });
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Server error accepting friend request' });
  }
});

// Decline or remove a friendship
router.delete('/friends/:friendId', authenticateToken, async (req, res) => {
  const { friendId } = req.params;
  const userId = req.user.id;

  try {
    await query(
      `DELETE FROM friends 
       WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)`,
      [userId, friendId, friendId, userId]
    );

    res.json({ message: 'Friendship or request successfully removed' });
  } catch (error) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: 'Server error removing friend' });
  }
});

export default router;
