import { Schema, model, Document, Types } from 'mongoose';

export interface IOrderItem {
  product: Types.ObjectId;
  itemInstance?: Types.ObjectId;
  name: string;
  sku?: string;
  serialNumber?: string;
  quantity: number;
  price: number;
  image?: string;
  seller?: Types.ObjectId;
  factory?: Types.ObjectId;
}

export interface IShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface IPaymentInfo {
  method: string;
  cardLast4?: string;
  status: 'pending' | 'paid' | 'settled' | 'refunded';
  transactionHash?: string;
}

export interface IOrderTimelineEvent {
  action: string;
  actor?: Types.ObjectId;
  actorName?: string;
  timestamp: Date;
  details?: string;
  txHash?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  buyer: Types.ObjectId;
  items: IOrderItem[];
  shippingAddress: IShippingAddress;
  payment: IPaymentInfo;
  subtotal: number;
  shipping: number;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: Date;
  timeline: IOrderTimelineEvent[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    itemInstance: { type: Schema.Types.ObjectId, ref: 'ItemInstance' },
    name: { type: String, required: true },
    sku: { type: String },
    serialNumber: { type: String },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    price: { type: Number, required: true, default: 0 },
    image: { type: String },
    seller: { type: Schema.Types.ObjectId, ref: 'User' },
    factory: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String },
  },
  { _id: false }
);

const PaymentInfoSchema = new Schema<IPaymentInfo>(
  {
    method: { type: String, default: 'VeriChain Escrow' },
    cardLast4: { type: String },
    status: {
      type: String,
      enum: ['pending', 'paid', 'settled', 'refunded'],
      default: 'paid',
    },
    transactionHash: { type: String },
  },
  { _id: false }
);

const OrderTimelineSchema = new Schema<IOrderTimelineEvent>(
  {
    action: { type: String, required: true },
    actor: { type: Schema.Types.ObjectId, ref: 'User' },
    actorName: { type: String },
    timestamp: { type: Date, default: Date.now },
    details: { type: String },
    txHash: { type: String },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [OrderItemSchema], required: true, default: [] },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    payment: { type: PaymentInfoSchema, required: true },
    subtotal: { type: Number, required: true, default: 0 },
    shipping: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ['processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'processing',
      index: true,
    },
    trackingNumber: { type: String },
    carrier: { type: String },
    estimatedDelivery: { type: Date },
    timeline: { type: [OrderTimelineSchema], default: [] },
  },
  { timestamps: true }
);

export const Order = model<IOrder>('Order', OrderSchema);
