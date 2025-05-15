import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './VenueDetails.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import Buttons from '../../components/Buttons/Buttons';
import { isLoggedIn } from '../../auth/auth';
import { handleBookingSubmit } from '../../auth/booking';

import slideshowNext from "/media/icons/slideshow-next-button.png";
import slideshowPrev from "/media/icons/slideshow-prev-button.png";
import star from "/media/rating/christmas-stars.png";
import crowd from "/media/icons/crowd-icon.png";
import { VENUES } from '../../constants';
import { headers } from '../../headers';
import CustomCalender from '../../components/CostumCalender/CostumCalender';
import CostumPopup from '../../components/CostumPopup/CostumPopup';

import VenueRating from '../../components/VenueRating/VenueRating';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const getValidMedia = (mediaArray) => {
  return Array.isArray(mediaArray)
    ? mediaArray.filter((item) => typeof item.url === 'string' && item.url.trim() !== '')
    : [];
};

const formatDate = (isoString) => {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(isoString).toLocaleDateString(undefined, options);
};

const VenueDetails = () => {
  const { id } = useParams();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [leftImages, setLeftImages] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [existingBookings, setExistingBookings] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [owner, setOwner] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(isLoggedIn());
  const [bookingError, setBookingError] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [disabled, setDisabled] = useState(0);
  const [showBookingPopup, setShowBookingPopup] = useState(() => 
    sessionStorage.getItem('showBookingPopup') === 'true'
  );
  const [popupMessage, setPopupMessage] = useState('');

  const dropdownRef = useRef(null);

  const handleRatingUpdate = (newRating) => {
  if (venue) {
    setVenue({
      ...venue,
      rating: newRating
    });
  }
};

  useEffect(() => {
    const handleAuthChange = () => setUserLoggedIn(isLoggedIn());
    window.addEventListener("authchange", handleAuthChange);
    return () => window.removeEventListener("authchange", handleAuthChange);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const response = await fetch(`${VENUES}/${id}?_owner=true&_bookings=true`, {
          method: 'GET',
          headers: headers(),
        });

        if (!response.ok) throw new Error("Failed to fetch Venue details");

        const result = await response.json();
        setVenue(result.data);

        console.log("Venue Owner Data:", result.data.owner);

        const mediaArray = getValidMedia(result.data.media);
        setLeftImages(mediaArray.slice(0, 3));

        try {
          const userResponse = await fetch('/user/profile', { 
            method: 'GET', 
            headers: headers() 
          });
          const userData = await userResponse.json();
          
          if (userData?.data?.favorites?.includes(result.data.id)) {
            setIsFavorite(true);
          }
        } 
        catch (err) {
          console.error("Failed to fetch user profile:", err);
        }
if (result.data?.owner) {
  setOwner(result.data.owner);
}
        try {
          const bookingsResponse = await fetch(`${VENUES}/${id}/bookings`, { 
            headers: headers() 
          });
          const data = await bookingsResponse.json();
          
          if (data?.data) {
            setExistingBookings(data.data.map((booking) => ({
              startDate: new Date(booking.dateFrom),
              endDate: new Date(booking.dateTo),
            })));
          }
        } 
        catch (err) {
          console.error("Failed to fetch bookings:", err);
        }
      } 
      catch (error) {
        console.error("Error fetching hotel:", error);
      } 
      finally {
        setLoading(false);
      }
    };
    
    fetchVenue();
  }, [id]);

  useEffect(() => {
    if (venue?.price && checkInDate && checkOutDate) {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = Math.max((checkOut - checkIn) / (1000 * 60 * 60 * 24), 1);
      const pricePerNight = venue.price;
      const total = nights * pricePerNight;
      setTotalPrice(total);
    }
  }, [checkInDate, checkOutDate, venue?.price]);

  const toggleCalendar = useCallback((type) => {
    setSelectedDateType(type);
    setShowCalendar(prev => !prev);
  }, []);

  const handleDateChange = useCallback((date) => {
    if (selectedDateType === 'start') {
      setCheckInDate(date);
    } 
    else {
      setCheckOutDate(date);
    }
    setShowCalendar(false);
  }, [selectedDateType]);

  const handleNext = useCallback(() => {
    if (!venue?.media?.length) return;
    const mediaArray = getValidMedia(venue.media);
    const newIndex = (currentSlide + 1) % mediaArray.length;
    setCurrentSlide(newIndex);
    setLeftImages(prev => [
      ...prev.slice(1),
      mediaArray[(currentSlide + 3) % mediaArray.length],
    ]);
  }, [venue, currentSlide]);

  const handlePrev = useCallback(() => {
    if (!venue?.media?.length) return;
    const mediaArray = getValidMedia(venue.media);
    const newIndex = (currentSlide - 1 + mediaArray.length) % mediaArray.length;
    setCurrentSlide(newIndex);
    setLeftImages(prev => [
      mediaArray[(currentSlide - 1 + mediaArray.length) % mediaArray.length],
      ...prev.slice(0, 2),
    ]);
  }, [venue, currentSlide]);

  const checkForDoubleBooking = useCallback((newStart, newEnd) => {
    return existingBookings.some(booking => 
      !(newEnd < booking.startDate || newStart > booking.endDate)
    );
  }, [existingBookings]);

  const handleSubmit = useCallback(async () => {
    const formattedCheckInDate = new Date(checkInDate).toISOString().split('T')[0];
    const formattedCheckOutDate = new Date(checkOutDate).toISOString().split('T')[0];
    const guests = adults + children + disabled;
    const newStart = new Date(checkInDate);
    const newEnd = new Date(checkOutDate);

    if (newStart >= newEnd) {
      setErrorMessage('End date must be after start date.');
      return;
    }

    if (checkForDoubleBooking(newStart, newEnd)) {
      setErrorMessage('You have an existing booking during these dates.');
      return;
    }

    if (guests > venue.maxGuests) {
      setPopupMessage(`This venue only allows up to ${venue.maxGuests} guests.`);
      setShowBookingPopup(true);
      return;
    }

    setPopupMessage('Booking Confirmed, View it in your Profile');
    setShowBookingPopup(true);
    await handleBookingSubmit(
      formattedCheckInDate, 
      formattedCheckOutDate, 
      guests, 
      venue.id, 
      setShowBookingPopup, 
      setPopupMessage
    );
  }, [
    checkInDate, 
    checkOutDate, 
    adults, 
    children, 
    disabled, 
    venue, 
    checkForDoubleBooking
  ]);

  if (loading) return <div className={styles.pageStyle}><p>Loading...</p></div>;
  
  if (!venue) return <div className={styles.pageStyle}><p>Venue not found.</p></div>;

  const mediaArray = getValidMedia(venue.media);
  const currentImage = mediaArray[currentSlide]?.url;
  const currentAlt = mediaArray[currentSlide]?.alt || venue.name;
  const totalGuests = adults + children + disabled;

  return (
    <motion.div
      className={styles.pageContent}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className={`${styles.pageStyle} ${showBookingPopup ? styles.blurred : ''}`}>
        <div className={styles.slideshowSection}>
          {mediaArray.length >= 2 ? (
            <div className={styles.slideshowSection}>
              <div className={styles.slideshowLeft}>
                <div className={styles.slideshowLeftContent}>
                  <div className={styles.currentlyViewing}>Currently Viewing</div>
                  {leftImages.map((item, index) => {
                    const dynamicHeight = leftImages.length === 2 ? '50%' : '32.4%';
                    return (
                      <img
                        key={`${item.url}-${index}`}
                        src={item.url}
                        alt={item.alt || `Preview ${index}`}
                        style={{ height: dynamicHeight }}
                        className={styles.previewImage}
                      />
                    );
                  })}
                </div>
              </div>
              
              <div className={styles.slideshowRight}>
                <div className={styles.slideshowButtons}>
                  <div className={styles.slideshowButtonPrev} onClick={handlePrev}>
                    <img src={slideshowPrev} alt="Previous" />
                  </div>
                  <div className={styles.slideshowButtonNext} onClick={handleNext}>
                    <img src={slideshowNext} alt="Next" />
                  </div>
                </div>
                <div className={styles.slideshowProgressFirst}>
                  <p>{currentSlide + 1} out of {mediaArray.length}</p>
                </div>
                
                <AnimatePresence>
                  <motion.div
                    key={currentSlide}
                    className={styles.detailImageWrapper}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className={styles.slideshowProgressSecond}>
                      <p>{currentSlide + 1} out of {mediaArray.length}</p>
                    </div>
                    <img
                      src={currentImage}
                      alt={currentAlt}
                      className={styles.detailImage}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className={styles.noSlideshow}>
              <img
                src={venue.bannerImageUrl || mediaArray[0]?.url || '/default-banner.jpg'}
                alt={venue.name}
                className={styles.detailImage}
              />
            </div>
          )}
        </div>
        
        <div className={styles.hotelInfoBottom}>
          <div className={styles.hotelInfoLeft}>
            <div className={styles.hotelInfoTop}>
              <div className={styles.titleLocation}>
                <h1>{venue.name}</h1>
                <p>{venue.location?.address}, {venue.location?.city}, {venue.location?.country}</p>
                <div className={styles.starRating}>
                  <img src={star} alt="Rating" />
                  {venue.rating}
                </div>
              </div>
            </div>
            
                          {userLoggedIn && (
  <VenueRating 
    venueId={venue.id} 
    currentRating={venue.rating} 
    onRatingUpdate={handleRatingUpdate}
    className={styles.venueRatingComponent}
  />
)}

            <p className={styles.description}>
              <h3>Description</h3><br />
              {venue.description}
            </p>
            
            <p>$ {venue.price} <span className={styles.pricepernight}>/per night</span></p>
            
            <div className={styles.dividerLine}></div>
            
            {venue.meta && (
              <div className={styles.meta}>
                <ul>
                  <li>
                    <div className={styles.maxGuestsLeft}>
                      <img src={crowd} className={styles.crowdIcon} alt="Max guests" />
                      <p>{venue.maxGuests}</p>
                    </div>
                  </li>
                  {venue.meta.wifi && (
                    <li>
                      <div className={styles.included}></div>
                      <i className="fa-solid fa-wifi"></i>
                      <p>Wi-Fi</p>
                    </li>
                  )}
                  {venue.meta.parking && (
                    <li>
                      <div className={styles.included}></div>
                      <i className="fa-solid fa-car"></i>
                      <p>Parking</p>
                    </li>
                  )}
                  {venue.meta.breakfast && (
                    <li>
                      <div className={styles.included}></div>
                      <i className="fa-solid fa-utensils"></i>
                      <p>Breakfast</p>
                    </li>
                  )}
                  {venue.meta.pets && (
                    <li>
                      <div className={styles.included}></div>
                      <i className="fa-solid fa-paw"></i>
                      <p>Pets Allowed</p>
                    </li>
                  )}
                </ul>
              </div>
            )}            
            
            <div className={styles.dividerLine}></div>

            <div className={styles.venueOwner}>
              <h3>Venue Manager</h3>
{owner && (
  <Link to={`/view-profile/${owner.name}`} className={styles.venueProfileName}>
    <img
      src={owner.avatar?.url || '/media/images/mdefault.jpg'}
      alt={owner.avatar?.alt || 'Venue owner'}
    />
    <p>{owner.name || 'Unknown Owner'}</p>
  </Link>
)}
</div>
            <div className={styles.venueInfo}>
                <h3>Venue Info</h3>
              <div className={styles.venueCreationDates}>
                <div className={styles.venueDates}>
                <p>Created</p>
                <span>{formatDate(venue.created)}</span>
              </div>
              <div className={styles.venueDates}>
                <p>Updated</p>
                <span>{formatDate(venue.updated)}</span>
              </div>
              </div>
            </div>
          </div>
          
          <div className={styles.hotelInfoRight}>
            {userLoggedIn ? (
              <>
                <div className={styles.bookDateContent}>
                  <h3>Find the Perfect Date</h3>
                  <div className={styles.bookDate}>
                    <div className={styles.bookDateStart}>
                      <i 
                        className="fa-solid fa-calendar-days" 
                        onClick={() => toggleCalendar('start')}
                      ></i>
                      <input
                        type="text"
                        value={checkInDate}
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
                        value={checkOutDate}
                        placeholder="Check-out Date"
                        onClick={() => toggleCalendar('end')}
                        readOnly
                      />
                    </div>
                  </div>
                  
                  {showCalendar && (
                    <CustomCalender
                      value={selectedDateType === 'start' ? checkInDate : checkOutDate}
                      onDateChange={handleDateChange}
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
                      <p>{`${totalGuests} Guests`}</p>
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
                
                {bookingError && <p className={styles.errorText}>{bookingError}</p>}
                {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

                <div className={styles.dividerLine}></div>

                <div className={styles.maxGuestsPrice}>
                  <p className={styles.maxGuestsSecond}>
                    <strong>{venue.maxGuests}</strong> <span>Max Guests</span>
                  </p>
                  <div className={styles.bookPrice}>
                    <p>
                      <span className={styles.totalPriceSpan}>Total Price</span>
                      <strong> ${totalPrice.toFixed(2)}</strong> 
                      <span>/ ${venue.price} per night</span>
                    </p>

                    <Buttons size="large" version="v2" onClick={handleSubmit}>
                      Book Room
                    </Buttons>
                  </div>  
                </div>

                <div className={styles.maxGuestsSecond}>
                  <p>
                    Total Price:<strong> ${totalPrice.toFixed(2)}</strong> 
                    <span>/ ${venue.price} per night</span>
                  </p>

                  <Buttons size="large" version="v2" onClick={handleSubmit}>
                    Book Room
                  </Buttons>
                </div>

                <div className={styles.dividerLine}></div>
                <p className={styles.maxGuestsFirst}>
                  <strong>{venue.maxGuests}</strong> <span>Max Guests</span>
                </p>
              </>
            ) : (
              <div className={styles.loginReminder}>
                <p className={styles.loginMessage}>
                  Sign in to view booking options and availability.
                </p>
                <Buttons
                  size="medium"
                  version="v1"
                  onClick={() => {
                    window.location.href = "/login-costumer";
                  }}
                >
                  Login
                </Buttons>
              </div>
            )}
          </div>
        </div>
      </div>      
      {showBookingPopup && (
        <CostumPopup 
          message={popupMessage} 
          onClose={() => setShowBookingPopup(false)}
          showButtons = {false}  
        />
      )}
    </motion.div>
  );
};

export default VenueDetails;