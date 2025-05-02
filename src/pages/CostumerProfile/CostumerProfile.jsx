import { useState, useEffect } from 'react';
import styles from './CostumerProfile.module.css';
import { motion } from "framer-motion";
import { PROFILES_SINGLE } from '../../constants';
import { headers } from '../../headers';
import defaultAvatar from '/media/images/mdefault.jpg';
import Buttons from '../../components/Buttons/Buttons';
import { updateProfile } from '../../auth/auth';
import { PROFILES_SINGLE_BY_BOOKINGS } from '../../constants';
import { VENUE_SINGLE } from '../../constants';
import VenueBooked from '../../components/VenueBooked/VenueBooked';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const CostumerProfile = () => {
  const [userData, setUserData] = useState({});
  const [bookedVenues, setBookedVenues] = useState([]);  
  const [favoriteVenues, setFavoriteVenues] = useState([]);  
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successPopupMessage, setSuccessPopupMessage] = useState('');  
  
  const username = localStorage.getItem('username');

  const [isVenuesLoading, setIsVenuesLoading] = useState(true);   
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setHasError(true);
          return;
        }
  
        const userProfileUrl = `${PROFILES_SINGLE.replace("<name>", username)}?_bookings=true`;
        const response = await fetch(userProfileUrl, {
          method: 'GET',
          headers: headers(token),
        });
  
        if (!response.ok) throw new Error('Failed to fetch user profile');
        const data = await response.json();
        const profile = data.data;
  
        setUserData(profile);
        setNewName(profile?.name || '');
        setNewAvatar(profile?.avatar?.url || '');
  
        const venuesFromBookings = profile.bookings.map((booking) => {
          if (!booking.venue) return null;
  
          return {
            ...booking.venue,
            dateFrom: booking.dateFrom,
            dateTo: booking.dateTo,
            guests: booking.guests,
          };
        }).filter(Boolean);
  
        setBookedVenues(venuesFromBookings);
        setIsVenuesLoading(false);
      } 
      
      catch (error) {
        setHasError(true);
        console.error('Error fetching data:', error);
      }
    };
  
    fetchUserData();
  }, [username]);
    
  const fetchVenueDetails = async (venueId) => {
    try {
      const response = await fetch(`${VENUE_SINGLE}${venueId}`);
      const venueData = await venueResponse.json();
      
      console.log("Venue Response:", venueData);
  
      if (venueResponse.ok) {
        return venueData.data;
      } 
      
      else {
        throw new Error(venueData.errors?.[0]?.message || 'Failed to fetch venue');
      }
    } 
    
    catch (error) {
      console.error('Error fetching venue details:', error);
      return null;
    }
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();

    const sanitizedNewName = newName || '';
    const sanitizedNewAvatar = newAvatar || '';

    const token = localStorage.getItem('accessToken');
    console.log('Access Token:', token);

    console.log('Submitting profile update with:', {
      username,
      newName: sanitizedNewName,
      newAvatar: sanitizedNewAvatar
    });
  
    if (!sanitizedNewName.trim() && !sanitizedNewAvatar.trim()) {
      alert('At least one of the fields (Name or Avatar URL) must be provided.');
      return;
    }

    try {
      const result = await updateProfile({
        username,
        newName: sanitizedNewName,
        newAvatar: sanitizedNewAvatar,
      });
      console.log('Profile updated successfully:', result);
      setUserData((prev) => ({
        ...prev,
        name: sanitizedNewName,
        avatar: { url: sanitizedNewAvatar, alt: `${sanitizedNewName}'s avatar` },
      }));

      setSuccessPopupMessage('Profile updated successfully!');
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
      }, 1000);      
    } 
    
    catch (err) {
      console.error('Profile update error:', err);
      alert(`Failed to update profile: ${err.message}`);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    setShowPopup(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
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
        <div className={styles.profilePage}>
          <section className={styles.leftSection}>
            <div className={styles.leftBorder}>
              <div className={styles.profileLeftTop}>
                <img
                  src={userData.avatar?.url || defaultAvatar}
                  alt={userData.name || 'User Avatar'}
                />
                <h3>{capitalizeFirstLetter(userData.name) || 'Guest'}</h3>
              </div>
              <div className={styles.profileShortcuts}>
                <button className={styles.shortcutLink}>
                  My Bookings
                </button>
                <button className={styles.shortcutLink}>
                  Favorite Venues
                </button>
                <button className={styles.shortcutLink}>
                  Edit Profile
                </button>
              </div>
              <button className={styles.signOutButton} onClick={handleSignOut}>Sign out</button>
            </div>
          </section>
          <section className={styles.rightSection}>
            <div className={styles.rightBorder}>
<div className={styles.bookings}>
  <div className={styles.bookingsTitle}>
    <h2>My Bookings</h2>
    <div className={styles.bookingsFilter}>
      <Buttons size="medium" version="v1">Future</Buttons>
      <Buttons size="medium" version="v2">Previous</Buttons>
    </div>
  </div>
  <div className={styles.allBookings}>
    {isVenuesLoading ? (
      <div>Loading booked venues...</div>
    ) : bookedVenues.length > 0 ? (
      <div className={styles.costumerBookings}>
{bookedVenues.map((venue) => (
  <VenueBooked key={venue.id} venue={venue} />
))}
      </div>
    ) : (
      <p>No Venues Booked yet.</p>
    )}
  </div>
</div>
              <div className={styles.favorites}>
                <div className={styles.favoriteTitle}>
                  <h2>Favorite Venues</h2>
                </div>
                <div className={styles.allFavorites}>
                  {favoriteVenues.length > 0 ? (
                    favoriteVenues.map((venue, index) => (
                      <div key={index} className={styles.favoriteVenue}></div>
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
                  <form onSubmit={handleSubmit} className={styles.editForm}>
                    <label>
                      Name:
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                      />
                    </label>
                    <label>
                      Avatar URL:
                      <input
                        type="url"
                        value={newAvatar}
                        onChange={(e) => setNewAvatar(e.target.value)}
                      />
                    </label>
                    <div className={styles.editActions}>
                      <Buttons type="submit" size="small" version="v2">Save Changes</Buttons>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </div>

        {showSuccessPopup && (
  <div className={styles.popupOverlay}>
    <div className={styles.popup}>
      <h2>{successPopupMessage}</h2>
    </div>
  </div>
)}

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
