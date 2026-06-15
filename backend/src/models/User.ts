import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'buyer' | 'seller' | 'factory' | 'moderator' | 'admin';
  verified: boolean;
  trustScore: number;
  logoUrl?: string;
  certificateUrl?: string;
  factoryDetails?: {
    location: string;
    capacity: string;
    certificateNo: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['buyer', 'seller', 'factory', 'moderator', 'admin'],
      required: true,
    },
    verified: { type: Boolean, default: false },
    trustScore: { type: Number, default: 100, min: 0, max: 100 },
    logoUrl: { type: String },
    certificateUrl: { type: String },
    factoryDetails: {
      location: { type: String },
      capacity: { type: String },
      certificateNo: { type: String },
    },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', UserSchema);
