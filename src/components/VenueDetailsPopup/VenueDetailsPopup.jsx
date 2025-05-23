import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import styles from './VenueDetailsPopup.module.css';
import Buttons from '../../components/Buttons/Buttons';
import CustomPopup from '../CostumPopup/CostumPopup';
import { headers } from '../../headers';
import { handleBookingDelete, handleBookingUpdate } from '../../auth/booking';
import { VENUE_DELETE } from '../../constants';
import slideshowPrev from "/media/icons/slideshow-next-button.png";
import slideshowNext from "/media/icons/slideshow-next-button.png";

const VenueDetailsPopup = ({ 
  selectedVenue, 
  isModalVisible, 
  closeModal, 
  prevImage, 
  nextImage, 
  userRole, 
  isLoading,
  selectedBooking,
}) => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isConfirmCancelVisible, setIsConfirmCancelVisible] = useState(false);
  const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState(false);
  const [editedVenue, setEditedVenue] = useState(selectedVenue);
  const [isEditing, setIsEditing] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [editValues, setEditValues] = useState({
    dateFrom: '',
    dateTo: '',
    guests: 1,
  });

  useEffect(() => {
    setEditedVenue(selectedVenue);
  }, [selectedVenue]);

  const handleEditClick = () => {
    if (userRole === 'admin') {
      navigate(`/edit-venue/${selectedVenue.id}`, { state: { venue: selectedVenue } });
      closeModal();
    } 
    else if (userRole === 'customer') {
      setIsEditing(true);
    }
  };

  const handleClose = () => {
    setIsEditing(false);
    closeModal();
  };

  const openDeleteConfirmation = () => {
    setIsConfirmDeleteVisible(true);
  };
  
  const closeDeleteConfirmation = () => {
    setIsConfirmDeleteVisible(false);
  };

  const handleDeleteConfirm = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token || !selectedVenue?.id) {
      console.error('Missing token or venue ID');
      return;
    }  

    try {
      const url = VENUE_DELETE.replace('<id>', selectedVenue.id);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: headers(token),
      });
  
      if (response.ok) {
        closeModal();
        window.location.reload();
      } 
      else {
        console.error('Failed to delete venue');
      }
    } 
    catch (error) {
      console.error('Error deleting venue:', error);
    }
  
    setIsConfirmDeleteVisible(false);
  };
  
  const handleDelete = () => {
    openDeleteConfirmation();
  };

  const handlePrevImage = (mediaLength) => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + mediaLength) % mediaLength);
  };

  const handleNextImage = (mediaLength) => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mediaLength);
  };

  useEffect(() => {
    if (selectedBooking) {
      setBookingData(selectedBooking);
      setEditValues({
        dateFrom: new Date(selectedBooking.dateFrom).toISOString().split('T')[0],
        dateTo: new Date(selectedBooking.dateTo).toISOString().split('T')[0],
        guests: selectedBooking.guests,
      });
    }
  }, [selectedBooking]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotalPrice = () => {
    const { dateFrom, dateTo } = editValues;
    const venuePricePerNight = selectedVenue?.price || 0;

    const dateFromObj = new Date(dateFrom);
    const dateToObj = new Date(dateTo);

    const timeDifference = dateToObj - dateFromObj;
    const numberOfNights = timeDifference / (1000 * 3600 * 24);

    return numberOfNights > 0 ? numberOfNights * venuePricePerNight : 0;
  };
  
  useEffect(() => {
    if (selectedBooking && userRole === 'customer') {
      setEditValues({
        dateFrom: new Date(selectedBooking.dateFrom).toISOString().split('T')[0],
        dateTo: new Date(selectedBooking.dateTo).toISOString().split('T')[0],
        guests: selectedBooking.guests,
      });
    }
  }, [selectedBooking, userRole]);

  useEffect(() => {
    if (!selectedBooking && selectedVenue?.bookingId) {
      const fetchBookingData = async () => {
        const token = localStorage.getItem('accessToken');
        if (token && selectedVenue.bookingId) {
          try {
            const response = await fetch(`/holidaze/bookings/${selectedVenue.bookingId}`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              console.log("Fetched booking data:", data);
              if (data?.data?.id) {
                setBookingData(data.data);
              } 
              else {
                console.error('Booking data is missing the ID');
              }
            } 
            else {
              console.error('Failed to fetch booking data');
            }
          } 
          catch (error) {
            console.error('Error fetching booking data:', error);
          }
        }
      };

      fetchBookingData();
    } 
    else {
      setBookingData(selectedBooking);
    }
  }, [selectedBooking, selectedVenue]);

  const handleSave = async () => {
    if (!bookingData?.id) {
      console.error('No booking ID found');
      return;
    }

    const updatedBooking = await handleBookingUpdate(
      bookingData.id, 
      editValues, 
      setPopupMessage, 
      setShowBookingPopup
    );

    if (updatedBooking) {
      setBookingData(updatedBooking.data);
      setIsEditing(false);
    }
  };

  const openCancelConfirmation = () => {
    setIsConfirmCancelVisible(true);
  };

  const closeCancelConfirmation = () => {
    setIsConfirmCancelVisible(false);
  };

  const handleCancelBookingConfirm = async () => {
    if (!bookingData?.id) {
      console.error('No booking ID found');
      return;
    }

    const success = await handleBookingDelete(
      bookingData.id, 
      setPopupMessage, 
      setShowBookingPopup
    );

    if (success) {
      closeCancelConfirmation();
      window.location.reload();
    }
  };

if (!selectedVenue) return null;

const [showFullDescription, setShowFullDescription] = useState(false);

const toggleDescription = () => {
  setShowFullDescription((prev) => !prev);
};

const getDescriptionPreview = (desc) => {
  if (!desc) return '';
  const words = desc.trim().split(/\s+/);
  if (words.length <= 50 || showFullDescription) return desc;

  return words.slice(0, 50).join(' ') + '...';
};

  return (
    <motion.div
      className={styles.modalOverlay}
      onClick={(e) => e.target.classList.contains(styles.modalOverlay) && closeModal()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <motion.div
        className={styles.modalContent}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
      >
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <div className={styles.venueDetails}>
            <Buttons 
            onClick={closeModal}
            className={styles.closeVenueButton}
            size='close'
            >
              <i className="fa-solid fa-xmark"></i>
            </Buttons>

            <div className={styles.venueImageSlideshow}>
              {selectedVenue?.media && selectedVenue.media.length > 0 ? (
                
                <div className={styles.imageSlider}>
<div className={styles.slideshowProgress}>
                    <p>{currentIndex + 1} of {selectedVenue.media.length}</p>
                  </div>
                  <img
                    src={selectedVenue.media[currentIndex].url}
                    alt={selectedVenue.media[currentIndex].alt || "Venue Image"}
                    className={styles.slideshowImage}
                  />
                  {selectedVenue.media.length > 1 && (
                    <>
                      <button 
                        className={styles.nextButton} 
                        onClick={() => handleNextImage(selectedVenue.media.length)}
                      >
                        <img src={slideshowNext} alt="Next"></img>
                      </button>
                      <button 
                        className={styles.prevButton} 
                        onClick={() => handlePrevImage(selectedVenue.media.length)}
                      >
                        <img src={slideshowPrev} alt="Previous"></img>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <p>No images available for this venue.</p>
              )}
            </div>
            <div className={styles.venueRight}>
              {!isEditing ? (
                <>
                  <div className={styles.venueInfo}>
                    <h2>{selectedVenue.name}</h2>
                    <p>{selectedVenue.rating} Stars</p>
                    <p>
  {getDescriptionPreview(selectedVenue.description)}{' '}
  {selectedVenue.description && selectedVenue.description.split(/\s+/).length > 50 && (
    <span
      onClick={toggleDescription}
      style={{ color: '#5D6B2F', cursor: 'pointer', textDecoration: 'underline', fontWeight: 500 }}
    >
      {showFullDescription ? 'Show less' : 'See more'}
    </span>
  )}
</p>
                    <p><strong>Price:</strong> ${selectedVenue.price} <span>/ per night</span></p>
                    <p><strong>Max Guests:</strong> {selectedVenue.maxGuests}</p>
                    <p><strong>Amenities:</strong> {selectedVenue.meta.wifi ? 'WiFi, ' : ''}{selectedVenue.meta.parking ? 'Parking, ' : ''}{selectedVenue.meta.breakfast ? 'Breakfast, ' : ''}{selectedVenue.meta.pets ? 'Pets Allowed' : ''}</p>
                    <p><strong>Location:</strong> {selectedVenue.location.city}, {selectedVenue.location.country}, {selectedVenue.location.address} {selectedVenue.location.zip}</p>
                    <Link to={`/venue-details/${selectedVenue?.id}`} target="_blank" rel="noopener noreferrer">
                      View Venue
                    </Link>
                  </div>

                  {userRole === "admin" && (
                    <div className={styles.bookedVenueEditButtons}>
                      <Buttons size="small" onClick={handleEditClick}>Edit Venue</Buttons>
                      <Buttons size="small" version="v2" onClick={handleDelete}>Delete Venue</Buttons>
                    </div>
                  )}
                </>
              ) : null}
              {userRole === 'customer' && selectedVenue?.id && (
                <div className={styles.bookingSection}>
                  {isEditing ? (
                    <form className={styles.editForm} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                      <h3>Edit Booking</h3>
                      <label>
                        Guests:
                        <input
                          type="number"
                          name="guests"
                          value={editValues.guests}
                          onChange={handleInputChange}
                          required
                          min="1"
                          max={selectedVenue.maxGuests}
                        />
                      </label>
                      <label>
                        From:
                        <input
                          type="date"
                          name="dateFrom"
                          value={editValues.dateFrom}
                          onChange={handleInputChange}
                          required
                        />
                      </label>
                      <label>
                        To:
                        <input
                          type="date"
                          name="dateTo"
                          value={editValues.dateTo}
                          onChange={handleInputChange}
                          required
                        />
                      </label>

                      <div className={styles.totalPrice}>
                        <p><strong>Total Price:</strong> ${calculateTotalPrice()}</p>
                      </div>

                      <div className={styles.bookedVenueEditButtons}>
                        <Buttons type="submit" size="small" version="v1">Save</Buttons>
                        <Buttons type="button" size="small" version="v2" onClick={() => setIsEditing(false)}>Cancel</Buttons>
                      </div>
                    </form>
                  ) : bookingData ? (
                    <div className={styles.bookingInfo}>
                      <h3>Booking Information</h3>
                      <p><strong>Guests:</strong> {bookingData.guests}</p>
                      <p><strong>From:</strong> {new Date(bookingData.dateFrom).toLocaleDateString()}</p>
                      <p><strong>To:</strong> {new Date(bookingData.dateTo).toLocaleDateString()}</p>
                      <p><strong>Total Price:</strong> ${calculateTotalPrice()}</p>
                      {bookingData.created && (
                        <p><strong>Created:</strong> {new Date(bookingData.created).toLocaleDateString()}</p>
                      )}
                      {bookingData.updated && (
                        <p><strong>Updated:</strong> {new Date(bookingData.updated).toLocaleDateString()}</p>
                      )}
                      <div className={styles.bookedVenueEditButtons}>
                        <Buttons size="small" version="v1" onClick={() => setIsEditing(true)}>Edit Booking</Buttons>
                        <Buttons size="small" version="v2" onClick={openCancelConfirmation}>Cancel Booking</Buttons>
                      </div>
                    </div>
                  ) : (
                    <p>Booking details not available.</p>
                  )}
                </div>
              )}              
            </div>
          </div>
        )}

        {isConfirmCancelVisible && (
          <CustomPopup
            message="Are you sure you want to cancel this booking?"
            onClose={closeCancelConfirmation}
            onConfirm={handleCancelBookingConfirm}
            onCancel={closeCancelConfirmation}
            disableAutoClose={true}
            hideBars={true}
          />
        )}

        {isConfirmDeleteVisible && (
          <CustomPopup
            message="Are you sure you want to delete this venue?"
            onClose={closeDeleteConfirmation}
            onConfirm={handleDeleteConfirm}
            onCancel={closeDeleteConfirmation}
            disableAutoClose={true}
            hideBars={true}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default VenueDetailsPopup;