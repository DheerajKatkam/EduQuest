# EduQuest 🎮✨

EduQuest is a gamified, browser-based learning platform built entirely with **free tier tools**. It guides students through subjects like Math, Science, History, and Languages via quest paths, awarding XP, unlocking unique character cosmetics, tracking login streaks, and offering direct support via an AI-powered tutor using the free **Groq Llama 3 API**.

---

## 🚀 Core Features & Gamification
- **Character Select Wardrobe**: Choose male/female avatars at signup. Reach XP milestones (500 XP, 1000 XP, 2500 XP) to unlock advanced classes (Mage, Rogue, Cyberpunk).
- **RPG Subject Map Nodes**: Visual quest paths representing level difficulties (Easy, Medium, High, Insane). Completed levels glow green with checkmarks, while higher difficulty levels remain locked until preceding quests are completed.
- **EduBot AI Tutor**: An embedded AI tutor powered by **Groq API** that provides friendly hints and explanations without spoiling the answer.
- **Web Audio API Synth**: Programmatic 8-bit sound effects (click, correct, error, win, level-up) generated dynamically by the browser's audio oscillator.
- **Streaks, XP, and Achievements**: Daily streak tracking, title progression, and unlockable achievements keep players engaged.

---

## 🛠️ Technology Stack (100% Free)
- **Frontend**: React + Tailwind CSS v4 + Vite
- **Backend**: Node.js + Express
- **Database**: PostgreSQL (Production) / SQLite (Zero-config local fallback)
- **AI Engine**: Groq SDK (`llama3-8b-8192`)
- **Session Auth**: JWT (JSON Web Tokens) with local storage

---

## 💻 Getting Started Locally

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Automatic Setup
From the project root, run the setup script to install dependencies for both `/server` and `/client` in one go:
```bash
npm run setup
```

### 3. Running the App
We have configured double-prefix scripts in the root directory. You will need to run the **server** and **client** simultaneously.

- **Start Express Backend**:
  ```bash
  npm run server:dev
  ```
  *The server will start on [http://localhost:5000](http://localhost:5000) and automatically provision `server/eduquest.db` (SQLite) and seed default subjects, levels, and questions.*

- **Start Vite React Frontend**:
  ```bash
  npm run client
  ```
  *Open your browser to the local address outputted by Vite (typically [http://localhost:5173](http://localhost:5173)).*

---

## ⚙️ Environment Configuration

### Backend Server (`/server/.env`)
Create/edit the `.env` file in the `server` directory:
- `PORT`: Port the server runs on (defaults to `5000`).
- `JWT_SECRET`: Secret key used to encrypt sessions.
- `GROQ_API_KEY`: Paste your free Groq API key here. **If left blank, the server automatically runs in "Mock AI Mode"**, generating local, static hints so you can test the game without a key.
- `DATABASE_URL`: Provide a PostgreSQL connection string (e.g. from Render/Railway) to connect to Postgres. **If left blank, the server automatically connects to a local SQLite file (`server/eduquest.db`)**, giving you zero-config runs.

---

## 📊 Database Schema Reference
A standalone copy of the database structure is provided in [schema.sql](file:///C:/Users/katka/Desktop/EduQuest/server/src/db/schema.sql) for reference.

- **users**: Player profile data, streaks, and total XP.
- **characters**: Cosmetic visual classes and their unlock XP values.
- **subjects**: Subject containers (Math, Science, History, Languages).
- **levels**: Level containers linking subjects to difficulty tiers.
- **questions**: Multiple-choice items graded securely on the backend.
- **user_progress**: Individual completion logs preventing double-XP claims.
- **friends**: Friendships and invitation states.
