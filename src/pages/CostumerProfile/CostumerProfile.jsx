import { useState, useEffect } from 'react';
import styles from './CostumerProfile.module.css';
import { PROFILES_SINGLE } from '../../constants';
import { headers } from '../../headers';

const CostumerProfile = () => {
  const [userData, setUserData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const name = localStorage.getItem('username')

        if (!token || !name) {
          console.warn('Missing token or name in localStorage');
          return;
        }

        const userProfileUrl = `${PROFILES_SINGLE}/${name}`;
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
      } 
      
      catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    window.location.reload();
  };

  return (
    <div className={styles.pageContent}>
      <section className={styles.leftSection}>
        <div className={styles.leftBorder}>
          <div className={styles.profileLeftTop}>
            <img
              src={userData.avatar?.url || 'default-avatar.jpg'}
              alt={userData.name || 'User Avatar'}
            />
            <h3>Welcome, {userData.name || 'Guest'}</h3>
          </div>
          <div className={styles.profileShortcut}>
            <p className={styles.shortcutLink}>My Bookings</p>
            <p className={styles.shortcutLink}>Favorite Venues</p>
            <p className={styles.shortcutLink}>Edit Profile</p>
          </div>
          <div className={styles.dividerLine}></div>
          <button className={styles.signOutButton} onClick={handleSignOut}>Sign out</button>
        </div>
      </section>
      <section className={styles.rightSection}>
        <div className={styles.rightBorder}>
          <div className={styles.profileBookings}>
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
          <div className={styles.profileFavorites}>
            <div className={styles.favoriteTitle}>
              <h2>Favorite Venues</h2>
            </div>
            <div className={styles.allFavorites}>
            </div>
          </div>
          <div className={styles.profileEdit}>
            <div className={styles.editTitle}>
              <h2>Edit Profile</h2>
            </div>
            <div className={styles.allEdits}>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CostumerProfile;
