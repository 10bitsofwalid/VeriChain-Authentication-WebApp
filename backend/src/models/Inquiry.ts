import { Schema, model, Document, Types } from 'mongoose';

export interface IInquiry extends Document {
  item?: Types.ObjectId;
  product?: Types.ObjectId;
  seller: Types.ObjectId;
  sender?: Types.ObjectId;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  inquiryType: 'availability' | 'price_offer' | 'authenticity' | 'shipping' | 'bulk_order' | 'general';
  message: string;
  proposedPrice?: number;
  status: 'pending' | 'replied' | 'closed';
  sellerReply?: string;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InquirySchema = new Schema<IInquiry>(
  {
    item: { type: Schema.Types.ObjectId, ref: 'ItemInstance' },
    product: { type: Schema.Types.ObjectId, ref: 'Product' },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    senderName: { type: String, required: true },
    senderEmail: { type: String, required: true },
    senderPhone: { type: String },
    inquiryType: {
      type: String,
      enum: ['availability', 'price_offer', 'authenticity', 'shipping', 'bulk_order', 'general'],
      default: 'general',
    },
    message: { type: String, required: true },
    proposedPrice: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'replied', 'closed'],
      default: 'pending',
      index: true,
    },
    sellerReply: { type: String },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

export const Inquiry = model<IInquiry>('Inquiry', InquirySchema);
