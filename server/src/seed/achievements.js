import { query } from "../db/db.js";

/**
 * Seed default achievements into the database.
 * Currently adds a 7‑day streak achievement.
 */
export default async function seedAchievements() {
  try {
    const res = await query('SELECT count(*) as count FROM achievements');
    if (parseInt(res[0].count) > 0) {
      console.log('Achievements already seeded.');
      return;
    }
    console.log('Seeding default achievements...');
    await query(
      `INSERT INTO achievements (name, description, icon, criteria) VALUES (?, ?, ?, ?)`,
      [
        '7‑Day Streak',
        'Log in for 7 consecutive days to earn this badge.',
        'streak7.png',
        JSON.stringify({ type: 'streak', days: 7 })
      ]
    );
    console.log('Default achievements seeded.');
  } catch (err) {
    console.error('Error seeding achievements:', err);
  }
}
