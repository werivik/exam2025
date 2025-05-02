import React from 'react';
import { Link } from 'react-router-dom';
import styles from './VenueBooked.module.css';
import placeholderImage from '/media/hotelTypes/hotelReseption.jpeg';
import stars from '/media/rating/christmas-stars.png';

const VenueBooked = ({ venue }) => {
  if (!venue) return null;

  const totalPrice = venue.price && venue.guests
    ? venue.price * venue.guests
    : 'N/A';

  return (
    <Link to={`/venue-details/${venue.id}`} className={styles.hotelCard}>
      <div className={styles.bookedDate}>
        <p><strong>From:</strong> {new Date(venue.dateFrom).toLocaleDateString()}</p>
        <div className={styles.divideLine}></div>
        <p><strong>To:</strong> {new Date(venue.dateTo).toLocaleDateString()}</p>
      </div>
      <img
        src={venue.media?.[0]?.url || '/media/logo/loadingScreen.png'}
        alt={venue.media?.[0]?.alt || venue.name}
        className={styles.hotelImage}
      />
      <div className={styles.hotelInfo}>
        <h3>{venue.name}</h3>
        <div className={styles.hotelLocation}>
          {venue.location?.city || "Unknown City"}, {venue.location?.country || "Unknown Country"}
        </div>
        <p className={styles.totalPrice}><strong>$ {totalPrice}</strong><span> / Total price</span></p>
        <p className={styles.totalGuests}>
          <strong>{venue.guests}</strong> {venue.guests === 1 ? 'Guest' : 'Guests'}
        </p>
      </div>
    </Link>
  );
};

export default VenueBooked;