import { Schema, model, Document, Types } from 'mongoose';

export interface IDiscussion extends Document {
  product: Types.ObjectId;
  author: Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionSchema = new Schema<IDiscussion>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const Discussion = model<IDiscussion>('Discussion', DiscussionSchema);
