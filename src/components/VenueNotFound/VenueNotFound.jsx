import { useNavigate } from 'react-router-dom';
import styles from './VenueNotFound.module.css';
import Buttons from '../Buttons/Buttons';

const VenueNotFound = ({ venueId, onGoBack, onBrowseVenues }) => {

  const navigate = useNavigate();
  const handleGoBack = onGoBack || (() => window.history.back());
  const handleBrowseVenues = onBrowseVenues || (() => navigate('/venues'));

  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <i className="fa-solid fa-map-location-dot"></i>
      </div>

      <h1 className={styles.title}>
        Venue Not Found
      </h1>

      <p className={styles.description}>
        We couldn't find the venue you're looking for. It may have been removed, 
        moved, or the link might be incorrect.
      </p>

      {venueId && (
        <p className={styles.venueId}>
          Venue ID: {venueId}
        </p>
      )}

      <div className={styles.buttonContainer}>
<Buttons
  size="medium"
  version="v1"
  onClick={handleGoBack}
>
  <i className="fa-solid fa-arrow-left"></i>
  Go back
</Buttons>

<Buttons
  size="medium"
  version="v2"
  onClick={handleBrowseVenues}
>
  <i className="fa-solid fa-home"></i>
  Browse All Venues
</Buttons>
      </div>

      <div className={styles.actionCard}>
        <h3 className={styles.actionTitle}>
          What would you like to do?
        </h3>

        <div className={styles.actionList}>
          <div
            onClick={() => window.location.href = '/venues'}
            className={styles.actionItem}
          >
            <i className="fa-solid fa-search"></i>
            Search for venues
          </div>

          <div
            onClick={() => window.location.href = '/venues'}
            className={styles.actionItem}
          >
            <i className="fa-solid fa-fire"></i>
            View popular venues
          </div>

          <div
            onClick={() => window.location.href = '/venues'}
            className={styles.actionItem}
          >
            <i className="fa-solid fa-th-large"></i>
            Browse by category
          </div>

          <div
            onClick={() => window.location.href = '/'}
            className={styles.actionItem}
          >
            <i className="fa-solid fa-home"></i>
            Go back to Homepage
          </div>
        </div>
      </div>

      <p className={styles.supportText}>
        Having trouble? <span 
          onClick={() => window.location.href = '/contact'}
          className={styles.supportLink}
        >
          Contact our support team
        </span> for assistance.
      </p>
    </div>
  );
};

export default VenueNotFound;