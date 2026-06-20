const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const speakingRoutes = require('./routes/speaking');
const writingRoutes = require('./routes/writing');
const readingRoutes = require('./routes/reading');
const listeningRoutes = require('./routes/listening');
const mockTestRoutes = require('./routes/mockTest');
const aiTutorRoutes = require('./routes/aiTutor');
const adminRoutes = require('./routes/admin');
const vocabularyRoutes = require('./routes/vocabulary');
const diagnosticRoutes = require('./routes/diagnostic');
const pdfRoutes = require('./routes/pdf');
const chatRoutes = require('./routes/chat');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: true, // Allow all origins for dev / proxy
    methods: ['GET', 'POST']
  }
});

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: true,
  credentials: true
}));

// Rate limiting - disabled in development to prevent tunnel/proxy loopback IP blocks
const limiter = process.env.NODE_ENV === 'development'
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: { error: 'Too many requests, please try again later.' }
    });

app.use('/api/', limiter);

// AI endpoints get stricter limits - disabled in development
const aiLimiter = process.env.NODE_ENV === 'development'
  ? (req, res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 30,
      message: { error: 'AI request limit reached. Please wait before trying again.' }
    });

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static PDFs
const path = require('path');
app.use('/pdfs', express.static(path.join(__dirname, '../pdf')));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/speaking', aiLimiter, speakingRoutes);
app.use('/api/writing', aiLimiter, writingRoutes);
app.use('/api/reading', readingRoutes);
app.use('/api/listening', listeningRoutes);
app.use('/api/mock-test', mockTestRoutes);
app.use('/api/ai-tutor', aiLimiter, aiTutorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vocabulary', vocabularyRoutes);
app.use('/api/diagnostic', aiLimiter, diagnosticRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => res.json({status: 'ok'}));
// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection
const Message = require('./models/Message');

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-room', (roomId) => {
    if (!roomId) return;
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId}`);
  });

  socket.on('send-message', async (data) => {
    // data: { sender: string, text: string, recipient?: string, group?: string }
    try {
      const msg = new Message(data);
      await msg.save();
      await msg.populate('sender', 'name');

      if (data.recipient) {
        // Direct message
        io.to(data.recipient).emit('receive-message', msg);
        io.to(data.sender).emit('receive-message', msg); // echo back
      } else if (data.group) {
        // Group message
        io.to(data.group).emit('receive-message', msg);
      }
    } catch (err) {
      console.error('Socket message error:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 IELTS AI Backend running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
});

module.exports = { app, io };
// Trigger nodemon reload with expanded IELTS datasets
