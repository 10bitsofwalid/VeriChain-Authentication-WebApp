import { Schema, model, Document, Types } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  category: string;
  sku: string;
  factory: Types.ObjectId;
  imageUrl: string;
  certificateUrl?: string;
  specs: Map<string, string>;
  verifiedStatus: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    sku: { type: String, required: true, unique: true },
    factory: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    imageUrl: { type: String, required: true },
    certificateUrl: { type: String },
    specs: { type: Map, of: String, default: {} },
    verifiedStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export const Product = model<IProduct>('Product', ProductSchema);
