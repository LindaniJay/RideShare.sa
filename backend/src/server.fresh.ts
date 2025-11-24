import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config/env';
import { logger } from './utils/logger';
import { sequelize } from './config/database';
import { initializeFirebase } from './config/firebase';

// Import routes
import authRoutes from './routes/auth.routes';
import listingsRoutes from './routes/listings';
import bookingsRoutes from './routes/bookings';
import adminRoutes from './routes/admin';
import notificationsRoutes from './routes/notifications';
import hostRoutes from './routes/host';
import paymentsRoutes from './routes/payments';
import searchRoutes from './routes/search';
import vehiclesRoutes from './routes/enhanced-vehicles';
import documentsRoutes from './routes/documents';
import reviewsRoutes from './routes/reviews';
import analyticsRoutes from './routes/analytics';
import dashboardRoutes from './routes/dashboard';
import usersRoutes from './routes/users';

// Import models to ensure they're registered
import './models/User';
import './models/Listing';
import './models/Booking';
import './models/Notification';
import './models/EnhancedVehicle';

const app = express();
const server = createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new SocketIOServer(server, {
  cors: {
    origin: env.FRONTEND_URLS.split(','),
    methods: ['GET', 'POST'],
    credentials: true
  },
  path: env.SOCKET_IO_PATH
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
  origin: env.FRONTEND_URLS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Firebase-Token']
}));

// Compression and logging
app.use(compression());
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '2.0.0',
    database: 'connected',
    services: {
      firebase: 'connected',
      socketio: 'active',
      redis: 'connected'
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/host', hostRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);

// Placeholder image endpoint
app.get('/api/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  const w = parseInt(width) || 300;
  const h = parseInt(height) || 200;
  
  const svg = `
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="14" fill="#6b7280">
        ${w}x${h}
      </text>
    </svg>
  `;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.send(svg);
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  // Join user-specific room for notifications
  socket.on('join-user-room', (userId: string) => {
    socket.join(`user-${userId}`);
    logger.info(`User ${userId} joined their room`);
  });
  
  // Join admin room for admin notifications
  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    logger.info(`Admin joined admin room`);
  });
  
  // Handle booking notifications
  socket.on('booking-update', (data) => {
    io.to(`user-${data.hostId}`).emit('booking-notification', data);
    io.to(`user-${data.renterId}`).emit('booking-notification', data);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('io', io);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Database and server initialization
const initializeServer = async () => {
  try {
    // Initialize Firebase Admin
    await initializeFirebase();
    logger.info('Firebase Admin initialized');

    // Test database connection
    await sequelize.authenticate();
    logger.info('Database connection established');

    // Sync database models
    if (env.NODE_ENV === 'development') {
      await sequelize.sync({ force: true });
      logger.info('Database models recreated (development mode)');
    } else {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized');
    }

    // Start server
    const port = env.PORT;
    server.listen(port, '0.0.0.0', () => {
      logger.info(`🚀 RideShare.SA Server running on http://localhost:${port}`);
      logger.info(`📱 Environment: ${env.NODE_ENV}`);
      logger.info(`🔗 Frontend URLs: ${env.FRONTEND_URLS}`);
      logger.info(`📊 Socket.io path: ${env.SOCKET_IO_PATH}`);
      logger.info(`🔗 Health check: http://localhost:${port}/api/health`);
      logger.info(`🔌 WebSocket test: http://localhost:${port}/socket.io/`);
      logger.info(`📊 Database: ${env.DATABASE_URL?.split('@')[1] || 'local'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Process terminated');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to initialize server:', error);
    process.exit(1);
  }
};

// Export for testing
export { app, server, io };

// Start server if not in test environment
if (env.NODE_ENV !== 'test') {
  initializeServer();
}

export default app;





















