import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminProfile.module.css';
import { motion } from "framer-motion";
import { PROFILES_SINGLE, PROFILES_SINGLE_BY_VENUES } from '../../constants';
import { headers } from '../../headers';
import defaultAvatar from '/media/images/mdefault.jpg';
import VenueCardSecondType from '../../components/VenueCardSecondType/VenueCardSecondType.jsx';
import Buttons from '../../components/Buttons/Buttons';
import VenueDetailsPopup from '../../components/VenueDetailsPopup/VenueDetailsPopup';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const AdminProfile = () => {
  const [userData, setUserData] = useState({});
  const [assignedVenues, setAssignedVenues] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const navigate = useNavigate();
  const editRef = useRef(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem('accessToken');
      const username = localStorage.getItem('username');

      if (!token || !username) {
        console.error('Missing token or name in localStorage');
        return;
      }

      try {
        const adminProfileUrl = PROFILES_SINGLE.replace("<name>", username);
        const response = await fetch(adminProfileUrl, {
          method: 'GET',
          headers: headers(token),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.errors?.[0]?.message || 'Failed to fetch admin data');
        }

        setUserData(data.data || {});
        setNewName(data.data.name);
        setNewAvatar(data.data.avatar?.url || '');

        const venuesResponse = await fetch(PROFILES_SINGLE_BY_VENUES.replace('<name>', username), {
          method: 'GET',
          headers: headers(token),
        });

        const venuesData = await venuesResponse.json();
        if (venuesResponse.ok) {
          setAssignedVenues(venuesData.data || []);
        } 
        else {
          console.error('Failed to fetch venues');
        }
      } 
      catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchAdminData();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    setShowPopup(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 1500);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    if (editRef.current) {
      editRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };  

  useEffect(() => {
    if (isModalVisible) {
      document.body.style.overflow = 'hidden';
    } 
    else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalVisible]);  

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');
  
    if (!token || !username) {
      console.error('Missing token or name in localStorage');
      return;
    }
  
    const updateData = {};
    if (newName) updateData.name = newName;
  
    const avatarData = newAvatar.trim() ? { url: newAvatar.trim(), alt: `${newName || username}'s avatar` } : undefined;
    if (avatarData) updateData.avatar = avatarData;
  
    if (Object.keys(updateData).length === 0) {
      console.error('At least one field (name or avatar) must be provided.');
      return;
    }
  
    try {
      const response = await fetch(`${PROFILES_SINGLE.replace("<name>", username)}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify(updateData),
      });
  
      const data = await response.json();
      if (response.ok) {
        setUserData(data.data);
        setIsEditing(false);
      } 
      else {
        console.error('Failed to update profile', data.errors);
      }
    }
    catch (error) {
      console.error('Error updating profile:', error);
    }
  };  

  const handleRedirect = () => {
    navigate('/create-venue');
  };

  const nextImage = () => {
    if (selectedVenue?.media?.length) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % selectedVenue.media.length);
    }
  };
  
  const prevImage = () => {
    if (selectedVenue?.media?.length) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? selectedVenue.media.length - 1 : prevIndex - 1
      );
    }
  }; 

  const handleVenueClick = (venue) => {
    console.log("Venue clicked:", venue);
    setSelectedVenue(venue);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedVenue(null);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains(styles.modalOverlay)) {
      closeModal();
    }
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
                  alt={userData.name || 'Admin Avatar'}
                />
              <h3>{capitalizeFirstLetter(userData.name) || 'Admin'}</h3>
              </div>
              <div className={styles.profileShortcuts}>
              <button className={styles.shortcutLink} onClick={handleRedirect}>Create New Venue</button>
                <button className={styles.shortcutLink} onClick={handleEditProfile}>Edit Profile</button>
                <button className={styles.signOutButton} onClick={handleSignOut}>Sign out</button>
              </div>
            </div>
          </section>

          <section className={styles.rightSection}>
            <div className={styles.rightBorder}>
              <div className={styles.bookings}>
                <div className={styles.bookingsTitle}>
                  <h2>All Venues</h2>
                </div>
                <div className={styles.allBookings}>
                  {assignedVenues.length > 0 ? (
                    <div className={styles.adminBookings}>
                      {assignedVenues.map((venue) => (
                        <VenueCardSecondType key={venue.id} venue={venue} onClick={() => handleVenueClick(venue)} />
                      ))}
                    </div>
                  ) : (
                    <p>No venues assigned yet.</p>
                  )}
                </div>
              </div>

                <div className={styles.edit} ref={editRef}>
                  <div className={styles.editTitle}>
                    <h2>Edit Profile</h2>
                  </div>
                  <div className={styles.allEdits}>
                    <form className={styles.editForm} onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
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

        {showPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popup}>
              <h2>Signing off...</h2>
            </div>
          </div>
        )}

{isModalVisible && selectedVenue && (
  <VenueDetailsPopup
    selectedVenue={selectedVenue}
    selectedBooking={null}
    isLoading={false}
    isModalVisible={isModalVisible}
    closeModal={closeModal}
    prevImage={prevImage}
    nextImage={nextImage}
    userRole="admin"
  />
)}

      </div>
    </motion.div>
  );
};

export default AdminProfile;