import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import ClayCard from './ClayCard';
import './ui.css';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
}

export default function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <ClayCard className="vc-empty-state">
      <div className="vc-empty-icon">
        <Icon size={30} aria-hidden="true" />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && <div className="vc-empty-action">{action}</div>}
    </ClayCard>
  );
}
