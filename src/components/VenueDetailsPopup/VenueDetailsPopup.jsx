import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import styles from './VenueDetailsPopup.module.css';
import Buttons from '../../components/Buttons/Buttons';
import { headers } from '../../headers';
import { VENUE_DELETE } from '../../constants';

const VenueDetailsPopup = ({ selectedVenue, isModalVisible, closeModal, prevImage, nextImage, userRole, isLoading = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedVenue, setEditedVenue] = useState(selectedVenue);

  useEffect(() => {
    setEditedVenue(selectedVenue);
  }, [selectedVenue]);

  const handleDelete = async () => {
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
        alert('Venue deleted successfully!');
        closeModal();
      } 
      else {
        console.error('Failed to delete venue');
      }
    } 
    catch (error) {
      console.error('Error deleting venue:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedVenue((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setIsEditing(false);
    closeModal();
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
                <p><strong>Price:</strong> ${selectedVenue.price} <span>/ per night</span></p>
                <p><strong>Max Guests:</strong> {selectedVenue.maxGuests}</p>
                <p><strong>Rating:</strong> {selectedVenue.rating} Stars</p>
                <p><strong>Amenities:</strong> {selectedVenue.meta.wifi ? 'WiFi, ' : ''}{selectedVenue.meta.parking ? 'Parking, ' : ''}{selectedVenue.meta.breakfast ? 'Breakfast, ' : ''}{selectedVenue.meta.pets ? 'Pets Allowed' : ''}</p>
                <p><a href={`/venue-details/${selectedVenue?.id}`} target="_blank" rel="noopener noreferrer">View Venue</a></p>
              </div>

              {userRole === "admin" && (
                <div className={styles.bookedVenueEditButtons}>
                  <Buttons size="small" onClick={handleEdit}>Edit</Buttons>
                  <Buttons size="small" version="v2" onClick={handleDelete}>Delete</Buttons>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default VenueDetailsPopup;