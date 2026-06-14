import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  action: string;
  actor: Types.ObjectId;
  targetType: 'user' | 'product' | 'item' | 'complaint' | 'system';
  targetId?: string;
  details: string;
  ipAddress?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true },
  actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: {
    type: String,
    enum: ['user', 'product', 'item', 'complaint', 'system'],
    required: true,
  },
  targetId: { type: String },
  details: { type: String, required: true },
  ipAddress: { type: String },
  timestamp: { type: Date, default: Date.now },
});

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
