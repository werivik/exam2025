import React from 'react';
import styles from './Buttons.module.css';

const Buttons = ({ 
  children, 
  size = 'medium', 
  version = 'v1', 
  onClick,
  isClose = false,
  className = ''
}) => {
  if (isClose) {
    return (
      <button
        className={`${styles.close} ${className}`}
        onClick={onClick}
        aria-label="Close"
      >
        ×
      </button>
    );
  }
  
  return (
    <button
      className={`${styles.button} ${styles[size]} ${styles[`${size}${version}`]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Buttons;