import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/verichain';
    mongoose.set('strictQuery', true);
    await mongoose.connect(connUri);
    console.log(`MongoDB Connected successfully.`);
  } catch (error) {
    console.error(`Error connecting to MongoDB:`, error);
    process.exit(1);
  }
};
