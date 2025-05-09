import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import styles from './VenueDetailsPopup.module.css';
import Buttons from '../../components/Buttons/Buttons';
import CustomPopup from '../CostumPopup/CostumPopup';
import { headers } from '../../headers';
import { VENUE_DELETE } from '../../constants';
import slideshowPrev from "/media/icons/slideshow-next-button.png";
import slideshowNext from "/media/icons/slideshow-next-button.png";

const VenueDetailsPopup = ({ selectedVenue, isModalVisible, closeModal, prevImage, nextImage, userRole, isLoading = false }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedVenue, setEditedVenue] = useState(selectedVenue);
  const [isConfirmDeleteVisible, setIsConfirmDeleteVisible] = useState(false);

  useEffect(() => {
    setEditedVenue(selectedVenue);
  }, [selectedVenue]);

  const handleEditClick = () => {
    navigate(`/edit-venue/${selectedVenue.id}`, { state: { venue: selectedVenue } });
    closeModal();
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
                <p><strong>Location:</strong> {selectedVenue.location.city}, {selectedVenue.location.country}, {selectedVenue.location.address} {selectedVenue.location.zip}</p>
                <p><strong>Price:</strong> ${selectedVenue.price} <span>/ per night</span></p>
                <p><strong>Max Guests:</strong> {selectedVenue.maxGuests}</p>
                <p><strong>Amenities:</strong> {selectedVenue.meta.wifi ? 'WiFi, ' : ''}{selectedVenue.meta.parking ? 'Parking, ' : ''}{selectedVenue.meta.breakfast ? 'Breakfast, ' : ''}{selectedVenue.meta.pets ? 'Pets Allowed' : ''}</p>
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