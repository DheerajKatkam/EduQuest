import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db/db.js';
import authRoutes from './routes/auth.js';
import gameRoutes from './routes/levels.js';
import socialRoutes from './routes/social.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // Allow all client connections for local development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// API route registry
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/social', socialRoutes);
// Achievement routes
import achievementRoutes from './routes/achievements.js';
app.use('/api/achievement', achievementRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'EduQuest API', timestamp: new Date() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({ error: 'Internal server error occurred' });
});

// Initialize database and start listening
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(` EduQuest Express Server is running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('Failed to start server during DB initialization:', error);
    process.exit(1);
  }
}

startServer();
