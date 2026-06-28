// server/src/models/userAchievement.js
import { query } from '../db/db.js';

/**
 * UserAchievement model utilities
 */
const UserAchievement = {
  /** Create a new user_achievement record */
  create: async (userId, achievementId) => {
    const result = await query(
      `INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)`,
      [userId, achievementId]
    );
    // query returns array of rows; for INSERT SQLite returns [{ id, changes }]
    // Return the inserted row id if available
    return result[0]?.id ?? result[0]?.lastID;
  },

  /** Find an existing achievement for a user */
  findByUserAndAchievement: async (userId, achievementId) => {
    const rows = await query(
      `SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?`,
      [userId, achievementId]
    );
    return rows[0] || null;
  },

  /** List all achievements earned by a user */
  listByUser: async (userId) => {
    const rows = await query(
      `SELECT ua.*, a.name, a.description, a.icon FROM user_achievements ua 
       JOIN achievements a ON ua.achievement_id = a.id WHERE ua.user_id = ?`,
      [userId]
    );
    return rows;
  },
};

export default UserAchievement;
