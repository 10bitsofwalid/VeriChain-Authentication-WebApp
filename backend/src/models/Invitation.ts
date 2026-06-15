import { Schema, model, Document, Types } from 'mongoose';

export interface IInvitation extends Document {
  email: string;
  name: string;
  role: 'moderator' | 'admin';
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  invitedBy: Types.ObjectId;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    role: {
      type: String,
      enum: ['moderator', 'admin'],
      required: true,
    },
    token: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired'],
      default: 'pending',
    },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const Invitation = model<IInvitation>('Invitation', InvitationSchema);
