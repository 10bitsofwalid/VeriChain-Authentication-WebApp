import React from 'react';
import './Input.css';

type InputSize = 'sm' | 'md' | 'lg';

type InputState = 'default' | 'error' | 'success';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  state?: InputState;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  size = 'md',
  state = 'default',
  className = '',
  ...rest
}) => {
  const classes = `vc-input vc-input--${size} vc-input--${state} ${className}`;
  return <input className={classes} {...rest} />;
};

export default Input;
