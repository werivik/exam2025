import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginAdmin.module.css';
import { AUTH_LOGIN } from '../../constants';
import { headers } from '../../headers';

const LoginAdmin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
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
        console.error('Login Error Response:', errorData);
        throw new Error(errorData?.errors?.[0]?.message || 'Login failed');
      }

      const data = await response.json();
      console.log('Login Success:', data);

      console.log('Is Venue Manager:', data.data.venueManager);

      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('username', data.data.name);

      if (data.data.venueManager) {
        console.log('Redirecting to Venue Manager Dashboard');
        navigate('/venue-manager-dashboard');
      } 
      
      else {
        console.log('Redirecting to Admin Profile');
        navigate('/admin-profile');
      }
    } 
    
    catch (err) {
      setError(err.message || 'Something went wrong');
      console.error('Error during login:', err);
    } 
    
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.pageContent}>
      <div className={styles.loginStyle}>
        <div className={styles.loginContent}>
          <h2>Holidaze</h2>
          <h1>Welcome to Holidaze</h1>
          <p>Login as a Venue Manager</p>
          <form onSubmit={handleLogin} className={styles.inputForm}>
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
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={styles.loginButton}
              style={{ opacity: isFormValid ? 1 : 0.5 }}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
            {error && <p className={styles.error}>{error}</p>}
          </form>
          <div className={styles.BottomOptions}>
            <p>
              Don't have an account? Register one <Link to="/register-admin">here</Link>
            </p>
            <p>
              Are you a Costumer? Login <Link to="/login-costumer">Here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
