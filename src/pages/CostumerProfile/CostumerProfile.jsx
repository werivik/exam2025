import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CostumerProfile.module.css';
import { motion } from "framer-motion";
import { PROFILES_SINGLE, VENUE_SINGLE, PROFILES_SINGLE_BY_BOOKINGS } from '../../constants';
import { headers } from '../../headers';
import defaultAvatar from '/media/images/mdefault.jpg';
import Buttons from '../../components/Buttons/Buttons';
import { updateProfile } from '../../auth/auth';
import VenueBooked from '../../components/VenueBooked/VenueBooked';
import VenueDetailsPopup from '../../components/VenueDetailsPopup/VenueDetailsPopup';
import CostumPopup from '../../components/CostumPopup/CostumPopup';
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

const CostumerProfile = () => {
  const [userData, setUserData] = useState({});
  const [bookedVenues, setBookedVenues] = useState([]);
  const [favoriteVenues, setFavoriteVenues] = useState([]);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [newBanner, setNewBanner] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showSigningOffPopup, setShowSigningOffPopup] = useState(false);
  const [successPopupMessage, setSuccessPopupMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [sortOption, setSortOption] = useState("default");
  
  const mobileRefs = {
    profile: useRef(null),
    edit: useRef(null),
    bookings: useRef(null)
  };

  const desktopRefs = {
    profile: useRef(null),
    edit: useRef(null),
    bookings: useRef(null),
    banner: useRef(null)
  };

  const username = localStorage.getItem('username');
  const [isVenuesLoading, setIsVenuesLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [editValues, setEditValues] = useState({
    dateFrom: '',
    dateTo: '',
    guests: 0,
  });
  const [isCancelPopupVisible, setIsCancelPopupVisible] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  const navigate = useNavigate();

  const userRole = userData.role || 'guest';

  useEffect(() => {
    fetchUserData();
  }, [username]);

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

  const fetchUserData = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const userProfileUrl = `${PROFILES_SINGLE.replace("<name>", username)}?_bookings=true`;
      const response = await fetch(userProfileUrl, {
        headers: headers(token),
      });

      if (!response.ok) throw new Error('Failed to fetch user profile');

      const data = await response.json();
      const profile = data.data;

      setUserData(profile);
      setNewName(profile.name || '');
      setNewAvatar(profile.avatar?.url || '');
      setNewBanner(profile.banner?.url || '');

      const venuesFromBookings = profile.bookings.map((booking) => {
        if (!booking.venue) return null;
        return {
          ...booking.venue,
          dateFrom: new Date(booking.dateFrom),
          dateTo: new Date(booking.dateTo),
          guests: booking.guests,
          bookingId: booking.id,
        };
      }).filter(Boolean);

      const uniqueVenues = venuesFromBookings.filter((v, i, self) =>
        i === self.findIndex((t) =>
          t.id === v.id &&
          t.dateFrom.getTime() === v.dateFrom.getTime() &&
          t.dateTo.getTime() === v.dateTo.getTime()
        )
      );

      uniqueVenues.sort((a, b) => a.dateFrom - b.dateFrom);
      setBookedVenues(uniqueVenues);
    } 
    catch (error) {
      console.error(error);
    } 
    finally {
      setIsVenuesLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfileBookings = async () => {
      if (!username) return;

      setIsLoading(true);
      setError(null);

      try {
        const url = PROFILES_SINGLE_BY_BOOKINGS.replace('<name>', username);
        
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No access token found');
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: headers(token)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch bookings');
        }

        const data = await response.json();
        setBookings(data.data || []);
      }
      catch (err) {
        console.error('Error fetching profile bookings:', err);
        setError(err.message);
        setBookings([]);
      } 
      finally {
        setIsLoading(false);
      }
    };

    fetchProfileBookings();
  }, [username]);

  const handleVenueClick = (venue) => {
    setSelectedVenue(venue);
    setSelectedBooking({
      id: venue.bookingId,
      guests: venue.guests,
      dateFrom: venue.dateFrom,
      dateTo: venue.dateTo,
    });
    setIsModalVisible(true);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    
    if (/\s/.test(newName)) {
      setUsernameError('Username cannot contain spaces');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('No access token found');
      }

      const updateData = {};
      if (newName && newName !== userData.name) updateData.name = newName;

      const avatarData = newAvatar.trim() ? { url: newAvatar.trim(), alt: `${newName || username}'s avatar` } : undefined;
      if (avatarData) updateData.avatar = avatarData;

      const bannerData = newBanner.trim() ? { url: newBanner.trim(), alt: `${newName || username}'s banner` } : undefined;
      if (bannerData) updateData.banner = bannerData;

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
        
        setSuccessPopupMessage('Profile updated successfully!');
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 2000);
      } 
      else {
        console.error('Failed to update profile', data.errors);
        throw new Error(data.errors?.[0]?.message || 'Failed to update profile');
      }
    } 
    catch (err) {
      console.error('Profile update error:', err);
      alert(`Failed to update profile: ${err.message}`);
    }
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

  const scrollToSection = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
      if (showDashboard) {
        toggleDashboard();
      }
    }
  };

  const today = new Date();

