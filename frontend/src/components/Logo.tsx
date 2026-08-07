import React from 'react';
import logoSvg from '../assets/logo.svg';
import './Logo.css';

export interface LogoProps {
  size?: number;
  showText?: boolean;
  subtitle?: string;
  className?: string;
  style?: React.CSSProperties;
  imgClassName?: string;
}

export default function Logo({
  size = 28,
  showText = true,
  subtitle,
  className = '',
  style = {},
  imgClassName = '',
}: LogoProps) {
  return (
    <div className={`verichain-logo ${className}`} style={style}>
      <img
        src={logoSvg}
        alt="VeriChain"
        width={size}
        height={size}
        className={`verichain-logo-img ${imgClassName}`}
        style={{ width: size, height: size }}
      />
      {showText && (
        <span className="verichain-logo-text">
          <span className="verichain-logo-title">VeriChain</span>
          {subtitle && <span className="verichain-logo-subtitle">{subtitle}</span>}
        </span>
      )}
    </div>
  );
}
