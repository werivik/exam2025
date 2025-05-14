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

import starRating from '../../../media/rating/christmas-stars.png';
import bannerImage from '../../../media/logo/loadingScreen.png';
import bannerEdge from '../../../media/images/beige-edge.png';

import Dashboard from '../../components/Dashboard/Dashboard.jsx';

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
  const [newBanner, setNewBanner] = useState('');
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
const profileRef = useRef(null);
const venuesRef = useRef(null);
const bookingsRef = useRef(null);

  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [showDashboard, setShowDashboard] = useState(false);

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
    setNewBanner(data.data.banner?.url || '');

    const venuesResponse = await fetch(PROFILES_SINGLE_BY_VENUES.replace('<name>', username), {
      method: 'GET',
      headers: headers(token),
    });

    const venuesData = await venuesResponse.json();
    if (venuesResponse.ok) {
      const venues = venuesData.data || [];

      setAssignedVenues(venues);
      setFilteredVenues(venues);

      let totalRating = 0;
      let reviewCount = 0;

      venues.forEach((venue) => {
        if (venue.rating && venue.rating > 0 && venue._count?.reviews > 0) {
          totalRating += venue.rating * venue._count.reviews;
          reviewCount += venue._count.reviews;
        }
      });

      if (reviewCount > 0) {
        const avg = totalRating / reviewCount;
        setAverageRating(Math.min(5, parseFloat(avg.toFixed(1))));
        setTotalReviews(reviewCount);
      } 
      else {
        setAverageRating(0);
        setTotalReviews(0);
      }
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

const bannerData = newBanner.trim() ? { url: newBanner.trim(), alt: `${newName || username}'s banner` } : undefined;
if (bannerData) updateData.banner = bannerData;
  
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

  useEffect(() => {
  if (isModalVisible) {
    document.body.classList.add('modal-open');
  } 
  else {
    document.body.classList.remove('modal-open');
  }
  return () => {
    document.body.classList.remove('modal-open');
  };
}, [isModalVisible]);


const handleVenueClick = (venue) => {
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

  const scrollToSection = (ref) => {
  if (ref?.current) {
    ref.current.scrollIntoView({ behavior: 'smooth' });
    toggleDashboard();
  }
};

  const toggleDashboard = () => setShowDashboard(prev => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.entries(inputRefs).forEach(([key, ref]) => {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowLocationSuggestions(prev => ({ ...prev, [key]: false }));
        }
      });
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);   

    useEffect(() => {
    if (showDashboard) {
      document.body.style.overflow = 'hidden';
    } 
    
    else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDashboard]);  

  const userRole = userData?.venueManager ? "admin" : "customer";

  return (
    <motion.div
      className={styles.pageContent}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >

  {showDashboard && <div className={styles.backdrop} onClick={toggleDashboard}></div>}
<Dashboard
  showDashboard={showDashboard}
  toggleDashboard={toggleDashboard}
  userRole={userRole}
  onScrollToProfileTop={() => scrollToSection(profileRef)}
  onScrollToProfileEdit={() => scrollToSection(editRef)}
  onScrollToVenues={() => scrollToSection(venuesRef)}
  onSignOut={handleSignOut}
/>
      <div className={`${styles.blurWrapper} ${showPopup ? styles.blurred : ''}`}>
        <div className={styles.profilePage}>

          <section className={styles.dashViewProfile} ref={profileRef}>
            <div className={styles.dashProfileTop}>
              <div className={styles.dashProfileBanner}>
                <img src={userData.banner?.url || bannerImage} alt="Profile Banner" />
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
                <div className={styles.profileRating}>
                  <img src={starRating} alt="Star rating" />
                  {averageRating}<span> / ({totalReviews}) reviews</span>
                </div>
                <div className={styles.dashboardButton}>
                  <Buttons size='small' version='v2' onClick={toggleDashboard}>Dashboard</Buttons>
                </div>
              </div>
              <div className={styles.dashBottom}>
                <div className={styles.dashDivideLine}></div>
                <div className={styles.dashVenues} ref={venuesRef}>
                  <div className={styles.dashVenuesTitle}>
                    <h3>Venues</h3>
                    <Buttons size="small" version="v1" onClick={handleRedirect}>Create Venue</Buttons>
                  </div>
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
                <p>No venues Made yet.</p>
              )}
                </div>
                <div className={styles.dashDivideLine}></div>
              <div className={styles.dashEdit} ref={editRef}>
                <h3>Edit Profile</h3>
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
                      <label>
                        Banner URL:
                        <input
                          type="url"
                          value={newBanner}
                          onChange={(e) => setNewBanner(e.target.value)}
                        />
                      </label>
                      <div className={styles.editActions}>
                        <Buttons type="submit" size="small" version="v1">Save Changes</Buttons>
                      </div>
                    </form>
                  </div>
              </div>
              </div>

          </section>

          <section className={styles.profileContentTop} ref={profileRef}>
            <div className={styles.profileBorder}>
            <div className={styles.profileTop}>
              <div className={styles.profileBanner}>
                <img src={userData.banner?.url || bannerImage} alt="Profile Banner" />
              </div>
              <div className={styles.profileAvatarContent}>
                <img src={bannerEdge} className={styles.profileEdgeLeft}></img>
                <img
                  className={styles.profileAvatar}
                  src={userData.avatar?.url || defaultAvatar}
                  alt={userData.name || 'Admin Avatar'}
                />
                <img src={bannerEdge} className={styles.profileEdgeRight}></img>
              </div>
            </div>
              <div className={styles.profileContentInfo}>
              <h2>{capitalizeFirstLetter(userData.name) || 'Admin'}</h2>
              <p>Venue Manager</p>
              <div className={styles.profileRating}>
                <img src={starRating} alt="Star rating" />
                {averageRating}<span> / ({totalReviews}) reviews</span>
              </div>
              <Buttons size='small' version='v2' onClick={toggleDashboard}>Dashboard</Buttons>
            </div>
            </div>
          </section>

          <div className={styles.divideLineProfile}></div>

          <section className={styles.rightSection}>
            <div className={styles.rightBorder}>
              <div className={styles.venues} ref={venuesRef}>
                <div className={styles.venuesTitle}>
                  <h2>My Venues</h2>
                  <Buttons size='small' version='v1' onClick={handleRedirect}>Create Venue</Buttons>
                </div>
                <div className={styles.allVenues}>
                {filteredVenues.length > 0 ? (
                  <div className={styles.adminVenues}>
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
                
                <div className={styles.divideLineContent}></div>

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
                      <label>
                        Banner URL:
                        <input
                          type="url"
                          value={newBanner}
                          onChange={(e) => setNewBanner(e.target.value)}
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