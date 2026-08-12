import dotenv from 'dotenv';
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET environment variable is missing. The server cannot start without it.');
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/error';

import path from 'path';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import itemRoutes from './routes/items';
import complaintRoutes from './routes/complaints';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/uploads';
import moderatorRoutes from './routes/moderator';
import profileRoutes from './routes/profiles';
import reviewsRoutes from './routes/reviews';
import usersRoutes from './routes/users';
import orderRoutes from './routes/orders';
import inquiryRoutes from './routes/inquiries';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const origins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
      : [];
    if (origins.includes(origin)) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV === 'production') {
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/moderator', moderatorRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/inquiries', inquiryRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    status: dbState === 1 ? 'ok' : 'degraded',
    database: {
      status: dbStateMap[dbState] || 'unknown',
      name: mongoose.connection.name || null,
      host: mongoose.connection.host || null,
    },
    timestamp: new Date().toISOString(),
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();
  return app.listen(PORT, () => {
    console.log(`VeriChain API running on port ${PORT}`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, startServer };
