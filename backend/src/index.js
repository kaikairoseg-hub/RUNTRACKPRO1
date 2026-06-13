import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

import activitiesRouter from './routes/activities.js';
import usersRouter from './routes/users.js';
import challengesRouter from './routes/challenges.js';
import leaderboardRouter from './routes/leaderboard.js';
import { initializeTracking } from './sockets/tracking.js';

dotenv.config();

// Disable SSL certificate verification (temporary fix for clock skew issue)
// TODO: Remove this once system clock is fixed
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();
const httpServer = createServer(app);

// Socket.io configuration
const io = new Server(httpServer, {
  cors: {
    origin: [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://192.168.1.105:5173'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://192.168.1.105:5173'
  ],
  credentials: true
}));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/activities', activitiesRouter);
app.use('/api/users', usersRouter);
app.use('/api/challenges', challengesRouter);
app.use('/api/leaderboard', leaderboardRouter);

// Initialize Socket.io tracking
initializeTracking(io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 RunTrack Pro backend running on port ${PORT}`);
  console.log(`📡 Socket.io enabled for real-time tracking`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
});
