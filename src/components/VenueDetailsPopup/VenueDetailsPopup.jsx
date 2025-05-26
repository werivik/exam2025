import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import styles from './VenueDetailsPopup.module.css';
import Buttons from '../../components/Buttons/Buttons';
import CustomPopup from '../CostumPopup/CostumPopup';
import { headers } from '../../headers';
import { handleBookingDelete, handleBookingUpdate } from '../../auth/booking';
import { VENUE_DELETE } from '../../constants';
import slideshowPrev from "/public/media/icons/slideshow-next-button.png";
import slideshowNext from "/public/media/icons/slideshow-next-button.png";
import CustomCalender from '../../components/CostumCalender/CostumCalender';
import star from "../../../public/media/rating/christmas-stars.png";

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
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [disabled, setDisabled] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarInitiatedFrom, setCalendarInitiatedFrom] = useState(null);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [totalNights, setTotalNights] = useState(0);
  const [totalGuests, setTotalGuests] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [existingBookings, setExistingBookings] = useState([]);
  const dropdownRef = useRef(null);
  const [isPastBooking, setIsPastBooking] = useState(false);
  const [isCurrentlyStaying, setIsCurrentlyStaying] = useState(false);

  const formatDateWithOrdinal = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();

    const getOrdinalSuffix = (day) => {
      if (day > 3 && day < 21) return 'th';
      switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  };

  const formatGuestDisplay = (adults, children, disabled) => {
    const parts = [];
    if (adults > 0) {
      parts.push(`${adults} Adult${adults !== 1 ? 's' : ''}`);
    }
    if (children > 0) {
      parts.push(`${children} Child${children !== 1 ? 'ren' : ''}`);
    }    
    if (disabled > 0) {
      parts.push(`${disabled} Assisted Guest${disabled !== 1 ? 's' : ''}`);
    }   
    if (parts.length === 0) {
      return '0 Guests';
    }
    if (parts.length === 1) {
      return parts[0];
    }
    if (parts.length === 2) {
      return `${parts[0]}, ${parts[1]}`;
    }   
    return `${parts[0]}, ${parts[1]}, ${parts[2]}`;
  };

  useEffect(() => {
    setEditedVenue(selectedVenue);
  }, [selectedVenue]);

  useEffect(() => {
  const newTotalGuests = adults + children + disabled;
  setTotalGuests(newTotalGuests);
  console.log('Total guests updated:', newTotalGuests);
  }, [adults, children, disabled]);

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      const diffTime = checkOut - checkIn;
      const nights = Math.max(diffTime / (1000 * 60 * 60 * 24), 0);
      setTotalNights(nights);

      if (selectedVenue?.price) {
        const total = nights * selectedVenue.price;
        setTotalPrice(total);
      }
    } 
    else {
      setTotalNights(0);
      setTotalPrice(0);
    }
  }, [checkInDate, checkOutDate, selectedVenue?.price]);

  const toggleCalendar = useCallback((type) => {
    if (showCalendar && calendarInitiatedFrom === type) {
      setShowCalendar(false);
      setCalendarInitiatedFrom(null);
    } 
    else {
      setShowCalendar(true);
      setCalendarInitiatedFrom(type);
    }
  }, [showCalendar, calendarInitiatedFrom]);

  const handleDateChange = useCallback((date) => {
    if (calendarInitiatedFrom === 'start' || (!checkInDate && calendarInitiatedFrom === 'start')) {
      setCheckInDate(date);
      if (checkOutDate && new Date(date) >= new Date(checkOutDate)) {
        setCheckOutDate('');
      }
      if (!checkOutDate) {
        setCalendarInitiatedFrom('end');
      }
    } 
    else if (calendarInitiatedFrom === 'end') {
      setCheckOutDate(date);
      setShowCalendar(false);
      setCalendarInitiatedFrom(null);
    }
  }, [calendarInitiatedFrom, checkInDate, checkOutDate]);

  const handleCalendarComplete = useCallback(() => {
    setShowCalendar(false);
    setCalendarInitiatedFrom(null);
  }, []);

  const handleEditClick = () => {
    if (userRole === 'admin') {
      navigate(`/edit-venue/${selectedVenue.id}`, { state: { venue: selectedVenue } });
      closeModal();
    } 
    else if (userRole === 'customer') {
      setIsEditing(true);
    }
  };

  const handleBookAgain = () => {
    navigate(`/venue-details/${selectedVenue?.id}`);
    closeModal();
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
    
    const checkInISO = new Date(selectedBooking.dateFrom).toISOString().split('T')[0];
    const checkOutISO = new Date(selectedBooking.dateTo).toISOString().split('T')[0];
    
    setCheckInDate(checkInISO);
    setCheckOutDate(checkOutISO);
    
    const totalBookingGuests = selectedBooking.guests || 1;
    setAdults(totalBookingGuests);
    setChildren(0);
    setDisabled(0);
    
    console.log('Initialized booking data:', {
      checkIn: checkInISO,
      checkOut: checkOutISO,
      guests: totalBookingGuests
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookingStart = new Date(selectedBooking.dateFrom);
    bookingStart.setHours(0, 0, 0, 0);

    const bookingEnd = new Date(selectedBooking.dateTo);
    bookingEnd.setHours(0, 0, 0, 0);

    const bothDatesInPast = today > bookingEnd;
    
    const currentlyStaying = today >= bookingStart && today < bookingEnd;
    
    setIsPastBooking(bothDatesInPast);
    setIsCurrentlyStaying(currentlyStaying);

    console.log("Booking status check:", {
      bookingStart: bookingStart.toISOString().split('T')[0],
      bookingEnd: bookingEnd.toISOString().split('T')[0],
      today: today.toISOString().split('T')[0],
      bothDatesInPast,
      currentlyStaying,
    });
  }
}, [selectedBooking]);

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
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              const bookingStart = new Date(data.data.dateFrom);
              bookingStart.setHours(0, 0, 0, 0);
              
              const bookingEnd = new Date(data.data.dateTo);
              bookingEnd.setHours(0, 0, 0, 0);
              
              const bothDatesInPast = today > bookingEnd;
              const currentlyStaying = today >= bookingStart && today < bookingEnd;
              
              setIsPastBooking(bothDatesInPast);
              setIsCurrentlyStaying(currentlyStaying);
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
  if (!checkInDate || !checkOutDate) {
    setPopupMessage('Please select both check-in and check-out dates');
    setShowBookingPopup(true);
    return;
  }
  if (totalGuests < 1) {
    setPopupMessage('Please select at least 1 guest');
    setShowBookingPopup(true);
    return;
  }
  const checkInDateObj = new Date(checkInDate);
  const checkOutDateObj = new Date(checkOutDate);
  if (checkOutDateObj <= checkInDateObj) {
    setPopupMessage('Check-out date must be after check-in date');
    setShowBookingPopup(true);
    return;
  }
  const editValues = {
    dateFrom: checkInDate,
    dateTo: checkOutDate,
    guests: totalGuests,
  };
  console.log('Sending booking update with:', editValues);
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
              <div className={styles.fadeOutTop}></div>
              {!isEditing ? (
                <>
                  <div className={styles.venueInfo}>
                    <h1>{selectedVenue.name}</h1>
                    <p className={styles.venueLocation}>{selectedVenue.location.city}, {selectedVenue.location.country}, {selectedVenue.location.address} {selectedVenue.location.zip}</p>
                    <p className={styles.venueRating}><img src={star} alt="Rating" /> {selectedVenue.rating}</p>
                    <div className={styles.divideLine}></div>
                    <h3>Description</h3>
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
<div className={styles.divideLine}></div>
                    <p><strong>Price:</strong> $ {selectedVenue.price} <span>/ per night</span></p>
                    <div className={styles.divideLine}></div>
                    <p><strong>Max Guests:</strong> {selectedVenue.maxGuests}</p>
                    <div className={styles.divideLine}></div>
                    <p><strong>Amenities:</strong> {selectedVenue.meta.wifi ? 'WiFi, ' : ''}{selectedVenue.meta.parking ? 'Parking, ' : ''}{selectedVenue.meta.breakfast ? 'Breakfast, ' : ''}{selectedVenue.meta.pets ? 'Pets Allowed' : ''}</p>
                    <div className={styles.divideLine}></div>
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
                    <div className={styles.editBookingForm}>
                      <h3>Edit Booking</h3>
                      <div className={styles.bookDateContent}>
                        <div className={styles.bookDate}>
                          <div className={styles.bookDateStart}>
                            <i 
                              className="fa-solid fa-calendar-days" 
                              onClick={() => toggleCalendar('start')}
                            ></i>
                            <input
                              type="text"
                              value={formatDateWithOrdinal(checkInDate)}
                              placeholder="Check-in Date"
                              onClick={() => toggleCalendar('start')}
                              readOnly
                            />
                          </div>
                          <div className={styles.bookDateEnd}>
                            <i 
                              className="fa-solid fa-calendar-days" 
                              onClick={() => toggleCalendar('end')}
                            ></i>
                            <input
                              type="text"
                              value={formatDateWithOrdinal(checkOutDate)}
                              placeholder="Check-out Date"
                              onClick={() => toggleCalendar('end')}
                              readOnly
                            />
                          </div>
                        </div>
                        
                        {showCalendar && (
                          <CustomCalender
                            value={calendarInitiatedFrom === 'start' ? checkInDate : checkOutDate}
                            onDateChange={handleDateChange}
                            bookedDates={existingBookings}
                            startDate={checkInDate}
                            endDate={checkOutDate}
                            isSelectingEnd={calendarInitiatedFrom === 'end'}
                            onSelectionComplete={handleCalendarComplete}
                          />
                        )}
                      </div>
                      <div className={styles.bookGuests}>
                        <div className={styles.filterPeople}>
                          <i className="fa-solid fa-person"></i>
                          <div
                            className={styles.guestSelector}
                            onClick={() => setShowGuestDropdown(prev => !prev)}
                            ref={dropdownRef}
                          >
                            <p>{formatGuestDisplay(adults, children, disabled)}</p>
                            <div
                              className={`${styles.dropdownMenu} ${showGuestDropdown ? styles.open : ''}`}
                            >
                              {[
                                { type: "adults", label: "Adults", value: adults, setter: setAdults, min: 1 },
                                { type: "children", label: "Children", value: children, setter: setChildren, min: 0 },
                                { type: "disabled", label: `Assisted Guest${disabled !== 1 ? "s" : ""}`, value: disabled, setter: setDisabled, min: 0 }
                              ].map(({ type, label, value, setter, min }) => (
                                <div key={type} className={styles.dropdownRow}>
                                  <span className={styles.label}>{label}</span>
                                  <div className={styles.counterControls}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setter(Math.max(min, value - 1));
                                      }}
                                    >
                                      -
                                    </button>
                                    <span>{value}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setter(value + 1);
                                      }}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={styles.dividerLine}></div>
                      <p className={styles.maxGuests}>
                        <strong>{totalNights} </strong><span> Total Nights</span>
                      </p>
                      <div className={styles.dividerLine}></div>
                      <p className={styles.maxGuests}>
                        <strong>{totalGuests} </strong><span> Total Guests</span>
                      </p>
                      <div className={styles.dividerLine}></div>
                      <div className={styles.maxGuestsPrice}>
                        <div className={styles.bookPrice}>
                          <p>
                            <span className={styles.totalPriceSpan}>Price:</span>
                            <strong> ${totalPrice.toFixed(2)}</strong> 
                            <span> / ${selectedVenue.price} per night</span>
                          </p>
                        </div>  
                      </div>
                      <div className={styles.bookedVenueEditButtons}>
                        <div className={styles.bookedVenueEditButtons}>
                          <Buttons size="small" version="v2" onClick={() => setIsEditing(false)}>Cancel Edit</Buttons>
                          <Buttons size="small" version="v1" onClick={handleSave}>Save Changes</Buttons>
                        </div>
                      </div>
                    </div>
                  ) : bookingData ? (
                    <div className={styles.bookingInfo}>
                      <h3>Booking Information</h3>
                      <p><strong>Guests:</strong> {bookingData.guests}</p>
                      <p><strong>From:</strong> {new Date(bookingData.dateFrom).toLocaleDateString()}</p>
                      <p><strong>To:</strong> {new Date(bookingData.dateTo).toLocaleDateString()}</p>
                      <p><strong>Total Price:</strong> ${totalPrice.toFixed(2)}</p>
                      {bookingData.created && (
                        <p><strong>Created:</strong> {new Date(bookingData.created).toLocaleDateString()}</p>
                      )}
                      {bookingData.updated && (
                        <p><strong>Updated:</strong> {new Date(bookingData.updated).toLocaleDateString()}</p>
                      )}
                      {isCurrentlyStaying && (
                        <div className={styles.currentlyStayingBadge}>
                          <i className="fa-solid fa-location-dot"></i>
                          <span>Currently Staying</span>
                        </div>
                      )}
{!isPastBooking && !isCurrentlyStaying && (
  <div className={styles.bookedVenueEditButtons}>
    <Buttons size="small" version="v2" onClick={openCancelConfirmation}>Cancel Booking</Buttons>
    <Buttons size="small" version="v1" onClick={() => setIsEditing(true)}>Edit Booking</Buttons>
  </div>
)}
{isCurrentlyStaying && (
  <div className={styles.bookedVenueEditButtons}>
    <Buttons size="small" version="v2" onClick={openCancelConfirmation}>Cancel Booking</Buttons>
  </div>
)}
{isPastBooking && (
  <div className={styles.bookedVenueEditButtons}>
    <Buttons size="small" version="v1" onClick={handleBookAgain}>Book Again</Buttons>
  </div>
)}
                    </div>
                  ) : (
                    <p>Booking details not available.</p>
                  )}
                </div>
              )}    
              <div className={styles.fadeOutBottom}></div>          
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