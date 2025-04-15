import React from 'react';
import styles from './LoadingCard.module.css';

const LoadingCard = () => {
  return (
    <div className={styles.loadingCard}>
      <div className={styles.loadingImage}></div>
      <div className={styles.loadingInfo}>
        <div className={styles.loadingLine}></div>
        <div className={styles.loadingLine}></div>
        <div className={styles.loadingLine}></div>
      </div>
    </div>
  );
};

export default LoadingCard;
