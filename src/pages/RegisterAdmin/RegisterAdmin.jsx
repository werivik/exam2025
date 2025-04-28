import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './RegisterAdmin.module.css';
import { motion } from "framer-motion";
import Buttons from '../../components/Buttons/Buttons';

import { registerAdmin } from '../../auth/register';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const RegisterAdmin = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const isFormValid =
    name.trim() !== '' && email.trim() !== '' && password.trim() !== '';

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!isFormValid) {
      setError('All fields are required.');
      triggerShake();
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      await registerAdmin({ name, email, password });
      console.log('Register successful');
      navigate('/login-admin');
    } 

    catch (err) {
      setError(err.message || 'Something went wrong');
      triggerShake();
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
      <div className={styles.registerStyle}>
        <div className={`${styles.registerContent} ${shake ? styles.shake : ''}`}>
          <h2>Holidaze</h2>
          <h1>Welcome to Holidaze</h1>
          <p>Register as a Venue Manager</p>
          <form onSubmit={handleRegister} className={styles.inputForm}>
            <div className={styles.inputFormInputs}>
            <input
              type="text"
              placeholder="Venue Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.input}
            />
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

            <Buttons size='medium' version='v2'type="submit" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </Buttons>
            {error && <p className={styles.error}>{error}</p>}
          </form>
          <div className={styles.BottomOptions}>
            <p>Already have an account? <Link to="/login-admin">Login here</Link></p>
            <p>Are you a Costumer? <Link to="/login-costumer">Login here</Link></p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterAdmin;