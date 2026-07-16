import React from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

interface AlertBannerProps {
  type: 'success' | 'error';
  message: React.ReactNode;
  onDismiss?: () => void;
  style?: React.CSSProperties;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ type, message, onDismiss, style }) => {
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`alert alert-${type}`} style={style}>
      <Icon size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
      <span style={{ flexGrow: 1 }}>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="alert-close" aria-label="Close alert">
          &times;
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
