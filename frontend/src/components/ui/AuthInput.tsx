import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AuthInputProps {
  id: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  minLength?: number;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  required = false,
  disabled = false,
  minLength,
}) => (
  <div className="input-icon-wrapper">
    {icon && <span className="input-icon">{icon}</span>}
    <input
      id={id}
      type={type}
      className="form-input input-with-icon"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      minLength={minLength}
    />
  </div>
);

export default AuthInput;
