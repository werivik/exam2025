import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PROFILES_SINGLE } from '../../constants';
import { headers } from '../../headers';
import styles from './AdminProfile.module.css';

const AdminProfile = () => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      const email = localStorage.getItem('email');

      try {
        const response = await fetch(PROFILES_SINGLE.replace('<name>', email), {
          method: 'GET',
          headers: headers(token),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const { data } = await response.json();

        if (data.venueManager) {
          setUser(data);
        } else {
          setError('You do not have access to the admin page.');
          navigate('/not-authorized');
        }
      } 
      
      catch (err) {
        setError(err.message);
      } 
      
      finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <section className={styles.pageContent}>
    <div>
      <h1>Welcome, {user?.name}</h1>
      <p>Email: {user?.email}</p>
      <div>
        <h2>Your Venues</h2>
        {user?.venues?.length > 0 ? (
          <ul>
            {user.venues.map((venue) => (
              <li key={venue.id}>
                <h3>{venue.name}</h3>
                <p>{venue.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>You don't have any venues yet.</p>
        )}
      </div>

      <div>
        <h2>Your Bookings</h2>
        {user?.bookings?.length > 0 ? (
          <ul>
            {user.bookings.map((booking) => (
              <li key={booking.id}>
                <p>Booking from {booking.dateFrom} to {booking.dateTo}</p>
                <p>Guests: {booking.guests}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No bookings found.</p>
        )}
      </div>
    </div>
    </section>
  );
};

export default AdminProfile;
