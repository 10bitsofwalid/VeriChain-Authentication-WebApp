import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/moderator', moderatorRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
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
