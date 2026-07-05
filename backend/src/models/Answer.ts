import { Schema, model, Document, Types } from 'mongoose';

export interface IAnswer extends Document {
  question: Types.ObjectId;
  author: Types.ObjectId;
  answerText: string;
  isVerified: boolean; // true if author is seller/factory/moderator
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema<IAnswer>(
  {
    question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answerText: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Answer = model<IAnswer>('Answer', AnswerSchema);
