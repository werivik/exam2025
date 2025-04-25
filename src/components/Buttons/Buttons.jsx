import React from 'react';
import styles from './Buttons.module.css';

const Buttons = ({ children, size = 'medium', version = 'v1', onClick }) => {
  return (
    <button 
      className={`${styles.button} ${styles[size]} ${styles[`${size}${version}`]}`} 
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Buttons;