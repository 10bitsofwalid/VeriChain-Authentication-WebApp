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

export const itemStatusBadge = (status: string): string => {
  switch (status) {
    case 'manufactured':
      return 'badge-info';
    case 'in_transit':
      return 'badge-warning';
    case 'listed':
      return 'badge-neutral';
    case 'sold':
      return 'badge-success';
    case 'recalled':
      return 'badge-danger';
    default:
      return 'badge-neutral';
  }
};

export const complaintStatusBadge = (status: string): string => {
  switch (status) {
    case 'resolved':
      return 'badge-success';
    case 'dismissed':
      return 'badge-danger';
    case 'under_review':
      return 'badge-warning';
    case 'pending':
      return 'badge-info';
    default:
      return 'badge-neutral';
  }
};
