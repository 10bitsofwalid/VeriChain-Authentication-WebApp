import { Schema, model, Document, Types } from 'mongoose';

export interface IJourneyStep {
  location: string;
  action: string;
  actor: Types.ObjectId;
  timestamp: Date;
  txHash: string;
}

export interface IItemInstance extends Document {
  product: Types.ObjectId;
  serialNumber: string;
  qrCodeUrl: string;
  currentOwner: Types.ObjectId;
  status: 'manufactured' | 'in_transit' | 'listed' | 'sold' | 'recalled';
  counterfeitRisk: 'low' | 'medium' | 'high';
  journey: IJourneyStep[];
  createdAt: Date;
  updatedAt: Date;
}

const JourneyStepSchema = new Schema<IJourneyStep>({
  location: { type: String, required: true },
  action: { type: String, required: true },
  actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  txHash: { type: String, required: true },
});

const ItemInstanceSchema = new Schema<IItemInstance>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    serialNumber: { type: String, required: true, unique: true, index: true },
    qrCodeUrl: { type: String, required: true },
    currentOwner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['manufactured', 'in_transit', 'listed', 'sold', 'recalled'],
      default: 'manufactured',
    },
    counterfeitRisk: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    journey: [JourneyStepSchema],
  },
  { timestamps: true }
);

export const ItemInstance = model<IItemInstance>('ItemInstance', ItemInstanceSchema);
