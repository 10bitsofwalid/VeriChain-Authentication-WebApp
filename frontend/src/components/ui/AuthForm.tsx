import React from 'react';

interface AuthFormProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSubmit, children }) => (
  <form onSubmit={onSubmit} className="auth-form">
    {children}
  </form>
);
