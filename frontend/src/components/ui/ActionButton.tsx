import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './ui.css';

type ActionButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ActionButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
}

export default function ActionButton({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}: ActionButtonProps) {
  return (
    <button className={`vc-action-button vc-action-${variant} vc-action-${size} ${className}`} {...props}>
      {children}
    </button>
  );
}
