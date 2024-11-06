import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { StreamManager } from './services/StreamManager.js';
import { setupRoutes } from './routes/index.js';
import { connectDB } from './config/database.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3000;
const streamManager = new StreamManager(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Setup routes
setupRoutes(app, streamManager);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected');
  
  socket.on('subscribe-stream', (streamId) => {
    streamManager.addViewer(streamId, socket.id);
  });

  socket.on('disconnect', () => {
    streamManager.removeViewer(socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();