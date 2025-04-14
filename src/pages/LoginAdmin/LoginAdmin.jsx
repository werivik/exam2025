import { useState } from 'react';
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

      localStorage.setItem('token', data.data.accessToken);
      localStorage.setItem('username', data.data.name);

      navigate('/user-page');
    } 
    
    catch (err) {
      setError(err.message || 'Something went wrong');
    } 
    
    finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginStyle}>
        <div className={styles.loginContent}>
          <h2>Holidaze</h2>
          <h1>Welcome to Holidaze</h1>
          <form onSubmit={handleLogin} className={styles.loginForm}>
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
          <p>Don't have an account? Register one <Link to="/register-admin">here</Link></p>
          <p>Are you a Visitor? Login <Link to="/login-costumer">Here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginAdmin;
