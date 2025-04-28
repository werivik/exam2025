import { useState, useEffect } from 'react';
import styles from './AdminProfile.module.css';
import { motion } from "framer-motion";
import { PROFILES_SINGLE } from '../../constants';
import { headers } from '../../headers';
import defaultAvatar from '/media/images/mdefault.jpg';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const AdminProfile = () => {
  const [userData, setUserData] = useState({});
  const [assignedVenues, setAssignedVenues] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('');

  useEffect(() => {

    const fetchAdminData = async () => {
      const token = localStorage.getItem('accessToken');
      const username = localStorage.getItem('username');
      console.log('Token:', token);
      console.log('Username:', username);
    
      if (!token || !username) {
        console.error('Missing token or name in localStorage');
        return;
      }
    
      try {
        const adminProfileUrl = `${PROFILES_SINGLE}/${username}`;
        const response = await fetch(adminProfileUrl, {
          method: 'GET',
          headers: headers(token),
        });
    
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.errors?.[0]?.message || 'Failed to fetch admin data');
        }
    
        console.log('Admin data:', data);
        setUserData(data.data || {});
      } 
      
      catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };    

    fetchAdminData();
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
                alt={userData.name || 'Admin Avatar'}
              />
              <h3>Welcome back, {userData.name || 'Admin'}</h3>
            </div>
            <div className={styles.profileShortcut}>
              <button onClick={scrollTo.profileBookings} className={styles.shortcutLink}>Manage Venues</button>
              <button onClick={scrollTo.profileBookings} className={styles.shortcutLink}>Bookings</button>
              <button onClick={scrollTo.profileBookings} className={styles.shortcutLink}>Edit Profile</button>
            </div>
            <button className={styles.signOutButton} onClick={handleSignOut}>Sign out</button>
            <div className={styles.dividerLine}></div>
            <div className={styles.profileFutureBooking}>
              <h3>Upcoming Events/Tasks</h3>
              <div className={styles.profileFutureBookingContent}>
                <p>Admin Task: Venue Approval</p>
                <p>Meeting with Clients: 21st May 2025</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.rightSection}>
          <div className={styles.rightBorder}>
            <div className={styles.bookings}>
              <div className={styles.bookingsTitle}>
                <h2>Bookings</h2>
                <div className={styles.bookingsFilter}>
                  <button className={styles.futureBookingButton}>Upcoming</button>
                  <button className={styles.previousBookingButton}>Past</button>
                </div>
              </div>
              <div className={styles.allBookings}>
              </div>
            </div>

            <div className={styles.assignedVenues}>
              <div className={styles.favoriteTitle}>
                <h2>Assigned Venues</h2>
              </div>
              <div className={styles.allFavorites}>
                {assignedVenues.length > 0 ? (
                  assignedVenues.map((venue, index) => (
                    <div key={index} className={styles.favoriteVenue}>
                      <h3>{venue.name}</h3>
                      <p>{venue.location}</p>
                    </div>
                  ))
                ) : (
                  <p>No venues assigned yet.</p>
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

export default AdminProfile;
