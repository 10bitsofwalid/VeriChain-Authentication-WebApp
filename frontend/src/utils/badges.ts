// src/utils/badges.ts
/** Utility functions for badge classes */
export const riskBadge = (risk: string): string => {
  switch (risk) {
    case 'low':
      return 'badge-success';
    case 'medium':
      return 'badge-warning';
    case 'high':
      return 'badge-danger';
    default:
      return 'badge-neutral';
  }
};

export const verificationBadge = (status: string): string => {
  switch (status) {
    case 'verified':
      return 'badge-success';
    case 'rejected':
      return 'badge-danger';
    default:
      return 'badge-warning';
  }
};
