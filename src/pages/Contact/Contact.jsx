import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './Contact.module.css';
import Buttons from '../../components/Buttons/Buttons';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.subject.trim()) errors.subject = 'Subject is required';
    if (!formData.message.trim()) errors.message = 'Message is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitSuccess(true);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
        
        setTimeout(() => {
          setSubmitted(false);
          setSubmitSuccess(false);
        }, 5000);
      }, 1500);
    }
  };

  return (
    <motion.div
      className={styles.contactContainer}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className={styles.contactContent}>
        <div className={styles.contactHeader}>
          <h1>Contact Us</h1>
          <p>Have questions about booking a venue or need assistance? We're here to help!</p>
        </div>
        
        <div className={styles.contactColumns}>
          <div className={styles.contactInfo}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <i className="fa-solid fa-location-dot"></i>
              </div>
              <div className={styles.infoText}>
                <h3>Our Location</h3>
                <p>22B Baker Street</p>
                <p>London, W1U 3BK, UK</p>
              </div>
            </div>
            
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <i className="fa-solid fa-phone"></i>
              </div>
              <div className={styles.infoText}>
                <h3>Call Us</h3>
                <p>+47 123 45 678</p>
                <p>Mon-Fri: 9am - 5pm</p>
              </div>
            </div>
            
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>
                <i className="fa-solid fa-envelope"></i>
              </div>
              <div className={styles.infoText}>
                <h3>Email Us</h3>
                <p>support@venuesite.com</p>
                <p>bookings@venuesite.com</p>
              </div>
            </div>
            
            <div className={styles.socialLinks}>
              <h3>Connect With Us</h3>
              <div className={styles.socialIcons}>
                <a href="https://www.linkedin.com/in/weronika-vik-0844022a6/" className={styles.socialIcon}>
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
                <a href="https://www.linkedin.com/in/weronika-vik-0844022a6/" className={styles.socialIcon}>
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="https://www.linkedin.com/in/weronika-vik-0844022a6/" className={styles.socialIcon}>
                  <i className="fa-brands fa-twitter"></i>
                </a>
                <a href="https://www.linkedin.com/in/weronika-vik-0844022a6/" className={styles.socialIcon}>
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>
              </div>
            </div>
          </div>
          
          <div className={styles.contactForm}>
            <h2>Send Us a Message</h2>
            {submitted && submitSuccess ? (
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>
                  <i className="fa-solid fa-check"></i>
                </div>
                <p>Your message has been sent successfully! We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className={formErrors.name ? styles.inputError : ''}
                  />
                  {formErrors.name && <p className={styles.errorText}>{formErrors.name}</p>}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="email">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={formErrors.email ? styles.inputError : ''}
                  />
                  {formErrors.email && <p className={styles.errorText}>{formErrors.email}</p>}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="What's this about?"
                    className={formErrors.subject ? styles.inputError : ''}
                  />
                  {formErrors.subject && <p className={styles.errorText}>{formErrors.subject}</p>}
                </div>
                
                <div className={styles.formGroup}>
                  <label htmlFor="message">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your message here..."
                    rows="5"
                    className={formErrors.message ? styles.inputError : ''}
                  ></textarea>
                  {formErrors.message && <p className={styles.errorText}>{formErrors.message}</p>}
                </div>
                
                <div className={styles.formSubmit}>
                  <Buttons 
                    type="submit" 
                    size="medium" 
                    version="v1" 
                    disabled={submitted}
                  >
                    {submitted ? 'Sending...' : 'Send Message'}
                  </Buttons>
                </div>
              </form>
            )}
          </div>
        </div>
        
        <div className={styles.mapContainer}>
          <h2>Find Us</h2>
          <div className={styles.venueMap}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d4965.508622898965!2d-0.16007784215703105!3d51.5177232993666!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761acdabd7f677%3A0xa3fa518b103821ce!2s22b%20Baker%20St%2C%20London%20W1U%203BW%2C%20UK!5e0!3m2!1sen!2sno!4v1747772686404!5m2!1sen!2sno"
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
              className={styles.googleMap}
            ></iframe>
          </div>
        </div>
        
        <div className={styles.faqSection}>
          <h2>Frequently Asked Questions</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>How do I book a venue?</h3>
              <p>To book a venue, simply browse our available venues, select your desired dates, and click on "Book Room". You'll need to be logged in to complete the booking process.</p>
            </div>
            
            <div className={styles.faqItem}>
              <h3>Can I cancel my booking?</h3>
              <p>Yes, you can cancel your booking through your profile dashboard. Please note our cancellation policy may apply depending on how close to the booking date you cancel.</p>
            </div>
            
            <div className={styles.faqItem}>
              <h3>How do I become a Venue Manager?</h3>
              <p>To become a Venue Manager, register for an account and select the "Venue Manager" option during registration. After approval, you'll be able to create and manage your own venues.</p>
            </div>
            
            <div className={styles.faqItem}>
              <h3>What payment methods do you accept?</h3>
              <p>We accept major credit cards, debit cards, and digital payment methods. All payments are processed securely through our platform.</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Contact;