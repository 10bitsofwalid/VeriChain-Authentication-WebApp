import { Schema, model, Document, Types } from 'mongoose';

export interface IReviewVote extends Document {
  review: Types.ObjectId; // reference to Review
  user: Types.ObjectId; // who voted
  type: 'helpful'; // future extensibility
  createdAt: Date;
}

const ReviewVoteSchema = new Schema<IReviewVote>(
  {
    review: { type: Schema.Types.ObjectId, ref: 'Review', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['helpful'], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Prevent duplicate votes per user per review
ReviewVoteSchema.index({ review: 1, user: 1 }, { unique: true });

export const ReviewVote = model<IReviewVote>('ReviewVote', ReviewVoteSchema);
