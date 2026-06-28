-- PostgreSQL Schema for EduQuest

-- Drop tables if they exist (for clean rebuilds if needed)
-- DROP TABLE IF EXISTS friends;
-- DROP TABLE IF EXISTS user_progress;
-- DROP TABLE IF EXISTS questions;
-- DROP TABLE IF EXISTS levels;
-- DROP TABLE IF EXISTS subjects;
-- DROP TABLE IF EXISTS characters;
-- DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  character VARCHAR(255) DEFAULT 'warrior_m',
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
locale VARCHAR(10) DEFAULT 'en'
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
  options TEXT NOT NULL, -- JSON string array (e.g. '["Option A", "Option B"]')
  correct_option INTEGER NOT NULL, -- Index of correct option (0-3)
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
  status VARCHAR(50) DEFAULT 'pending', -- 'pending' or 'accepted'
  UNIQUE(user_id, friend_id)
);

-- Achievement tables
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(255) NOT NULL,
  criteria JSONB NOT NULL -- e.g. {"type":"streak","days":7}
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);
