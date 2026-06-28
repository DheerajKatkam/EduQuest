import pg from 'pg';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import seedAchievements from "../seed/achievements.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../../eduquest.db');

let pgPool = null;
let sqliteDb = null;
let isPostgres = false;

// Initialize the database connection
if (process.env.DATABASE_URL) {
  console.log('Connecting to PostgreSQL database...');
  pgPool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  isPostgres = true;
} else {
  console.log(`Connecting to local SQLite database at: ${dbPath}`);
  sqliteDb = new sqlite3.Database(dbPath);
  isPostgres = false;
}

// Unified query wrapper
export function query(sql, params = []) {
  if (isPostgres) {
    // pg uses $1, $2, $3 for params. Let's make it compatible.
    // If the SQL contains SQLite-style '?', we convert it to PostgreSQL-style '$n'
    let pgSql = sql;
    let count = 1;
    while (pgSql.includes('?')) {
      pgSql = pgSql.replace('?', `$${count}`);
      count++;
    }
    return pgPool.query(pgSql, params).then(res => res.rows);
  } else {
    return new Promise((resolve, reject) => {
      // For SQLite, determine query type
      const normalizedSql = sql.trim().toLowerCase();
      if (normalizedSql.startsWith('select') || normalizedSql.includes('returning')) {
        sqliteDb.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        sqliteDb.run(sql, params, function (err) {
          if (err) reject(err);
          else {
            // Return an object that mimics postgres rows or insert metadata
            resolve([{ id: this.lastID, changes: this.changes }]);
          }
        });
      }
    });
  }
}

