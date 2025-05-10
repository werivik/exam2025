import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import styles from './VenueDetailsPopup.module.css';
import Buttons from '../../components/Buttons/Buttons';
import CustomPopup from '../CostumPopup/CostumPopup';
import { headers } from '../../headers';
import { VENUE_DELETE } from '../../constants';
import { handleDeleteBooking, handleBookingUpdate } from '../../auth/booking';
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
  handleSaveBookingChanges,
  handleCancelBooking,
}) => {
  const navigate = useNavigate();
  const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [editedVenue, setEditedVenue] = useState(selectedVenue);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    dateFrom: '',
    dateTo: '',
    guests: 1,
  });

  useEffect(() => {
    setEditedVenue(selectedVenue);
  }, [selectedVenue]);

  const handleEditClick = () => {
    navigate(`/edit-venue/${selectedVenue.id}`, { state: { venue: selectedVenue } });
    closeModal();
  };

  /*
  const handleSave = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token || !editedVenue?.id) {
      console.error('Missing token or venue ID');
      return;
    }

    try {
      const response = await fetch(`/holidaze/venues/${editedVenue.id}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify({
          name: editedVenue.name,
          description: editedVenue.description,
          media: editedVenue.media,
          price: editedVenue.price,
          maxGuests: editedVenue.maxGuests,
          rating: editedVenue.rating,
          meta: editedVenue.meta,
          location: editedVenue.location,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Venue updated successfully!');
        setIsEditing(false);
      } 
      else {
        console.error('Failed to update venue');
      }
    } 
    catch (error) {
      console.error('Error updating venue:', error);
    }
  };
  */

  /*
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedVenue((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
*/

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
    if (selectedBooking && userRole === 'customer') {
      setEditValues({
        dateFrom: new Date(selectedBooking.dateFrom).toISOString().split('T')[0],
        dateTo: new Date(selectedBooking.dateTo).toISOString().split('T')[0],
        guests: selectedBooking.guests,
      });
    }
  }, [selectedBooking, userRole]);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token || !selectedBooking?.id) {
      console.error('Missing token or booking ID');
      return;
    }
    await handleBookingUpdate(selectedBooking.id, editValues);
    setIsEditing(false);
  };

const calculateTotalPrice = () => {
  const { dateFrom, dateTo } = editValues;
  const venuePricePerNight = selectedVenue.price;

  const dateFromObj = new Date(dateFrom);
  const dateToObj = new Date(dateTo);

  const timeDifference = dateToObj - dateFromObj;
  const numberOfNights = timeDifference / (1000 * 3600 * 24);

  return numberOfNights > 0 ? numberOfNights * venuePricePerNight : 0;
};

const handleCancel = async () => {
  if (!selectedVenue || !selectedVenue.id) {
    console.error('Missing selectedBooking or booking ID');
    alert('Booking data is missing or incorrect. Please try again later.');
    return;
  }

  try {
    await handleDeleteBooking(
      selectedVenue.id,
      () => {},
      {
        success: (msg) => alert(msg || "Booking cancelled successfully!"),
        error: (msg) => alert(msg || "Booking cancellation failed. Please try again."),
      }
    );
    closeModal();
  } 
  catch (error) {
    console.error('Error canceling booking:', error);
    alert('Something went wrong while canceling the booking.');
  }
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
          <div className={styles.bookedVenueDetails}>
            <button className={styles.closeVenueButton} onClick={closeModal}>
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className={styles.bookedVenueImageSlideshow}>
            {selectedVenue?.media && selectedVenue.media.length > 0 ? (
    <div className={styles.imageSlider}>
      <img
        src={selectedVenue.media[currentIndex].url}
        alt={selectedVenue.media[currentIndex].alt || "Venue Image"}
        className={styles.slideshowImage}
      />
      {selectedVenue.media.length > 1 && (
        <>
          <button 
            className={styles.prevButton} 
            onClick={() => handlePrevImage(selectedVenue.media.length)}
          >
            <img src={slideshowPrev} alt="Previous" />
          </button>
          <button 
            className={styles.nextButton} 
            onClick={() => handleNextImage(selectedVenue.media.length)}
          >
            <img src={slideshowNext} alt="Next" />
          </button>
        </>
      )}
    </div>
  ) : (
    <p>No images available for this venue.</p>
  )}
            </div>
            <div className={styles.bookedVenueRight}>
            <div className={styles.fadeOutDivTop}>
            </div>
              <div className={styles.bookedVenueVenueInfo}>
                <h2>{selectedVenue.name}</h2>
                <p>{selectedVenue.rating} Stars</p>
                <p>{selectedVenue.description}</p>
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
                  <Buttons size="small" onClick={handleEditClick}>Edit</Buttons>
                  <Buttons size="small" version="v2" onClick={handleDelete}>Delete</Buttons>
                </div>
              )}
              {userRole === 'customer' && selectedVenue?.id && (
                <div className={styles.bookingSection}>
                  {isEditing ? (
                    <form className={styles.editForm} onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                      <label>
                        Guests:
                        <input
                          type="number"
                          name="guests"
                          value={editValues.guests}
                          onChange={handleInputChange}
                          required
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
                  ) : (
                    <div className={styles.bookingInfo}>
                      <h3>Booking Information</h3>
                      <p><strong>Guests:</strong> {selectedBooking.guests}</p>
                      <p><strong>From:</strong> {new Date(selectedBooking.dateFrom).toLocaleDateString()}</p>
                      <p><strong>To:</strong> {new Date(selectedBooking.dateTo).toLocaleDateString()}</p>
                      <p><strong>Total Price:</strong> {calculateTotalPrice()}</p>
                      <p><strong>Created:</strong> {new Date(selectedBooking.created).toLocaleDateString()}</p>
                      <p><strong>Updated:</strong> {new Date(selectedBooking.updated).toLocaleDateString()}</p>
                      <div className={styles.bookedVenueEditButtons}>
                        <Buttons size="small" version="v1" onClick={() => setIsEditing(true)}>Edit Booking</Buttons>
                        <Buttons 
  size="small" 
  version="v2" 
  onClick={handleCancel}
  disabled={!selectedBooking?.id}
>
  Cancel Booking
</Buttons>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className={styles.fadeOutDivBottom}>
              </div>
            </div>
          </div>
        )}

{isConfirmDeleteVisible && (
  <CustomPopup
    message="Are you sure you want to delete this venue?"
    onClose={closeDeleteConfirmation}
    onConfirm={handleDeleteConfirm}
    onCancel={closeDeleteConfirmation}
    disableAutoClose={true}
  />
)}
      </motion.div>
    </motion.div>
  );
};

export default VenueDetailsPopup;