import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './RegisterCostumer.module.css';
import { AUTH_REGISTER } from '../../constants';
import { headers } from '../../headers';
import { motion } from "framer-motion";
import Buttons from '../../components/Buttons/Buttons';

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
      const payload = {
        ...formData,
        credits: 1000,
        venueManager: false,
      };

      const response = await fetch(AUTH_REGISTER, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();

        const profileExists = errorData.errors?.some(
          (err) => err.message === 'Profile already exists'
        );

        if (profileExists) {
          setError('Username or email is already in use.');
        } 
        
        else {
          setError(errorData.message || 'Registration failed.');
        }

        triggerShake();
        return;
      }

      alert('Registration successful! Redirecting to login...');
      navigate('/login-costumer');
    } 
    catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
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

            <Buttons size='medium' version='v1' type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </Buttons>

            {error && <p className={styles.error}>{error}</p>}
          </form>

          <div className={styles.BottomOptions}>
            <p>
              Already have an account?{' '}
              <Link to="/login-costumer">Login here</Link>
            </p>
            <p>
              Are you a Venue Manager? <Link to="/login-admin">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RegisterCostumer;