import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './VenueBooked.module.css';
import registerImage from "/media/hotelTypes/hotelReseption.jpeg";
import stars from "/media/rating/christmas-stars.png";

const VenueBooked = ({ venue, fetchVenueDetails }) => {
  const [venueDetails, setVenueDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <Link to={`/venue-details/${venue?.id}`} key={venue?.id} className={styles.hotelCard}>
      {isLoading ? (
        <div className={styles.loadingCard}>
          <div className={styles.loadingImage}></div>
          <div className={styles.loadingInfo}>
            <div className={styles.loadingLine}></div>
            <div className={styles.loadingLine}></div>
            <div className={styles.loadingLine}></div>
          </div>
        </div>
      ) : (
        <>
          <div className={styles.starRating}>
            <span>{venue.rating?.toFixed(1) || "0.0"}</span>
            <img 
              src={stars} 
              alt="Star" 
              className={styles.singleStar} 
            />
          </div>
          <img
            src={venue.media?.[0]?.url || registerImage}
            alt={venue.media?.[0]?.alt || venue.name}
          />
          <div className={styles.hotelInfo}>
            <h3>{venue.name}</h3>
            <p>
              {venue.location?.city || "Unknown City"}, {venue.location?.country || "Unknown Country"}
            </p>
            <span>See more</span>
          </div>
        </>
      )}
    </Link>
  );
};

export default VenueBooked;