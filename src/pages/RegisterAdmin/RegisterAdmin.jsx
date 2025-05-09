import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './RegisterAdmin.module.css';
import { AUTH_REGISTER } from '../../constants';
import { headers } from '../../headers';
import { motion } from "framer-motion";
import Buttons from '../../components/Buttons/Buttons';
import CustomPopup from '../../components/CostumPopup/CostumPopup';

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
  const [showPopup, setShowPopup] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const isFormValid = name.trim() !== '' && email.trim() !== '' && password.trim() !== '';

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
      const response = await fetch(AUTH_REGISTER, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          name,
          email,
          password,
          venueManager: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.errors?.[0]?.message || 'Registration failed');
      }

      const data = await response.json();
      console.log('Register Response:', data);

      setUsername(name);
      setShowPopup(true);

      setTimeout(() => {
        navigate('/login-admin');
      }, 2000);

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
      <div className={`${styles.registerStyle} ${showPopup ? styles.blurred : ''}`}>
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

            <Buttons size='medium' version='v2' type="submit" disabled={!isFormValid || isSubmitting}>
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

      {showPopup && (
        <CustomPopup
          message={`Welcome, ${username}! Redirecting to the login page...`}
          title="Registration Successful"
          onConfirm={() => navigate('/login-admin')}
          showButtons={false}
          disableAutoClose={false}
        />
      )}
    </motion.div>
  );
};

export default RegisterAdmin;
