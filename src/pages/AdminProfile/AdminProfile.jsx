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
import CustomPopup from '../../components/CostumPopup/CostumPopup';

import bannerImage from '../../../media/logo/loadingScreen.png';
import bannerEdge from '../../../media/images/beige-edge.png';

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
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showSigningOffPopup, setShowSigningOffPopup] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [assignedVenues, setAssignedVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); 
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
          setFilteredVenues(venuesData.data || []);
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

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);

    let sortedVenues = [...assignedVenues];

    if (filter === 'newest') {
      sortedVenues = sortedVenues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } 
    else if (filter === 'oldest') {
      sortedVenues = sortedVenues.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } 
    else {
      sortedVenues = assignedVenues;
    }

    setFilteredVenues(sortedVenues);
  };

  const handleSignOut = () => {
    setShowPopup(true);
  };

  const handleConfirmSignOut = () => {
    setShowPopup(false);
    setShowSigningOffPopup(true);

    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');

    setShowPopup(false);
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  const handleCancelSignOut = () => {
    setShowPopup(false);
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

    if (/\s/.test(newName)) {
      setUsernameError('Username cannot contain spaces');
      return;
    }
  
    const updateData = {};
    if (newName && newName !== userData.name) updateData.name = newName;
  
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
      console.log('Response Data:', data);
      if (response.ok) {
        setUserData(data.data);
        setIsEditing(false);

        if (newName && newName !== userData.name) {
          localStorage.setItem('username', newName);
        }
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

          <section className={styles.dashViewProfile}>
            <div className={styles.dashProfileTop}>
              <div className={styles.dashProfileBanner}>
                <img src={bannerImage}></img>
              </div>
              <div className={styles.dashProfileAvatar}>
                <img src={bannerEdge} className={styles.bannerEdgeLeft}></img>
                <img
                  className={styles.dashAvatar}
                  src={userData.avatar?.url || defaultAvatar}
                  alt={userData.name || 'Admin Avatar'}
                />
              </div>
              <img src={bannerEdge} className={styles.bannerEdgeRight}></img>
            </div>
            <div className={styles.dashProfileInfo}>
              <h2>{capitalizeFirstLetter(userData.name) || 'Admin'}</h2>
              <p>Venue Manager</p>
              <div className={styles.dashRating}>5<span> / reviews</span></div>
              <div className={styles.dashBio}>
                Felis dapibus placerat varius sapien eget dolor primis. Dis posuere molestie cras felis accumsan hendrerit lacus senectus ultrices molestie lacus consequat rutrum metus vestibulum. Lobortis habitant felis vulputate ut orci litora nisl pharetra lacinia consequat taciti. Ullamcorper congue pretium ornare diam congue tempus rhoncus. Tellus malesuada et morbi sapien sed urna metus ultrices dolor euismod augue nullam penatibus torquent vulputate pede sociosqu.
              </div>
              </div>
              <div className={styles.dashBottom}>
                <div className={styles.dashVenues}>
                <h3>Venues</h3>
              </div>
              <div className={styles.dashVenues}>
                <h3>Edit Profile</h3>
              </div>
              </div>
          </section>

          <section className={styles.dashEditProfile}>
          
          </section>

          <section className={styles.dashVenues}>
          
          </section>

          <section className={styles.dashBooking}>
          
          </section>



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
                <button className={styles.shortcutLink}>My Venues</button>
                <button className={styles.shortcutLink} onClick={handleRedirect}>Create New Venue</button>
                <button className={styles.shortcutLink} onClick={handleEditProfile}>Edit Profile</button>
                <button className={styles.signOutButton} onClick={handleSignOut}>Sign out</button>
              </div>
            </div>
          </section>
          <section className={styles.topSection}>
            <div className={styles.topBorder}>
              <div className={styles.profileTop}>
                <img
                  src={userData.avatar?.url || defaultAvatar}
                  alt={userData.name || 'Admin Avatar'}
                />
              <h3>{capitalizeFirstLetter(userData.name) || 'Admin'}</h3>
              </div>
              <div className={styles.topShortcuts}>
                <button className={styles.shortcutLink}>My Venues</button>
                <button className={styles.shortcutLink} onClick={handleRedirect}>Create New Venue</button>
                <button className={styles.shortcutLink} onClick={handleEditProfile}>Edit Profile</button>
                <button className={styles.topSignOutButton} onClick={handleSignOut}>Sign out</button>
              </div>
            </div>
          </section>
          <section className={styles.rightSection}>
            <div className={styles.rightBorder}>
              <div className={styles.bookings}>
                <div className={styles.bookingsTitle}>
                  <h2>My Venues</h2>
                  <div className={styles.bookingsFilter}>
                  <Buttons
                  size="medium"
                  version={activeFilter === 'all' ? 'v3' : 'v3'} 
                  onClick={() => handleFilterChange('all')}
                >
                  All
                </Buttons>
                <Buttons
                  size="medium"
                  version={activeFilter === 'newest' ? 'v1' : 'v1'} 
                  onClick={() => handleFilterChange('newest')}
                >
                  Newest
                </Buttons>
                <Buttons
                  size="medium"
                  version={activeFilter === 'oldest' ? 'v2' : 'v2'} 
                  onClick={() => handleFilterChange('oldest')}
                >
                  Oldest
                </Buttons>
                  </div>
                </div>
                <div className={styles.allBookings}>
                {filteredVenues.length > 0 ? (
                  <div className={styles.adminBookings}>
  {filteredVenues.map((venue) => (
    <VenueCardSecondType
      key={venue.id}
      venue={venue}
      onClick={() => handleVenueClick(venue)}
    />
  ))}
</div>
              ) : (
                <p>No venues available for this filter.</p>
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
        {showPopup && (
          <CustomPopup
            message="Are you sure you want to sign off?"
            title="Signing off"
            onConfirm={handleConfirmSignOut}
            onCancel={handleCancelSignOut}
            showButtons={true}
            disableAutoClose={false}
            hideBars={true}
          />
        )}

        {showSigningOffPopup && (
  <CustomPopup
    message="Signing off..."
    title=""
    showButtons={false}
    disableAutoClose={false}
    hideBars={false}
  />
)}
    </motion.div>
  );
};

export default AdminProfile;