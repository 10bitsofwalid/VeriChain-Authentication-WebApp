import { Schema, model, Document, Types } from 'mongoose';

export interface IQuestion extends Document {
  product: Types.ObjectId;
  author: Types.ObjectId;
  questionText: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    questionText: { type: String, required: true },
  },
  { timestamps: true }
);

export const Question = model<IQuestion>('Question', QuestionSchema);
