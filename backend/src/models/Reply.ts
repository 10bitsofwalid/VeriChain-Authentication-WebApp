import { Schema, model, Document, Types } from 'mongoose';

export interface IReply extends Document {
  discussion: Types.ObjectId;
  author: Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReplySchema = new Schema<IReply>(
  {
    discussion: { type: Schema.Types.ObjectId, ref: 'Discussion', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export const Reply = model<IReply>('Reply', ReplySchema);
