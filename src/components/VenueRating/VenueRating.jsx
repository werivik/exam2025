import { useState, useEffect } from 'react';
import { isLoggedIn } from '../../auth/auth';
import RatingService from './RatingService';
import styles from './VenueRating.module.css';

const VenueRating = ({ 
  venueId, 
  currentRating = 0, 
  onRatingUpdate, 
  className = '' 
}) => {
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [userLoggedIn, setUserLoggedIn] = useState(isLoggedIn());
  const [displayRating, setDisplayRating] = useState(currentRating);
  
  useEffect(() => {
    const handleAuthChange = () => setUserLoggedIn(isLoggedIn());
    window.addEventListener("authchange", handleAuthChange);
    return () => window.removeEventListener("authchange", handleAuthChange);
  }, []);
  
  useEffect(() => {
    if (userLoggedIn && venueId) {
      const savedRating = RatingService.getUserRating(venueId);
      if (savedRating !== null) {
        setUserRating(savedRating);
      }
    }
    
    setDisplayRating(currentRating);
  }, [venueId, userLoggedIn, currentRating]);
  
  const handleRatingClick = async (selectedRating) => {
    if (!userLoggedIn) {
      setMessage('Please log in to rate this venue');
      setMessageType('error');
      return;
    }
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setMessage('Submitting your rating...');
    setMessageType('info');
    
    try {
      setUserRating(selectedRating);
    
      await RatingService.submitRating(venueId, selectedRating);      
      const newAverageRating = RatingAverageService.addRating(venueId, selectedRating);
      
      setDisplayRating(newAverageRating);
      
      setMessage('Thank you for rating!');
      setMessageType('success');
      
      if (onRatingUpdate) {
        onRatingUpdate(newAverageRating);
      }
    } 
    catch (error) {
      console.error('Error submitting rating:', error);
      
      setMessage('Error saving rating. Please try again.');
      setMessageType('error');
    } 
    finally {
      setIsSubmitting(false);      
      setTimeout(() => setMessage(''), 3000);
    }
  };
  
  const renderStars = () => {
    return [1, 2, 3, 4, 5].map(position => {
      const isFilled = (hoveredRating || userRating) >= position;
      
      return (
        <span
          key={position}
          className={`${styles.star} ${isFilled ? styles.filled : ''}`}
          onMouseEnter={() => !isSubmitting && setHoveredRating(position)}
          onMouseLeave={() => !isSubmitting && setHoveredRating(0)}
          onClick={() => handleRatingClick(position)}
          aria-label={`Rate ${position} out of 5 stars`}
          role="button"
          tabIndex={0}
        >
          {isFilled ? '★' : '☆'}
        </span>
      );
    });
  };
  
  return (
    <div className={`${styles.ratingContainer} ${className}`}>
      <div className={styles.ratingHeader}>
        <h4>Rate this venue</h4>
        <div className={styles.venueRating}>
          <span className={styles.currentRating}>{displayRating.toFixed(1)}</span>
          <div className={styles.currentStars}>
            {[1, 2, 3, 4, 5].map(position => {
              const filled = Math.floor(displayRating) >= position;
              const halfFilled = !filled && Math.ceil(displayRating) === position;
              
              return (
                <span 
                  key={position} 
                  className={`${styles.star} ${filled ? styles.filled : ''} ${halfFilled ? styles.halfFilled : ''}`}
                >
                  {filled ? '★' : (halfFilled ? '★' : '☆')}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      
      <div className={styles.userRatingSection}>
        <div className={styles.starsContainer}>
          {renderStars()}
        </div>
        
        {message && (
          <p className={`${styles.message} ${styles[messageType]}`}>
            {message}
          </p>
        )}
        
        {!userLoggedIn && (
          <p className={styles.loginPrompt}>
            <a href="/login-costumer">Login</a> to rate this venue
          </p>
        )}
        
        {userLoggedIn && userRating > 0 && !message && (
          <p className={styles.ratedMessage}>
            You rated this venue {userRating} {userRating === 1 ? 'star' : 'stars'}
          </p>
        )}
      </div>
    </div>
  );
};

export default VenueRating;