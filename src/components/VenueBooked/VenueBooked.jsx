import React from 'react';
import styles from './VenueBooked.module.css';

const VenueBooked = ({ venue, onClick }) => {
  if (!venue) return null;

  const startDate = new Date(venue.dateFrom);
  const endDate = new Date(venue.dateTo);
  const durationInDays = Math.ceil((endDate - startDate) / (1000 * 3600 * 24));

  const totalPrice = venue.price && durationInDays > 0
    ? venue.price * durationInDays
    : 'N/A';

  const guests = venue.guests || 'N/A';

  return (
    <div className={styles.hotelCard} onClick={onClick}>
      <div className={styles.bookedDate}>
        <p><span>From</span> {startDate.toLocaleDateString()}</p>
        <div className={styles.divideLine}></div>
        <p><span>To</span> {endDate.toLocaleDateString()}</p>
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
        <p className={styles.totalPrice}>
          <strong>$ {totalPrice}</strong><span> / Total price</span>
        </p>
        <p className={styles.totalGuests}>
          <strong>{guests}</strong> {guests === 1 ? 'Guest' : 'Guests'}
        </p>
      </div>
    </div>
  );
};

export default VenueBooked;