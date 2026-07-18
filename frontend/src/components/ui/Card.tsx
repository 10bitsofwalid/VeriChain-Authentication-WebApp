// Card component
import React from "react";
import styles from "./ui.module.css";

export interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  variant?: "elevated" | "outlined";
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  children,
  footer,
  variant = "elevated",
  className = "",
}) => {
  const baseClass = variant === "outlined" ? "vc-clay-card" : "vc-clay-card-elevated";
  return (
    <div className={`${baseClass} ${styles.card} ${className}`.trim()}>
      {title && <div className={styles.header}>{title}</div>}
      <div className={styles.body}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  );
};

export default Card;
