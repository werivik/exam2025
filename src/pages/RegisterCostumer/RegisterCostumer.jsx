import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './RegisterCostumer.module.css';
import { motion } from "framer-motion";
import Buttons from '../../components/Buttons/Buttons';
import CustomPopup from '../../components/CostumPopup/CostumPopup';
import { registerCostumer } from '../../auth/register';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const RegisterCostumer = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email) && email.endsWith('.no');
  };

  const validatePassword = (password) => {
    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordPattern.test(password);
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== '' &&
      validateEmail(formData.email) &&
      validatePassword(formData.password)
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
  
    if (!isFormValid()) {
      setError(
        'Please make sure your email is stud.noroff.no, and password has at least 8 characters including a number.'
      );
      triggerShake();
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      await registerCostumer({ 
        name: formData.name,
        email: formData.email,
        password: formData.password
      });      
      setShowPopup(true);
      setTimeout(() => {
        navigate('/login-costumer');
      }, 2000);
    } 
    catch (err) {
      console.error('Registration error:', err);
  
      const profileExists = err.errors?.some(
        (error) => error.message === 'Profile already exists'
      );
  
      if (profileExists) {
        setError('Username or email is already in use.');
      } 
      
      else {
        setError(err.message || 'Registration failed.');
      }
  
      triggerShake();
    } 
    finally {
      setIsSubmitting(false);
    }
  };
  
  useEffect(() => {
  document.title = 'Register';
  
  return () => {
    document.title = 'Holidaze';
  };
}, []);

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
      <div className={styles.registerStyle}>
        <div className={`${styles.registerContent} ${shake ? styles.shake : ''}`}>
          <h2>Holidaze</h2>
          <h1>Welcome to Holidaze</h1>
          <p>Register as a Costumer</p>
          <form onSubmit={handleRegister} className={styles.inputForm}>
            <div className={styles.inputFormInputs}>
            <input
                type="text"
                name="name"
                placeholder="username"
                value={formData.name}
                onChange={handleChange}
                required
                className={styles.input}
              />
            <input
              type="email"
              name="email"
              placeholder="Email (.no only)"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.input}
            />
            <input
              type="password"
              name="password"
              placeholder="Password (min 8 chars + number)"
              value={formData.password}
              onChange={handleChange}
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
              Already have an account? Login <Link to="/login-costumer">here</Link>
            </p>
            <p>
              Are you a Venue Manager? Login <Link to="/login-admin">here</Link>
            </p>
          </div>
        </div>
      </div>
      </div>

      {showPopup && (
        <CustomPopup
          message={`Welcome, ${formData.name}! Redirecting to the login page...`}
          title="Registration Successful"
          onConfirm={() => navigate('/login-costumer')}
          showButtons={false}
          disableAutoClose={false}
        />
      )}
    </motion.div>
  );
};

export default RegisterCostumer;