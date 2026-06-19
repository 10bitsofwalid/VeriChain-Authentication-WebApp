import React from 'react';
import './LoadingSpinner.css'; // ensure CSS exists or use existing .spinner class

const LoadingSpinner: React.FC = () => (
  <div className="loading-container">
    <div className="spinner" />
  </div>
);

export default LoadingSpinner;
