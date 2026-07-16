// src/components/EmptyState.tsx
// Compatibility shim — wraps the canonical ui/EmptyState so existing
// callers (AnalyticsSection, PublicProfileSections) keep working unchanged.
// New code should import directly from './ui/EmptyState' and supply icon + title.
import React from 'react';
import { CheckCircle } from 'lucide-react';
import UIEmptyState from './ui/EmptyState';

interface EmptyStateProps {
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ message }) => (
  <UIEmptyState icon={CheckCircle} title={message} message="" />
);

export default EmptyState;
