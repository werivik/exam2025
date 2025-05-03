import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { VENUE_SINGLE } from '../../constants';
import { headers } from '../../headers';
import styles from './BookedVenue.module.css';

const BookedVenue = () => {
  const { venueId } = useParams();
  const [venueDetails, setVenueDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!venueId) {
      setHasError(true);
      setIsLoading(false);
      return;
    }

    const fetchVenueDetails = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${VENUE_SINGLE}${venueId}`, {
          method: 'GET',
          headers: headers(token),
        });

        if (response.ok) {
          const data = await response.json();
          setVenueDetails(data.data);
        } 
        else {
          setHasError(true);
        }
      } 
      catch (error) {
        setHasError(true);
        console.error('Error fetching venue details:', error);
      } 
      finally {
        setIsLoading(false);
      }
    };

    fetchVenueDetails();
  }, [venueId]);

  if (isLoading) return <div>Loading venue details...</div>;
  if (hasError) return <div>Failed to fetch venue details.</div>;

  return (
    <section className={styles.pageContent}>
      <div className={styles.pageStyle}>
      <div className={styles.venueDetails}>
      <h2>{venueDetails.name}</h2>
      <img src={venueDetails.imageUrl || '/default.jpg'} alt={venueDetails.name} />
      <p>{venueDetails.description}</p>
      <p><strong>Location:</strong> {venueDetails.location}</p>
      <p><strong>Booking Dates:</strong> {new Date(venueDetails.dateFrom).toLocaleDateString()} - {new Date(venueDetails.dateTo).toLocaleDateString()}</p>
    </div>
      </div>
    </section>
  );
};

export default BookedVenue;
