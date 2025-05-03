import React, { useEffect } from 'react';
import styles from './CostumPopup.module.css';

const CustomPopup = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default CustomPopup;
