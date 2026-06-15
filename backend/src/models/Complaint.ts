import { Schema, model, Document, Types } from 'mongoose';

export interface IComplaint extends Document {
  buyer: Types.ObjectId;
  productInstance: Types.ObjectId;
  seller: Types.ObjectId;
  reason: string;
  description: string;
  evidenceUrl?: string;
  transactionHash?: string;
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
  moderatorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productInstance: { type: Schema.Types.ObjectId, ref: 'ItemInstance', required: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    evidenceUrl: { type: String },
    transactionHash: { type: String },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'resolved', 'dismissed'],
      default: 'pending',
    },
    moderatorNotes: { type: String },
  },
  { timestamps: true }
);

export const Complaint = model<IComplaint>('Complaint', ComplaintSchema);