// Helper to run raw migration statements
function runRaw(sql) {
  if (isPostgres) {
    return pgPool.query(sql);
  } else {
    return new Promise((resolve, reject) => {
      sqliteDb.exec(sql, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

// Initialize tables
export async function initDatabase() {
  const pgSchema = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      character VARCHAR(255) DEFAULT 'warrior_m',
      total_xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      streak INTEGER DEFAULT 0,
      last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS characters (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      gender VARCHAR(50) NOT NULL,
      avatar_id VARCHAR(255) UNIQUE NOT NULL,
      unlock_xp INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS levels (
      id SERIAL PRIMARY KEY,
      subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
      difficulty VARCHAR(50) NOT NULL,
      xp_reward INTEGER DEFAULT 100
    );

    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      options TEXT NOT NULL, -- JSON string array
      correct_option INTEGER NOT NULL,
      explanation TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
      completed BOOLEAN DEFAULT TRUE,
      xp_earned INTEGER DEFAULT 0,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, level_id)
    );

    CREATE TABLE IF NOT EXISTS friends (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted'
      UNIQUE(user_id, friend_id)
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT NOT NULL,
      icon VARCHAR(255),
      criteria JSONB
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
      unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, achievement_id)
    );
  `;

  const sqliteSchema = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      character TEXT DEFAULT 'warrior_m',
      total_xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      streak INTEGER DEFAULT 0,
      last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      gender TEXT NOT NULL,
      avatar_id TEXT UNIQUE NOT NULL,
      unlock_xp INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS levels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
      difficulty TEXT NOT NULL,
      xp_reward INTEGER DEFAULT 100
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      options TEXT NOT NULL, -- JSON string
      correct_option INTEGER NOT NULL,
      explanation TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      level_id INTEGER REFERENCES levels(id) ON DELETE CASCADE,
      completed BOOLEAN DEFAULT 1,
      xp_earned INTEGER DEFAULT 0,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, level_id)
    );

    CREATE TABLE IF NOT EXISTS friends (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      friend_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      status TEXT DEFAULT 'pending',
      UNIQUE(user_id, friend_id)
    );

    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      icon TEXT,
      criteria TEXT
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
      unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, achievement_id)
    );
  `;

  try {
    await runRaw(isPostgres ? pgSchema : sqliteSchema);
    console.log('Database tables successfully initialized!');
    
    // Seed initial characters and levels if database is empty
    await seedInitialData();
    // Seed default achievements
    await seedAchievements();
  } catch (err) {
    console.error('Error initializing database tables:', err);
  }
}

// Function to seed default characters, subjects, and levels if they don't exist
async function seedInitialData() {
  const chars = await query('SELECT count(*) as count FROM characters');
  if (parseInt(chars[0].count) === 0) {
    console.log('Seeding initial characters...');
    const characters = [
      { name: 'Warrior Male', gender: 'male', avatar_id: 'warrior_m', unlock_xp: 0 },
      { name: 'Warrior Female', gender: 'female', avatar_id: 'warrior_f', unlock_xp: 0 },
      { name: 'Mage Male', gender: 'male', avatar_id: 'mage_m', unlock_xp: 500 },
      { name: 'Mage Female', gender: 'female', avatar_id: 'mage_f', unlock_xp: 500 },
      { name: 'Rogue Male', gender: 'male', avatar_id: 'rogue_m', unlock_xp: 1000 },
      { name: 'Rogue Female', gender: 'female', avatar_id: 'rogue_f', unlock_xp: 1000 },
      { name: 'Cyberpunk Male', gender: 'male', avatar_id: 'cyber_m', unlock_xp: 2500 },
      { name: 'Cyberpunk Female', gender: 'female', avatar_id: 'cyber_f', unlock_xp: 2500 }
    ];

    for (const char of characters) {
      await query(
        'INSERT INTO characters (name, gender, avatar_id, unlock_xp) VALUES (?, ?, ?, ?)',
        [char.name, char.gender, char.avatar_id, char.unlock_xp]
      );
    }
  }

  const subs = await query('SELECT count(*) as count FROM subjects');
  if (parseInt(subs[0].count) === 0) {
    console.log('Seeding initial subjects, levels, and questions...');
    
    const subjectList = ['Math', 'Science', 'History', 'Languages'];
    
    for (const subName of subjectList) {
      const res = await query('INSERT INTO subjects (name) VALUES (?) RETURNING id', [subName]);
      const subjectId = res[0].id;
      
      // Add Easy and Medium levels for each subject
      const levels = [
        { difficulty: 'Easy', xp_reward: 100 },
        { difficulty: 'Medium', xp_reward: 200 }
      ];
      
      for (const lvl of levels) {
        const lvlRes = await query(
          'INSERT INTO levels (subject_id, difficulty, xp_reward) VALUES (?, ?, ?) RETURNING id',
          [subjectId, lvl.difficulty, lvl.xp_reward]
        );
        const levelId = lvlRes[0].id;
        
        // Add 3 sample questions for each level
        let questions = [];
        if (subName === 'Math') {
          if (lvl.difficulty === 'Easy') {
            questions = [
              {
                text: 'What is 15 + 27?',
                options: JSON.stringify(['32', '42', '45', '52']),
                correct_option: 1,
                explanation: '15 + 27 can be calculated by adding 10 + 20 = 30 and 5 + 7 = 12. Then 30 + 12 = 42.'
              },
              {
                text: 'What is 8 x 7?',
                options: JSON.stringify(['48', '54', '56', '64']),
                correct_option: 2,
                explanation: '8 multiplied by 7 is equal to 56.'
              },
              {
                text: 'Solve for x: x - 5 = 12.',
                options: JSON.stringify(['7', '17', '15', '22']),
                correct_option: 1,
                explanation: 'Add 5 to both sides: x = 12 + 5, which gives x = 17.'
              }
            ];
          } else {
            questions = [
              {
                text: 'What is the square root of 144?',
                options: JSON.stringify(['10', '12', '14', '16']),
                correct_option: 1,
                explanation: 'The square root of 144 is 12 because 12 * 12 = 144.'
              },
              {
                text: 'What is the value of 3^4 (3 to the power of 4)?',
                options: JSON.stringify(['27', '64', '81', '243']),
                correct_option: 2,
                explanation: '3^4 is 3 * 3 * 3 * 3 = 81.'
              },
              {
                text: 'If a triangle has angles of 50 degrees and 60 degrees, what is the third angle?',
                options: JSON.stringify(['70 degrees', '80 degrees', '90 degrees', '100 degrees']),
                correct_option: 0,
                explanation: 'The angles of a triangle always add up to 180 degrees. 180 - (50 + 60) = 70 degrees.'
              }
            ];
          }
        } else if (subName === 'Science') {
          if (lvl.difficulty === 'Easy') {
            questions = [
              {
                text: 'Which planet is known as the Red Planet?',
                options: JSON.stringify(['Venus', 'Mars', 'Jupiter', 'Saturn']),
                correct_option: 1,
                explanation: 'Mars is covered in iron oxide (rust) which gives it a distinct red appearance.'
              },
              {
                text: 'What is the chemical symbol for Water?',
                options: JSON.stringify(['H2O', 'CO2', 'O2', 'NaCl']),
                correct_option: 0,
                explanation: 'Water consists of two Hydrogen atoms and one Oxygen atom, represented as H2O.'
              },
              {
                text: 'What force pulls objects toward the center of the Earth?',
                options: JSON.stringify(['Friction', 'Magnetism', 'Gravity', 'Centrifugal force']),
                correct_option: 2,
                explanation: 'Gravity is the invisible force that pulls objects toward each other.'
              }
            ];
          } else {
            questions = [
              {
                text: 'What is the process by which plants make their own food?',
                options: JSON.stringify(['Respiration', 'Transpiration', 'Photosynthesis', 'Fermentation']),
                correct_option: 2,
                explanation: 'Photosynthesis is the process plants use to convert light, carbon dioxide, and water into glucose and oxygen.'
              },
              {
                text: 'What is the powerhouse of the cell?',
                options: JSON.stringify(['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi Apparatus']),
                correct_option: 2,
                explanation: 'Mitochondria generate chemical energy (ATP) for the cell.'
              },
              {
                text: 'Which gas do humans inhale most from the atmosphere?',
                options: JSON.stringify(['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon']),
                correct_option: 1,
                explanation: 'Earth\'s atmosphere is about 78% Nitrogen, making it the most abundant gas we inhale, though our bodies only utilize the Oxygen (21%).'
              }
            ];
          }
        } else if (subName === 'History') {
          if (lvl.difficulty === 'Easy') {
            questions = [
              {
                text: 'Who was the first President of the United States?',
                options: JSON.stringify(['Thomas Jefferson', 'George Washington', 'Abraham Lincoln', 'John Adams']),
                correct_option: 1,
                explanation: 'George Washington served as the first U.S. President from 1789 to 1797.'
              },
              {
                text: 'Which ancient civilization built the pyramids of Giza?',
                options: JSON.stringify(['Ancient Romans', 'Ancient Greeks', 'Ancient Egyptians', 'Mayans']),
                correct_option: 2,
                explanation: 'The Giza pyramids were built as tombs for ancient Egyptian pharaohs.'
              },
              {
                text: 'In which year did World War II end?',
                options: JSON.stringify(['1918', '1939', '1945', '1950']),
                correct_option: 2,
                explanation: 'World War II officially concluded in September 1945.'
              }
            ];
          } else {
            questions = [
              {
                text: 'Who painted the Mona Lisa?',
                options: JSON.stringify(['Michelangelo', 'Leonardo da Vinci', 'Raphael', 'Vincent van Gogh']),
                correct_option: 1,
                explanation: 'Leonardo da Vinci painted the Mona Lisa in the early 16th century.'
              },
              {
                text: 'What was the historical document signed in 1215 that limited the English King\'s power?',
                options: JSON.stringify(['The Declaration of Independence', 'The Magna Carta', 'The Bill of Rights', 'The Treaty of Versailles']),
                correct_option: 1,
                explanation: 'The Magna Carta (Great Charter) established the principle that everyone, including the king, is subject to the law.'
              },
              {
                text: 'Which empire was ruled by Julius Caesar?',
                options: JSON.stringify(['Roman Empire', 'Grecian Empire', 'Ottoman Empire', 'British Empire']),
                correct_option: 0,
                explanation: 'Julius Caesar was a Roman general and statesman who led the Roman Republic, paving the way for the Roman Empire.'
              }
            ];
          }
        } else if (subName === 'Languages') {
          if (lvl.difficulty === 'Easy') {
            questions = [
              {
                text: 'What is the Spanish word for "Friend"?',
                options: JSON.stringify(['Amigo', 'Hola', 'Adios', 'Perro']),
                correct_option: 0,
                explanation: '"Amigo" is the Spanish translation for friend.'
              },
              {
                text: 'Translate the French greeting "Bonjour" to English.',
                options: JSON.stringify(['Goodbye', 'Hello / Good morning', 'Thank you', 'Please']),
                correct_option: 1,
                explanation: '"Bonjour" is the standard French greeting meaning Hello or Good morning.'
              },
              {
                text: 'Identify the verb in the sentence: "The quick cat jumps over the dog."',
                options: JSON.stringify(['quick', 'cat', 'jumps', 'dog']),
                correct_option: 2,
                explanation: '"jumps" is the action word (verb) in this sentence.'
              }
            ];
          } else {
            questions = [
              {
                text: 'What is the German word for "Thank you"?',
                options: JSON.stringify(['Bitte', 'Danke', 'Ja', 'Nein']),
                correct_option: 1,
                explanation: '"Danke" is the German word for thank you. "Bitte" means please.'
              },
              {
                text: 'Which of the following is a Japanese writing script?',
                options: JSON.stringify(['Hiragana', 'Pinyin', 'Hangul', 'Cyrillic']),
                correct_option: 0,
                explanation: 'Hiragana is one of the three character sets used in Japanese writing. Pinyin is Chinese, Hangul is Korean, and Cyrillic is Russian.'
              },
              {
                text: 'What does the idiom "Break a leg" mean?',
                options: JSON.stringify(['To hurt yourself', 'Good luck', 'To run fast', 'To stop trying']),
                correct_option: 1,
                explanation: '"Break a leg" is a theatrical idiom wishing a performer good luck before a show.'
              }
            ];
          }
        }
        
        for (const q of questions) {
          await query(
            'INSERT INTO questions (level_id, text, options, correct_option, explanation) VALUES (?, ?, ?, ?, ?)',
            [levelId, q.text, q.options, q.correct_option, q.explanation]
          );
        }
      }
    }
  }
}
