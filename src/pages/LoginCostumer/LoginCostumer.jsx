import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LoginCostumer.module.css';
import { AUTH_LOGIN } from '../../constants';
import { headers } from '../../headers';

const LoginCostumer = () => {
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

      navigate('/costumer-profile');
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
          <p>Login as a Costumer</p>
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
  className={`${styles.loginButton} ${isFormValid && !isSubmitting ? styles.active : styles.inactive}`}
>
  {isSubmitting ? 'Logging in...' : 'Login'}
</button>

            
            {error && <p className={styles.error}>{error}</p>}
          </form>
          <div className={styles.BottomOptions}>
          <p>Don't have an account? Register one <Link to="/register-costumer">here</Link></p>
          <p>Are you a Manager? Login <Link to="/login-admin">Here</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginCostumer;
