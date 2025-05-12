// CustomPopup.jsx
import React, { useEffect } from 'react';
import styles from './CostumPopup.module.css';

const CustomPopup = ({ 
  message, 
  onClose, 
  onConfirm, 
  onCancel, 
  showButtons = true, 
  title = "", 
  disableAutoClose = false,
  hideBars = false
}) => {

  useEffect(() => {
    if (disableAutoClose) return;
    
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose, disableAutoClose]);

  return (
<div className={styles.popupOverlay}>
  <div className={styles.popupWrapper}>
<div className={`${styles.bar} ${styles.topBar} ${hideBars ? styles.hiddenBar : ''}`}></div>
<div className={`${styles.bar} ${styles.leftBar} ${hideBars ? styles.hiddenBar : ''}`}></div>
<div className={`${styles.bar} ${styles.bottomBar} ${hideBars ? styles.hiddenBar : ''}`}></div>
<div className={`${styles.bar} ${styles.rightBar} ${hideBars ? styles.hiddenBar : ''}`}></div>
<div className={`${styles.bar} ${styles.topBarFinish} ${hideBars ? styles.hiddenBar : ''}`}></div>
    <div className={styles.popupContent}>
      <h3>{title}</h3>
      <p>{message}</p>
      {showButtons && (
        <div className={styles.popupActions}>
          <button className={styles.yesButton} onClick={onConfirm}>Yes</button>
          <button className={styles.noButton} onClick={onCancel}>No</button>
        </div>
      )}
    </div>
  </div>
</div>
  );
};

export default CustomPopup;