import { useState, useEffect } from 'react';
import styles from './CostumerProfile.module.css';
import { motion } from "framer-motion";
import { PROFILES_SINGLE } from '../../constants';
import { headers } from '../../headers';
import defaultAvatar from '/media/images/mdefault.jpg';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const CostumerProfile = () => {
  const [userData, setUserData] = useState({});
  const [favoriteVenues, setFavoriteVenues] = useState([]);  
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  
  const username = localStorage.getItem('username');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const name = localStorage.getItem('username')

        if (!token || !name) {
          console.warn('Missing token or name in localStorage');
          return;
        }

        const userProfileUrl = PROFILES_SINGLE.replace("<name>", username);
        console.log('Fetching user profile from:', userProfileUrl);

        const response = await fetch(userProfileUrl, {
          method: 'GET',
          headers: headers(token),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.errors?.[0]?.message || 'Failed to fetch user data');
        }

        console.log('Fetched user data:', data);
        setUserData(data.data || {});

        const venues = data.data?._count?.venues || [];
        setFavoriteVenues(venues);
      } 
      
      catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const [showPopup, setShowPopup] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    setShowPopup(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };  

  return (
<motion.div
  className={styles.pageContent}
  initial="initial"
  animate="animate"
  exit="exit"
  variants={pageVariants}
  transition={{ duration: 0.5, ease: "easeInOut" }} 
>

      <div className={`${styles.blurWrapper} ${showPopup ? styles.blurred : ''}`}>
      <section className={styles.leftSection}>
        <div className={styles.leftBorder}>
          <div className={styles.profileLeftTop}>
            <img
              src={userData.avatar?.url || defaultAvatar }
              alt={userData.name || 'User Avatar'}
            />
            <h3>Welcome back, {userData.name || 'Guest'}</h3>
          </div>
          <div className={styles.profileShortcut}>
            <button onClick={scrollTo.profileBookings} className={styles.shortcutLink}>My Bookings</button>
            <button onClick={scrollTo.profileBookings} className={styles.shortcutLink}>Favorite Venues</button>
            <button onClick={scrollTo.profileBookings} className={styles.shortcutLink}>Edit Profile</button>
          </div>
          <button className={styles.signOutButton} onClick={handleSignOut}>Sign out</button>
          <div className={styles.dividerLine}></div>
          <div className={styles.profileFutureBooking}>
              <h3>Future Booking</h3>
              <div className={styles.profileFutureBookingContent}>
                <p>19th April 2025</p>
                <p>Hotel Floralize</p>
                <p>1 Adult</p>
              </div>
            </div>
        </div>
      </section>
      <section className={styles.rightSection}>
        <div className={styles.rightBorder}>
          <div className={styles.bookings}>
            <div className={styles.bookingsTitle}>
              <h2>My Bookings</h2>
              <div className={styles.bookingsFilter}>
                <button className={styles.futureBookingButton}>Future</button>
                <button className={styles.previousBookingButton}>Previous</button>
              </div>
            </div>
            <div className={styles.allBookings}>
            </div>
          </div>
          <div className={styles.favorites}>
            <div className={styles.favoriteTitle}>
              <h2>Favorite Venues</h2>
            </div>
            <div className={styles.allFavorites}>
              {favoriteVenues.length > 0 ? (
                favoriteVenues.map((venue, index) => (
                  <div key={index} className={styles.favoriteVenue}>
                    <h3>{venue.name}</h3>
                    <p>{venue.location}</p>
                  </div>
                ))
              ) : (
                <p>No favorite venues found.</p>
              )}
            </div>
          </div>
          <div className={styles.edit}>
            <div className={styles.editTitle}>
              <h2>Edit Profile</h2>
            </div>
            <div className={styles.allEdits}>
            </div>
          </div>
        </div>
      </section>

      {showPopup && (
  <div className={styles.popupOverlay}>
    <div className={styles.popup}>
      <h2>Signing off...</h2>
    </div>
  </div>
)}
</div>
    </motion.div>
  );
};

export default CostumerProfile;
