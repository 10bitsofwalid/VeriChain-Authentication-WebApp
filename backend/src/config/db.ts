import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dns from 'dns';

// Ensure robust DNS resolution for mongodb+srv connection strings on Windows & diverse networks
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (dnsErr) {
  console.warn('Custom DNS servers setup skipped:', dnsErr);
}

export const connectDB = async (): Promise<void> => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/verichain';
    mongoose.set('strictQuery', true);

    // Mongoose connection event listeners
    mongoose.connection.on('connected', () => {
      console.log(`[MongoDB] Connected to database: "${mongoose.connection.name}" at ${mongoose.connection.host}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error('[MongoDB] Connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from database');
    });

    await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(`[MongoDB] Initial connection established successfully.`);
  } catch (error) {
    console.error(`[MongoDB] Fatal error connecting to MongoDB:`, error);
    process.exit(1);
  }
};
