import React, { useEffect } from 'react';
import styles from './CostumPopup.module.css';

const CustomPopup = ({ message, onClose, onConfirm, onCancel, showButtons = true }) => {
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
        {showButtons && (
          <div className={styles.popupActions}>
            <button className={styles.yesButton} onClick={onConfirm}>Yes</button>
            <button className={styles.noButton} onClick={onCancel}>No</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomPopup;
