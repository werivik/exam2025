import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './RegisterCostumer.module.css';
import { AUTH_REGISTER } from '../../constants';
import { headers } from '../../headers';

const RegisterCostumer = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid()) {
      setError(
        'Please make sure your email ends in .no and password has at least 8 characters including a number.'
      );
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

        return;
      }

      alert('Registration successful! Redirecting to login...');
      
      navigate('/login-costumer');
    } 
    
    catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred. Please try again.');
    } 
    
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContent}>
      <div className={styles.registerStyle}>
        <div className={styles.registerContent}>
          <h2>Holidaze</h2>
          <h1>Register as a Costumer</h1>
          <form onSubmit={handleRegister} className={styles.registerForm}>
            <input
              type="text"
              name="name"
              placeholder="Name"
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

            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.registerButton}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>

            {error && <p className={styles.error}>{error}</p>}
          </form>

          <p>
            Already have an account?{' '}
            <Link to="/login-costumer">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterCostumer;
