import React from 'react';
import { Loader } from 'lucide-react';

interface AuthButtonProps {
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export const AuthButton: React.FC<AuthButtonProps> = ({ type = 'button', disabled = false, loading = false, children }) => (
  <button type={type} className="btn btn-primary btn-lg auth-submit" disabled={disabled || loading}>
    {loading ? <Loader size={18} className="spin" /> : children}
  </button>
);

export default AuthButton;