const filterVenues = (venues) => {
  let filtered = [];

  switch (filter) {
    case 'Future':
      filtered = venues.filter((venue) => venue.dateFrom >= today);
      break;
    case 'Previous':
      filtered = venues.filter((venue) => venue.dateFrom < today);
      break;
    default:
      filtered = [...venues];
  }

  switch (sortOption) {
    case 'nearestFuture':
      return [...filtered].sort((a, b) => a.dateFrom - b.dateFrom);
    case 'recentPast':
      return [...filtered].sort((a, b) => b.dateFrom - a.dateFrom);
    default:
      return filtered;
  }
};

  const filteredVenues = filterVenues(bookedVenues);

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const closeVenueDetailsModal = () => {
    setIsModalVisible(false);
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains(styles.modalOverlay)) {
      closeModal();
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    const token = localStorage.getItem('accessToken');
    if (!token || !bookingId) return;

    try {
      const response = await fetch(`/holidaze/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setBookedVenues((prev) => prev.filter((b) => b.bookingId !== bookingId));
      } 
      else {
        console.error('Failed to delete booking');
      }
    } 
    catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    if (mobileRefs.edit.current) {
      mobileRefs.edit.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleDashboard = () => setShowDashboard(prev => !prev);

  useEffect(() => {
    const shouldLockScroll = isModalVisible || showDashboard;
    document.body.style.overflow = shouldLockScroll ? 'hidden' : '';
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalVisible, showDashboard]);

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
      <div className={styles.editButtons}>
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
        userRole="customer"
        onScrollToProfileTop={() => scrollToSection(mobileRefs.profile)}
        onScrollToProfileEdit={() => scrollToSection(mobileRefs.edit)}
        onScrollToBookings={() => scrollToSection(mobileRefs.bookings)}
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
                <img src={bannerEdge} className={styles.edgeLeft} alt="Banner Edge" />
                <img
                  className={styles.avatar}
                  src={userData.avatar?.url || defaultAvatar}
                  alt={userData.name || 'User Avatar'}
                />
                <img src={bannerEdge} className={styles.edgeRight} alt="Banner Edge" />
              </div>
            </div>
            
            <div className={styles.profileInfo}>
              <h2>{capitalizeFirstLetter(userData.name) || 'Guest'}</h2>
              <p>Customer</p>
              <div className={styles.dashBtn}>
                <Buttons size='small' version='v2' onClick={toggleDashboard}>Dashboard</Buttons>
              </div>
            </div>
            
            <div className={styles.mobileContent}>
              <div className={styles.divider}></div>
              
              <div className={styles.bookingsSection} ref={mobileRefs.bookings}>
                <div className={styles.sectionHeader}>
                  <h3>My Bookings</h3>
                  <div className={styles.bookingsFilter}>
                    <Buttons size="small" version="v3" onClick={() => setFilter('All')}>All</Buttons>
                    <Buttons size="small" version="v1" onClick={() => setFilter('Future')}>Future</Buttons>
                    <Buttons size="small" version="v2" onClick={() => setFilter('Previous')}>Previous</Buttons>
                  </div>
                </div>
                
                {isVenuesLoading ? (
                  <div>Loading...</div>
                ) : filteredVenues.length > 0 ? (
                  <div className={styles.venueGrid}>
                    {filteredVenues.map((venue) => (
                      <VenueBooked
                        key={`${venue.id}-${venue.dateFrom.getTime()}`}
                        venue={venue}
                        onClick={() => handleVenueClick(venue)}
                      />
                    ))}
                  </div>
                ) : (
                  <p>No venues booked yet.</p>
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
                  <h2>{capitalizeFirstLetter(userData.name) || 'Guest'}</h2>
                  <p>Customer</p>
                </div>
                
                <div className={styles.divider}></div>
                
                <div className={styles.navLinks}>
                  <div className={styles.linkGroup}>
                    <h3>Bookings</h3>
                    <button onClick={() => scrollToSection(desktopRefs.bookings)}>My Bookings</button>
                    <button onClick={() => navigate('/venues')}>Explore Venues</button>
                  </div>
                  
                  <div className={styles.divider}></div>
                  
                  <div className={styles.linkGroup}>
                    <h3>Profile</h3>
                    <button onClick={() => scrollToSection(desktopRefs.banner)}>View Profile</button>
                    <button onClick={() => scrollToSection(desktopRefs.edit)}>Edit Profile</button>
                  </div>
                  
                  <div className={styles.signOutBtnWrapper}>
                    <Buttons size="small" version="v2" onClick={handleSignOut}>Sign out</Buttons>
                  </div>
                </div>
              </div>
            </section>
            
            <section className={styles.mainContent}>
              <div className={styles.bannerWrapper} ref={desktopRefs.banner}>
                <img src={userData.banner?.url || bannerImage} alt="Profile Banner" />
              </div>
              
              <div className={styles.bookingsSection} ref={desktopRefs.bookings}>
                <div className={styles.sectionHeader}>
                  <h2>My Bookings</h2>
                  <div className={styles.bookingsFilter}>
                    <label>Sort By:</label>
<select
  value={sortOption}
  onChange={(e) => setSortOption(e.target.value)}
  className={styles.sortDropdown}
>
  <option value="default">All</option>
  <option value="nearestFuture">Nearest Future</option>
  <option value="recentPast">Previous</option>
</select>

                  </div>
                </div>
                
                <div className={styles.bookingsContent}>
                  {isVenuesLoading ? (
                    <div>Loading...</div>
                  ) : filteredVenues.length > 0 ? (
                    <div className={styles.venueGrid}>
                      {filteredVenues.map((venue) => (
                        <VenueBooked
                          key={`${venue.id}-${venue.dateFrom.getTime()}`}
                          venue={venue}
                          onClick={() => handleVenueClick(venue)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p>No venues booked yet.</p>
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
                <img src={bannerEdge} className={styles.edgeLeft} alt="Banner Edge" />
                <img
                  className={styles.avatar}
                  src={userData.avatar?.url || defaultAvatar}
                  alt={userData.name || 'User Avatar'}
                />
                <img src={bannerEdge} className={styles.edgeRight} alt="Banner Edge" />
              </div>
              
              <div className={styles.profileInfo}>
                <h2>{capitalizeFirstLetter(userData.name) || 'Guest'}</h2>
                <p>Customer</p>
                <Buttons size='small' version='v2' onClick={toggleDashboard}>Dashboard</Buttons>
              </div>
            </section>
            
            <div className={styles.divider}></div>

            <section className={styles.tabletContent}>
              <div className={styles.contentContainer}>
                <div className={styles.bookingsSection} ref={mobileRefs.bookings}>
                  <div className={styles.sectionHeader}>
                    <h2>My Bookings</h2>
                    <div className={styles.bookingsFilter}>
                      <Buttons size="small" version="v1" onClick={() => setFilter('All')}>All</Buttons>
                      <Buttons size="small" version="v1" onClick={() => setFilter('Future')}>Future</Buttons>
                      <Buttons size="small" version="v2" onClick={() => setFilter('Previous')}>Previous</Buttons>
                    </div>
                  </div>
                  
                  <div className={styles.bookingsContent}>
                    {isVenuesLoading ? (
                      <div>Loading...</div>
                    ) : filteredVenues.length > 0 ? (
                      <div className={styles.venueGrid}>
                        {filteredVenues.map((venue) => (
                          <VenueBooked
                            key={`${venue.id}-${venue.dateFrom.getTime()}`}
                            venue={venue}
                            onClick={() => handleVenueClick(venue)}
                          />
                        ))}
                      </div>
                    ) : (
                      <p>No venues booked yet.</p>
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
          selectedBooking={selectedBooking}
          isLoading={false}
          isModalVisible={isModalVisible}
          closeModal={closeModal}
          prevImage={prevImage}
          nextImage={nextImage}
          userRole="customer"
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

      {showSuccessPopup && (
        <CostumPopup
          message={successPopupMessage}
          title="Success"
          showButtons={false}
          disableAutoClose={true}
          hideBars={true}
        />
      )}
      
      {isCancelPopupVisible && (
        <CostumPopup
          message="Are you sure you want to cancel your stay?"
          title="Cancel Booking"
          onConfirm={() => {
            if (bookingToCancel) {
              handleDeleteBooking(bookingToCancel);
            }
            setIsCancelPopupVisible(false);
          }}
          onCancel={() => setIsCancelPopupVisible(false)}
          showButtons={true}
          disableAutoClose={false}
          hideBars={true}
        />
      )}
    </motion.div>
  );
};

export default CostumerProfile;