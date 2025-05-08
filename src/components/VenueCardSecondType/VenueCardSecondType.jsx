import React from 'react';
import { Link } from 'react-router-dom';
import styles from './VenueCardSecondType.module.css';
import stars from "/media/rating/christmas-stars.png";

const VenueCardSecondType = ({ venue, onClick }) => {
  const isLoading = !venue;

  return onClick ? (
    <div className={styles.hotelCard} onClick={onClick} role="button" tabIndex={0}>
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
  <div className={styles.starRow}>
    {[...Array(1)].map((_, i) => (
      <img
        key={i}
        src={stars}
        alt={i < Math.round(venue.rating || 0) ? "Filled Star" : "Empty Star"}
        className={i < Math.round(venue.rating || 0) ? styles.starFilled : styles.starEmpty}
      />
    ))}
  </div>
</div>
          <img
            src={venue.media?.[0]?.url || '/media/logo/loadingScreen.png'}
            alt={venue.media?.[0]?.alt || venue.name}
            className={styles.hotelImage}
          />
          <div className={styles.hotelInfo}>
            <h3>{venue.name}</h3>
            <p className={styles.hotelLocation}>
              {venue.location?.city || 'Unknown City'}, {venue.location?.country || 'Unknown Country'}
            </p>
            <p className={styles.hotelPrice}>
              <p>From</p> <strong>$ {venue.price || '—'}</strong><p> / per night</p>
            </p>
            <p className={styles.seeMore}>See more</p>
          </div>
        </>
      )}
    </div>
  ) : (
    <Link to={`/venue-details/${venue?.id}`} className={styles.hotelCard}>
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
            src={venue.media?.[0]?.url || '/media/logo/loadingScreen.png'}
            alt={venue.media?.[0]?.alt || venue.name}
            className={styles.hotelImage}
          />
          <div className={styles.hotelInfo}>
            <h3>{venue.name}</h3>
            <p className={styles.hotelLocation}>
              {venue.location?.city || 'Unknown City'}, {venue.location?.country || 'Unknown Country'}
            </p>
            <p className={styles.hotelPrice}>
              <p>From</p> <strong>$ {venue.price || '—'}</strong><p> / per night</p>
            </p>
            <p className={styles.seeMore}>See more</p>
          </div>
        </>
      )}
    </Link>
  );
};

export default VenueCardSecondType;
