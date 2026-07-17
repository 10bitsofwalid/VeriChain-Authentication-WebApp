import React from 'react';
import './Card.css';

type CardVariant = 'elevated' | 'outlined' | 'glass';

type CardProps = {
  variant?: CardVariant;
  children: React.ReactNode;
  className?: string;
};

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  className = '',
  children,
}) => {
  const classes = `vc-card vc-card--${variant} ${className}`;
  return <div className={classes}>{children}</div>;
};

export default Card;
