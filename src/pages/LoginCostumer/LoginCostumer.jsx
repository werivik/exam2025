import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './LoginCostumer.module.css';

const LoginCostumer = () => {

    return (
        <div className={styles.loginPage}>
            <div className={styles.loginStyle}>
                <div className={styles.loginContent}>
                <h2>Holidaze</h2>
                <h1>Welcome to Holidaze</h1>
                </div>
            </div>
        </div>
    );
};

export default LoginCostumer;
