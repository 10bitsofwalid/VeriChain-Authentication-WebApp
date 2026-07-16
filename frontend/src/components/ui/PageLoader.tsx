import React from 'react';
import '../LoadingSpinner.css';

interface PageLoaderProps {
  minHeight?: string;
  style?: React.CSSProperties;
}

const PageLoader: React.FC<PageLoaderProps> = ({ minHeight, style }) => {
  const combinedStyle: React.CSSProperties = {
    ...(minHeight ? { minHeight } : {}),
    ...style,
  };

  return (
    <div className="loading-container" style={combinedStyle}>
      <div className="spinner" />
    </div>
  );
};

export default PageLoader;
