export interface FeedEvent {
  id: string;
  productName: string;
  action: string; // e.g., 'verified', 'ownership transferred'
  timestamp: string; // ISO string
}

export const verificationFeed: FeedEvent[] = [
  { id: '1', productName: 'EcoBottle', action: 'verified', timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString() },
  { id: '2', productName: 'SolarLamp', action: 'ownership transferred', timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
  { id: '3', productName: 'PureSoap', action: 'verification completed', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
  { id: '4', productName: 'GreenBag', action: 'recently registered batch', timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() },
];
