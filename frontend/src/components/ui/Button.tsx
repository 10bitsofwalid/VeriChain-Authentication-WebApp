import React from 'react';
import './ui.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}) => {
  const classNames = `vc-action-button vc-action-${variant} vc-action-${size} ${className}`.trim();
  return (
    <button className={classNames} {...rest}>
      {children}
    </button>
  );
};

export default Button;
