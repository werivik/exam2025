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
  const [securityCode, setSecurityCode] = useState(['', '', '', '']);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [codeShake, setCodeShake] = useState(false);
  const codeInputRefs = [
    useState(null)[1],
    useState(null)[1],
    useState(null)[1],
    useState(null)[1]
  ];
  const navigate = useNavigate();

  const SECURITY_CODE = "4321";

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

  const triggerCodeShake = () => {
    setCodeShake(true);
    setTimeout(() => setCodeShake(false), 500);
  };

  const handleVerifyCode = (e) => {
    e.preventDefault();
    setCodeError('');

    const enteredCode = securityCode.join('');
    
    if (enteredCode === SECURITY_CODE) {
      setIsCodeVerified(true);
    } 
    else {
      setCodeError('Invalid security code');
      triggerCodeShake();
      setSecurityCode(['', '', '', '']);
      if (codeInputRefs[0]) {
        codeInputRefs[0].focus();
      }
    }
  };

  const handleCodeChange = (index, value) => {
    if (value !== '' && !/^\d+$/.test(value)) {
      return;
    }

    const newCode = [...securityCode];
    newCode[index] = value;
    setSecurityCode(newCode);

    if (value !== '' && index < 3) {
      codeInputRefs[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      const newCode = [...securityCode];
      
      if (newCode[index] === '') {
        if (index > 0) {
          newCode[index - 1] = '';
          setSecurityCode(newCode);
          codeInputRefs[index - 1].focus();
        }
      } 
      else {
        newCode[index] = '';
        setSecurityCode(newCode);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{4}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setSecurityCode(newCode);
      
      codeInputRefs[3].focus();
    }
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
      <div className={`${styles.registerStyle} ${showPopup ? styles.blurred : ''}`}>
        {isCodeVerified ? (
          <div className={`${styles.registerContent} ${shake ? styles.shake : ''}`}>
            <h2>Holidaze</h2>
            <h1>Welcome to Holidaze</h1>
            <p className={styles.registerText}>Register as a Venue Manager</p>
            <form onSubmit={handleRegister} className={styles.inputForm}>
              <div className={styles.inputFormInputs}>
                <input
                  type="text"
                  placeholder="Username"
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
              <Buttons 
                size='medium' 
                version={isFormValid ? 'v1' : 'v2'} 
                type="submit" 
                disabled={!isFormValid || isSubmitting}
              >
                {isSubmitting ? 'Registering...' : 'Register'}
              </Buttons>
              {error && <p className={styles.error}>{error}</p>}
            </form>
            <div className={styles.BottomOptions}>
              <p>Already have an account? Login <Link to="/login-admin">here</Link></p>
              <p>Are you a Customer? Login <Link to="/login-costumer">here</Link></p>
            </div>
          </div>
        ) : (
          <div className={`${styles.registerContent} ${codeShake ? styles.shake : ''}`}>
            <h2>Holidaze</h2>
            <h1>Admin Verification</h1>
            <p className={styles.registerText}>Enter the 4-digit security code to access the registration form</p>
            <form onSubmit={handleVerifyCode} className={styles.inputForm}>
              <div className={styles.securityCodeInputs}>
                {securityCode.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : null}
                    ref={(el) => codeInputRefs[index] = el}
                    maxLength={1}
                    className={styles.codeInput}
                    autoFocus={index === 0}
                    inputMode="numeric"
                  />
                ))}
              </div>
              <Buttons 
                size='medium' 
                version={securityCode.every(digit => digit !== '') ? 'v1' : 'v2'} 
                type="submit" 
                disabled={!securityCode.every(digit => digit !== '')}
              >
                Verify
              </Buttons>
              {codeError && <p className={styles.error}>{codeError}</p>}
            </form>
            <div className={styles.BottomOptions}>
              <p>Already have an account? Login <Link to="/login-admin">here</Link></p>
              <p>Are you a Customer? Login <Link to="/login-costumer">here</Link></p>
            </div>
          </div>
        )}
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