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
  }, [venueId, userLoggedIn]);
  
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
      
      const result = await RatingService.submitRating(venueId, selectedRating);
      
      if (result?.success === false) {
        setMessage('Rating saved locally. Server update failed.');
        setMessageType('warning');
      } 
      else {
        setMessage('Thank you for rating!');
        setMessageType('success');
      }
      
      if (onRatingUpdate && result?.data?.rating) {
        onRatingUpdate(result.data.rating);
      } 
      else if (onRatingUpdate) {
        onRatingUpdate(selectedRating);
      }
    } 
    catch (error) {
      console.error('Error submitting rating:', error);
      
      setMessage('Could not submit to server, but your rating is saved locally.');
      setMessageType('warning');
      
      if (onRatingUpdate) {
        onRatingUpdate(selectedRating);
      }
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
          <span className={styles.currentRating}>{currentRating.toFixed(1)}</span>
          <div className={styles.currentStars}>
            {[1, 2, 3, 4, 5].map(position => (
              <span key={position} className={`${styles.star} ${currentRating >= position ? styles.filled : ''}`}>
                {currentRating >= position ? '★' : '☆'}
              </span>
            ))}
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