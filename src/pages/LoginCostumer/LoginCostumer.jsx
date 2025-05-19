import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginCostumer.module.css';
import { motion } from "framer-motion";
import Buttons from '../../components/Buttons/Buttons';
import { loginCostumer } from '../../auth/login';
import CustomPopup from '../../components/CostumPopup/CostumPopup';

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
      const { name, token } = await loginCostumer({ email, password });
  
      setUsername(name);
      localStorage.setItem('accessToken', token);
      localStorage.setItem('username', name);
  
      setShowPopup(true);
      setTimeout(() => {
        navigate('/costumer-profile');
      }, 2000);
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

<Buttons 
  size='medium' 
  version={isFormValid ? 'v1' : 'v2'} 
  type="submit" 
  disabled={!isFormValid || isSubmitting}
>
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
                Are you a Manager? Login <Link to="/login-admin">here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
  
      {showPopup && (
        <CustomPopup
          message={`Welcome back, ${username}! Redirecting to your profile...`}
          title="Login Successful"
          onConfirm={() => navigate('/costumer-profile')}
          showButtons={false}
          disableAutoClose={false}
        />
      )}
    </motion.div>
  );  
};

export default LoginCostumer;
