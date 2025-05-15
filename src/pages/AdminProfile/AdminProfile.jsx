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
import CostumPopup from '../../components/CostumPopup/CostumPopup';
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
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [showDashboard, setShowDashboard] = useState(false);
  const navigate = useNavigate();

  const mobileRefs = {
    profile: useRef(null),
    edit: useRef(null),
    venues: useRef(null),
    bookings: useRef(null)
  };

  const desktopRefs = {
    profile: useRef(null),
    edit: useRef(null),
    venues: useRef(null),
    banner: useRef(null)
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');

    if (!token || !username) {
      console.error('Missing token or name in localStorage');
      return;
    }

    try {
      const profileUrl = PROFILES_SINGLE.replace("<name>", username);
      const response = await fetch(profileUrl, {
        method: 'GET',
        headers: headers(token),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || 'Failed to fetch user data');
      }

      setUserData(data.data || {});
      setNewName(data.data.name);
      setNewAvatar(data.data.avatar?.url || '');
      setNewBanner(data.data.banner?.url || '');

      await fetchUserVenues(token, username);
    } 
    catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserVenues = async (token, username) => {
    try {
      const venuesResponse = await fetch(PROFILES_SINGLE_BY_VENUES.replace('<name>', username), {
        method: 'GET',
        headers: headers(token),
      });

      const venuesData = await venuesResponse.json();
      if (venuesResponse.ok) {
        const venues = venuesData.data || [];

        setAssignedVenues(venues);
        setFilteredVenues(venues);

        calculateRatings(venues);
      } 
      else {
        console.error('Failed to fetch venues');
      }
    } 
    catch (error) {
      console.error('Error fetching user venues:', error);
    }
  };

const calculateRatings = (venues) => {
  let totalRating = 0;
  let ratedVenueCount = 0;

  venues.forEach((venue) => {
    if (venue.rating && venue.rating > 0) {
      totalRating += venue.rating;
      ratedVenueCount += 1;
    }
  });

  if (ratedVenueCount > 0) {
    const avg = totalRating / ratedVenueCount;
    setAverageRating(Math.min(5, parseFloat(avg.toFixed(1))));
    setTotalReviews(ratedVenueCount);
  } 
  else {
    setAverageRating(0);
    setTotalReviews(0);
  }
};

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

    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  const handleCancelSignOut = () => {
    setShowPopup(false);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    if (mobileRefs.edit.current) {
      mobileRefs.edit.current.scrollIntoView({ behavior: 'smooth' });
    }
  };  

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

  const handleCreateVenue = () => {
    navigate('/create-venue');
  };

  const handleVenueClick = (venue) => {
    setSelectedVenue(venue);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedVenue(null);
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

  const toggleDashboard = () => setShowDashboard(prev => !prev);

  const scrollToSection = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
      if (showDashboard) {
        toggleDashboard();
      }
    }
  };

  useEffect(() => {
    const shouldLockScroll = isModalVisible || showDashboard;
    document.body.style.overflow = shouldLockScroll ? 'hidden' : '';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalVisible, showDashboard]);

  const RatingDisplay = () => (
    <div className={styles.rating}>
      <img src={starRating} alt="Star rating" />
      {averageRating}<span> / ({totalReviews}) reviews</span>
    </div>
  );

  const EditProfileForm = () => (
    <form className={styles.editForm} onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
      <label>
        Name:
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        {usernameError && <span className={styles.error}>{usernameError}</span>}
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
      <div className={styles.actionBtns}>
        <Buttons type="submit" size="small" version="v1">Save Changes</Buttons>
      </div>
    </form>
  );

  return (
    <motion.div
      className={styles.container}
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
        userRole="admin"
        onScrollToProfileTop={() => scrollToSection(mobileRefs.profile)}
        onScrollToProfileEdit={() => scrollToSection(mobileRefs.edit)}
        onScrollToVenues={() => scrollToSection(mobileRefs.venues)}
        onSignOut={handleSignOut}
      />
      
      <div className={`${styles.contentWrapper} ${showPopup ? styles.blurred : ''}`}>
        <div className={styles.profilePage}>
          <section className={styles.mobileProfile} ref={mobileRefs.profile}>
            <div className={styles.profileTop}>
              <div className={styles.bannerWrapper}>
                <img src={userData.banner?.url || bannerImage} alt="Profile Banner" />
              </div>
              <div className={styles.avatarWrapper}>
                <img src={bannerEdge} className={styles.edgeLeft}></img>
                <img
                  className={styles.avatar}
                  src={userData.avatar?.url || defaultAvatar}
                  alt={userData.name || 'User Avatar'}
                />
                <img src={bannerEdge} className={styles.edgeRight}></img>
              </div>
            </div>
            
            <div className={styles.profileInfo}>
              <h2>{capitalizeFirstLetter(userData.name) || 'User'}</h2>
              <p>Venue Manager</p>
              <RatingDisplay />
              <div className={styles.dashBtn}>
                <Buttons size='small' version='v2' onClick={toggleDashboard}>Dashboard</Buttons>
              </div>
            </div>
            
            <div className={styles.mobileContent}>
              <div className={styles.divider}></div>
              
              <div className={styles.venuesSection} ref={mobileRefs.venues}>
                <div className={styles.sectionHeader}>
                  <h3>Venues</h3>
                  <Buttons size="small" version="v1" onClick={handleCreateVenue}>Create Venue</Buttons>
                </div>
                
                {filteredVenues.length > 0 ? (
                  <div className={styles.venueGrid}>
                    {filteredVenues.map((venue) => (
                      <VenueCardSecondType
                        key={venue.id}
                        venue={venue}
                        onClick={() => handleVenueClick(venue)}
                      />
                    ))}
                  </div>
                ) : (
                  <p>No venues yet.</p>
                )}
              </div>
              
              <div className={styles.divider}></div>
              
              <div className={styles.editSection} ref={mobileRefs.edit}>
                <h3>Edit Profile</h3>
                <div className={styles.editContent}>
                  <EditProfileForm />
                </div>
              </div>
            </div>
          </section>

          <div className={styles.desktopProfile}>
            <section className={styles.sidebar}>
              <div className={styles.sidebarContent}>
                <div className={styles.userInfo}>
                  <img
                    className={styles.avatar}
                    src={userData.avatar?.url || defaultAvatar}
                    alt={userData.name || 'User Avatar'}
                  />
                  <h2>{capitalizeFirstLetter(userData.name) || 'User'}</h2>
                  <p>Venue Manager</p>
                  <RatingDisplay />
                </div>
                
                <div className={styles.divider}></div>
                
                <div className={styles.navLinks}>
                  <div className={styles.linkGroup}>
                    <h3>Venues</h3>
                    <button onClick={() => scrollToSection(desktopRefs.venues)}>My Venues</button>
                    <button onClick={handleCreateVenue}>Create Venue</button>
                    <button onClick={() => scrollToSection(desktopRefs.venues)}>Edit Venue</button>
                  </div>
                  
                  <div className={styles.divider}></div>
                  
                  <div className={styles.linkGroup}>
                    <h3>Profile</h3>
                    <button onClick={() => scrollToSection(desktopRefs.banner)}>View Profile</button>
                    <button onClick={() => scrollToSection(desktopRefs.edit)}>Edit Profile</button>
                  </div>
                  
                  <div className={styles.signOutBtnWrapper}>
                    <Buttons size="small" version="v1" onClick={handleSignOut}>Sign out</Buttons>
                  </div>
                </div>
              </div>
            </section>
            
            <section className={styles.mainContent}>
              <div className={styles.bannerWrapper} ref={desktopRefs.banner}>
                <img src={userData.banner?.url || bannerImage} alt="Profile Banner" />
              </div>
              
              <div className={styles.venuesSection} ref={desktopRefs.venues}>
                <div className={styles.sectionHeader}>
                  <h2>My Venues</h2>
                  <Buttons size='small' version='v1' onClick={handleCreateVenue}>Create Venue</Buttons>
                </div>
                
                <div className={styles.venuesContent}>
                  {filteredVenues.length > 0 ? (
                    <div className={styles.venueGrid}>
                      {filteredVenues.map((venue) => (
                        <VenueCardSecondType
                          key={venue.id}
                          venue={venue}
                          onClick={() => handleVenueClick(venue)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p>No venues available.</p>
                  )}
                </div>
              </div>
              
              <div className={styles.divider}></div>
              
              <div className={styles.editSection} ref={desktopRefs.edit}>
                <div className={styles.sectionHeader}>
                  <h2>Edit Profile</h2>
                </div>
                
                <div className={styles.editContent}>
                  <EditProfileForm />
                </div>
              </div>
            </section>
          </div>

          <div className={styles.tabletProfile}>
            <section className={styles.profileHeader} ref={desktopRefs.profile}>
              <div className={styles.bannerWrapper}>
                <img src={userData.banner?.url || bannerImage} alt="Profile Banner" />
              </div>
              <div className={styles.avatarContainer}>
                <img src={bannerEdge} className={styles.edgeLeft}></img>
                <img
                  className={styles.avatar}
                  src={userData.avatar?.url || defaultAvatar}
                  alt={userData.name || 'User Avatar'}
                />
                <img src={bannerEdge} className={styles.edgeRight}></img>
              </div>
              
              <div className={styles.profileInfo}>
                <h2>{capitalizeFirstLetter(userData.name) || 'User'}</h2>
                <p>Venue Manager</p>
                <RatingDisplay />
                <Buttons size='small' version='v2' onClick={toggleDashboard}>Dashboard</Buttons>
              </div>
            </section>
            
            <div className={styles.divider}></div>

            <section className={styles.tabletContent}>
              <div className={styles.contentContainer}>
                <div className={styles.venuesSection} ref={mobileRefs.venues}>
                  <div className={styles.sectionHeader}>
                    <h2>My Venues</h2>
                    <Buttons size='small' version='v1' onClick={handleCreateVenue}>Create Venue</Buttons>
                  </div>
                  
                  <div className={styles.venuesContent}>
                    {filteredVenues.length > 0 ? (
                      <div className={styles.venueGrid}>
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
                
                <div className={styles.divider}></div>
                
                <div className={styles.editSection} ref={mobileRefs.edit}>
                  <div className={styles.sectionHeader}>
                    <h2>Edit Profile</h2>
                  </div>
                  
                  <div className={styles.editContent}>
                    <EditProfileForm />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
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
      
      {showPopup && (
        <CostumPopup
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
        <CostumPopup
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