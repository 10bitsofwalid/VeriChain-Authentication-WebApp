import type { HTMLAttributes, ReactNode } from 'react';
import './ui.css';

interface ClayCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
  interactive?: boolean;
}

export default function ClayCard({
  children,
  className = '',
  elevated = false,
  interactive = false,
  ...props
}: ClayCardProps) {
  const classes = [
    'vc-clay-card',
    elevated ? 'vc-clay-card-elevated' : '',
    interactive ? 'vc-clay-card-interactive' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
