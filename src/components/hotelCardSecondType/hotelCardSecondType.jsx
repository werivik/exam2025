import React from 'react';
import { Link } from 'react-router-dom';
import styles from './hotelCardSecondType.module.css';

const renderStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4 && rating % 1 <= 0.6;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  for (let i = 0; i < fullStars; i++) {
    stars.push(<img key={`full-${i}`} src="/media/rating/star-solid.svg" alt="Full Star" />);
  }

  if (hasHalfStar) {
    stars.push(<img key="half" src="/media/rating/star-half-stroke-solid.svg" alt="Half Star" />);
  }

  for (let i = 0; i < emptyStars; i++) {
    stars.push(<img key={`empty-${i}`} src="/media/rating/star-regular.svg" alt="Empty Star" />);
  }

  return stars;
};

const HotelCardSecondType = ({ hotel }) => {
  const isLoading = !hotel;

  return (
    <Link to={`/hotel-details/${hotel?.id}`} key={hotel?.id} className={styles.hotelCard}>
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
  <span>{hotel.rating?.toFixed(1) || "0.0"}</span>
  <img 
    src="/media/rating/star-solid.svg" 
    alt="Star" 
    className={styles.singleStar} 
  />
</div>
          <img
            src={hotel.media?.[0]?.url || '/path/to/default-image.jpg'}
            alt={hotel.media?.[0]?.alt || hotel.name}
            className={styles.hotelImage}
          />
          <div className={styles.hotelInfo}>
            <h3>{hotel.name}</h3>
            <p className={styles.hotelLocation}>
              {hotel.location?.city || 'Unknown City'}, {hotel.location?.country || 'Unknown Country'}
            </p>
            <p className={styles.hotelPrice}>
              from <span>${hotel.price || '—'}</span> / per night
            </p>
            <p className={styles.seeMore}>See more</p>
          </div>
        </>
      )}
    </Link>
  );
};

export default HotelCardSecondType;
