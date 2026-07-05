import { Schema, model, Document, Types } from 'mongoose';

export interface IReview extends Document {
  product: Types.ObjectId;
  user: Types.ObjectId;
  itemInstance: Types.ObjectId; // reference to the purchased order/item
  rating: number; // 1-5
  title: string;
  text: string;
  images: string[]; // URLs of uploaded images
  verified: boolean; // always true for verified buyers
  helpfulCount: number; // denormalized count of helpful votes
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    itemInstance: { type: Schema.Types.ObjectId, ref: 'ItemInstance', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: { type: String, required: true },
    text: { type: String, required: true },
    images: [{ type: String }],
    verified: { type: Boolean, default: true },
    helpfulCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Review = model<IReview>('Review', ReviewSchema);
