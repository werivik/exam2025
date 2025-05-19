import React, { useEffect } from 'react';
import styles from './CostumPopup.module.css';
import Buttons from '../Buttons/Buttons';

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
  document.body.style.overflow = 'hidden';
  
  let timer;
  if (!disableAutoClose) {
    timer = setTimeout(() => {
      onClose();
    }, 2000);
  }
  
  return () => {
    document.body.style.overflow = 'auto';
    if (timer) clearTimeout(timer);
  };
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
          <Buttons size='small' version='v1' className={styles.yesButton} onClick={onConfirm}>Yes</Buttons>
          <Buttons size='small' version='v2' className={styles.noButton} onClick={onCancel}>No</Buttons>
        </div>
      )}
    </div>
  </div>
</div>
  );
};

export default CustomPopup;