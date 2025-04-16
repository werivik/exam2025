import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styles from './RegisterAdmin.module.css';
import { AUTH_REGISTER } from '../../constants';
import { headers } from '../../headers';

const RegisterAdmin = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const isFormValid =
    name.trim() !== '' && email.trim() !== '' && password.trim() !== '';

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!isFormValid) {
      setError('All fields are required.');
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

      navigate('/login-admin');
    } 
    
    catch (err) {
      setError(err.message || 'Something went wrong');
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
          <p>Register a Venue Manager</p>
          <form onSubmit={handleRegister} className={styles.registerForm}>
            <input
              type="text"
              placeholder="Full Name"
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
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={styles.registerButton}
              style={{ opacity: isFormValid ? 1 : 0.5 }}
            >
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
            {error && <p className={styles.error}>{error}</p>}
          </form>
          <p>Already have an account? <Link to="/login-costumer">Login here</Link></p>
        </div>
      </div>
    </div>
  );
};

export default RegisterAdmin;
