export interface VerificationActivityStats {
  recentVerifications: number;
  trustScore: number; // percentage
  latestEvents: string[]; // short descriptions
}

export const verificationActivityStats: VerificationActivityStats = {
  recentVerifications: 27,
  trustScore: 94,
  latestEvents: [
    'EcoBottle verified 2 min ago',
    'SolarLamp ownership transferred 10 min ago',
    'PureSoap recall resolved 3 days ago',
  ],
};
