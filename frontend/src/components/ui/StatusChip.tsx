import type { ReactNode } from 'react';
import './ui.css';

type StatusChipTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface StatusChipProps {
  children: ReactNode;
  tone?: StatusChipTone;
}

export default function StatusChip({ children, tone = 'neutral' }: StatusChipProps) {
  return <span className={`vc-status-chip vc-status-${tone}`}>{children}</span>;
}
