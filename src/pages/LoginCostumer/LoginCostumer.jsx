import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginCostumer.module.css';
import { AUTH_LOGIN } from '../../constants';
import { headers } from '../../headers';
import { motion } from "framer-motion";
import Buttons from '../../components/Buttons/Buttons';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const LoginCostumer = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();
  const [shake, setShake] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('Email and Password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(AUTH_LOGIN, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.errors?.[0]?.message || 'Login failed');
      }

      const data = await response.json();

      const name = data.data.name;
      const token = data.data.accessToken;
      
      setUsername(name);
      localStorage.setItem('accessToken', token);
      localStorage.setItem('username', name);      

      setShowPopup(true);
      setTimeout(() => {
        navigate('/costumer-profile');
      }, 3000);

    } 
    
    catch (err) {
      setError(err.message || 'Something went wrong');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }    
    
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
  className={styles.pageContent}
  initial="initial"
  animate="animate"
  exit="exit"
  variants={pageVariants}
  transition={{ duration: 0.5, ease: "easeInOut" }}
>
      <div className={`${styles.blurWrapper} ${showPopup ? styles.blurred : ''}`}>
        <div className={styles.loginStyle}>
          <div className={`${styles.loginContent} ${shake ? styles.shake : ''}`}>
            <h2>Holidaze</h2>
            <h1>Welcome to Holidaze</h1>
            <p>Login as a Costumer</p>
            <form onSubmit={handleLogin} className={styles.inputForm}>
              <div className={styles.inputFormInputs}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={styles.input}
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={styles.input}
              />
              </div>

              <Buttons size='medium' version='v1' type="submit" disabled={!isFormValid || isSubmitting}>
                {isSubmitting ? 'Logging in...' : 'Login'}
              </Buttons>
  
              {error && <p className={styles.error}>{error}</p>}
            </form>
            <div className={styles.BottomOptions}>
              <p>
                Don't have an account? Register one{' '}
                <Link to="/register-costumer">here</Link>
              </p>
              <p>
                Are you a Manager? Login <Link to="/login-admin">Here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
  
      {showPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h2>Welcome back, {username}!</h2>
            <p>Redirecting to your profile...</p>
          </div>
        </div>
      )}
    </motion.div>
  );  
};

export default LoginCostumer;
