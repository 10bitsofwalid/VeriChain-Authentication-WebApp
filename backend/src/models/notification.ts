import { Schema, model, Document } from 'mongoose';

export interface INotification extends Document {
  userId: string; // reference to User._id
  category: 'order' | 'verification' | 'complaint' | 'recall' | 'seller' | 'factory' | 'system';
  type: string; // e.g., 'order_placed', 'verification_failed'
  title: string;
  description: string;
  link?: string; // URL to navigate when clicked
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true, index: true },
    category: {
      type: String,
      enum: ['order', 'verification', 'complaint', 'recall', 'seller', 'factory', 'system'],
      required: true,
    },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String },
    read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Notification = model<INotification>('Notification', NotificationSchema);
