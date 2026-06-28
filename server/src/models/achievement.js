// server/src/models/achievement.js
import { query } from "../db/db.js";

/**
 * Achievement model utilities
 */
const Achievement = {
  /** Create a new achievement definition */
  create: async (name, description, icon, criteria) => {
    const result = await query(
      `INSERT INTO achievements (name, description, icon, criteria) VALUES (?, ?, ?, ?)`,
      [name, description, icon, JSON.stringify(criteria)]
    );
    // return inserted id
    return result[0]?.id ?? result[0]?.lastID;
  },

  /** Find achievement by criteria (e.g., streak days) */
  findByCriteria: async (type, value) => {
    const rows = await query(
      `SELECT * FROM achievements WHERE json_extract(criteria, '$.type') = ? AND json_extract(criteria, '$.days') = ?`,
      [type, String(value)]
    );
    return rows;
  },

  /** List all achievements */
  listAll: async () => {
    return await query('SELECT * FROM achievements');
  },
};


;

export default Achievement;
