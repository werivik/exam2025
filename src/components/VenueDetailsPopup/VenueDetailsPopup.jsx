import { motion } from "framer-motion";
import styles from './VenueDetailsPopup.module.css';
import Buttons from '../../components/Buttons/Buttons';

const VenueDetailsPopup = ({
  selectedVenue,
  selectedBooking,
  isLoading,
  isModalVisible,
  closeModal,
  prevImage,
  nextImage,
}) => {

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
                <p><strong>Price:</strong> ${selectedVenue.price} <span>/ per night</span></p>
                <p><strong>Max Guests:</strong> {selectedVenue.maxGuests}</p>
                <p><strong>Rating:</strong> {selectedVenue.rating} Stars</p>
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
                <Buttons size="small">Edit</Buttons>
                <Buttons size="small" version="v2">Cancel</Buttons>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default VenueDetailsPopup;