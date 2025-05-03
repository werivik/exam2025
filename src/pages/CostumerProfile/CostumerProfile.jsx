import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CostumerProfile.module.css';
import { motion } from "framer-motion";
import { PROFILES_SINGLE, VENUE_SINGLE } from '../../constants';
import { headers } from '../../headers';
import defaultAvatar from '/media/images/mdefault.jpg';
import Buttons from '../../components/Buttons/Buttons';
import { updateProfile } from '../../auth/auth';
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
  
  const bookingsRef = useRef(null);
  const favoritesRef = useRef(null);
  const editRef = useRef(null);
  
  const username = localStorage.getItem('username');

  const [isVenuesLoading, setIsVenuesLoading] = useState(true);   
  const [hasError, setHasError] = useState(false);
  const [filter, setFilter] = useState('All');

  const [selectedVenue, setSelectedVenue] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

const nextImage = () => {
  setCurrentImageIndex((prevIndex) => (prevIndex + 1) % selectedVenue.media.length);
};

const prevImage = () => {
  setCurrentImageIndex((prevIndex) => 
    prevIndex === 0 ? selectedVenue.media.length - 1 : prevIndex - 1
  );
};

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
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

      const venuesFromBookings = profile.bookings
      .map((booking) => {
        if (!booking.venue) return null;
        return {
          ...booking.venue,
          dateFrom: new Date(booking.dateFrom),
          dateTo: new Date(booking.dateTo),
          guests: booking.guests,
        };
      })
      .filter(Boolean);   

      const uniqueVenues = venuesFromBookings.filter((value, index, self) => {
        return index === self.findIndex((t) => (
          t.id === value.id && 
          t.dateFrom.getTime() === value.dateFrom.getTime() && 
          t.dateTo.getTime() === value.dateTo.getTime()
        ));
      });

      uniqueVenues.sort((a, b) => a.dateFrom - b.dateFrom);
      setBookedVenues(uniqueVenues);
      setIsVenuesLoading(false);
    };
    fetchUserData();
  }, [username]);
  

  const handleVenueClick = (venueId) => {
    const venue = bookedVenues.find((v) => v.id === venueId);
  
    if (venue) {
      setSelectedVenue(venue); 
      setSelectedBooking({
        guests: venue.guests,
        dateFrom: venue.dateFrom,
        dateTo: venue.dateTo,
        created: venue.created,
        updated: venue.updated,
      });
      setIsModalVisible(true);
    }
  };  
    
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

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const today = new Date();

  const filterVenues = (venues) => {
    switch (filter) {
      case 'Future':
        return venues.filter((venue) => venue.dateFrom >= today);
      case 'Previous':
        return venues.filter((venue) => venue.dateFrom < today);
      case 'All':
      default:
        return venues;
    }
  };

  const filteredVenues = filterVenues(bookedVenues);

  return (
    <motion.div
      className={styles.pageContent}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5, ease: "easeInOut" }} 
    >
    <div className={`${styles.blurWrapper} ${isModalVisible ? styles.blurred : ''}`}>
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
                <button className={styles.shortcutLink} onClick={() => scrollToSection(bookingsRef)}>
                  My Bookings
                </button>
                <button className={styles.shortcutLink} onClick={() => scrollToSection(favoritesRef)}>
                  Favorite Venues
                </button>
                <button className={styles.shortcutLink} onClick={() => scrollToSection(editRef)}>
                  Edit Profile
                </button>
              </div>
              <button className={styles.signOutButton} onClick={handleSignOut}>Sign out</button>
            </div>
          </section>
          <section className={styles.rightSection}>
            <div className={styles.rightBorder}>
            <div className={styles.bookings} ref={bookingsRef}>
                <div className={styles.bookingsTitle}>
                  <h2>My Bookings</h2>
                  <div className={styles.bookingsFilter}>
                    <Buttons size="medium" version="v3" onClick={() => setFilter('All')}>All</Buttons>
                    <Buttons size="medium" version="v1" onClick={() => setFilter('Future')}>Future</Buttons>
                    <Buttons size="medium" version="v2" onClick={() => setFilter('Previous')}>Previous</Buttons>
                  </div>
                </div>
                <div className={styles.allBookings}>
                {isVenuesLoading ? (
            <div>Loading...</div>
          ) : filteredVenues.length > 0 ? (
            <div className={styles.costumerBookings}>
{filteredVenues.map((venue) => (
  <VenueBooked
    key={`${venue.id}-${venue.dateFrom.getTime()}`}
    venue={venue}
    onClick={() => handleVenueClick(venue.id, venue.bookingId)}
  />
))}
            </div>
          ) : (
            <p>No Venues Booked yet.</p>
          )}
            </div>
              </div>
<div className={styles.favorites} ref={favoritesRef}>
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
              <div className={styles.edit} ref={editRef}>
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
      {isModalVisible && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className={styles.bookedVenueDetails}>
          <button className={styles.closeVenueButton} onClick={() => setIsModalVisible(false)}>
            X
          </button>

          <div className={styles.bookedVenueImageSlideshow}>
            {selectedVenue?.media && selectedVenue.media.length > 0 ? (
              <div className={styles.imageSlider}>
                <img
                  src={selectedVenue.media[0].url}
                  alt={selectedVenue.media[0].alt || "Venue Image"}
                  className={styles.slideshowImage}
                />
                <button className={styles.prevButton} onClick={prevImage}>
                  Previous
                </button>
                <button className={styles.nextButton} onClick={nextImage}>
                  Next
                </button>
              </div>
            ) : (
              <p>No images available for this venue.</p>
            )}
          </div>
          <div className={styles.bookedVenueRight}>
            <div className={styles.bookedVenueVenueInfo}>
              <h2>{selectedVenue.name}</h2>
              <p><strong>Description:</strong> {selectedVenue.description}</p>
              <p><strong>Location:</strong> {selectedVenue.location.city}, {selectedVenue.location.country} {selectedVenue.location.zip}</p>
              <p><strong>Price:</strong> ${selectedVenue.price}</p>
              <p><strong>Max Guests:</strong> {selectedVenue.maxGuests}</p>
              <p><strong>Rating:</strong> {selectedVenue.rating}</p>
              <p><strong>Amenities:</strong> {selectedVenue.meta.wifi ? 'WiFi, ' : ''}{selectedVenue.meta.parking ? 'Parking, ' : ''}{selectedVenue.meta.breakfast ? 'Breakfast, ' : ''}{selectedVenue.meta.pets ? 'Pets Allowed' : ''}</p>
              <p><a href={`/venue-details/${selectedVenue?.id}`} target="_blank" rel="noopener noreferrer">View Venue</a></p>
            </div>
            <div className={styles.bookedVenueBookingInfo}>
              <h3>Booking Information</h3>
              <p><strong>Guests:</strong> {selectedBooking.guests}</p>
              <p><strong>Booking From:</strong> {new Date(selectedBooking.dateFrom).toLocaleDateString()}</p>
              <p><strong>Booking To:</strong> {new Date(selectedBooking.dateTo).toLocaleDateString()}</p>
              <p><strong>Created:</strong> {new Date(selectedBooking.created).toLocaleDateString()}</p>
              <p><strong>Updated:</strong> {new Date(selectedBooking.updated).toLocaleDateString()}</p>
            </div>
            <div className={styles.bookedVenueEditButtons}>
              <button>Edit</button>
              <button>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
)}
    </motion.div>
  );
};

export default CostumerProfile;
