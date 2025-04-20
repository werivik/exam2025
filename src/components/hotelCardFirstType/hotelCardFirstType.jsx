import React from 'react';
import { Link } from 'react-router-dom';
import styles from './hotelCardFirstType.module.css';
import registerImage from "/media/hotelTypes/hotelReseption.jpeg";
import stars from "/media/rating/christmas-stars.png";

const hotelCardFirstType = ({ hotel }) => {

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
    src={stars} 
    alt="Star" 
    className={styles.singleStar} 
  />
</div>
          <img
            src={hotel.media?.[0]?.url || registerImage}
            alt={hotel.media?.[0]?.alt || hotel.name}
          />
          <div className={styles.hotelInfo}>
            <h3>{hotel.name}</h3>
            <p>
              {hotel.location?.city || "Unknown City"}, {hotel.location?.country || "Unknown Country"}
            </p>
            <span>See more</span>
          </div>
        </>
      )}
    </Link>
  );
};

export default hotelCardFirstType;
