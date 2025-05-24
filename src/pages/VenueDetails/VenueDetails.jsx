import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './VenueDetails.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import Buttons from '../../components/Buttons/Buttons';
import { isLoggedIn, getUserRole } from '../../auth/auth';
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
import VenueDetailsSkeleton from '../../components/VenueDetailsSkeleton/VenueDetailsSkeleton';
import VenueNotFound from '../../components/VenueNotFound/VenueNotFound';

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

const MetaTooltip = ({ message, isVisible, position }) => {
  if (!isVisible) return null;

  return (
    <div 
      className={styles.metaTooltip}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className={styles.tooltipArrow}></div>
      {message}
    </div>
  );
};

const VenueDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [calendarInitiatedFrom, setCalendarInitiatedFrom] = useState(null);
  
  const [selectedDateType, setSelectedDateType] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(isLoggedIn());
  const [userRole, setUserRole] = useState('guest');
  const [bookingError, setBookingError] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [disabled, setDisabled] = useState(0);
  const [showBookingPopup, setShowBookingPopup] = useState(() => 
    sessionStorage.getItem('showBookingPopup') === 'true'
  );
  const [popupMessage, setPopupMessage] = useState('');

  const [activeTooltip, setActiveTooltip] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const [isSelectingStart, setIsSelectingStart] = useState(true);

  const dropdownRef = useRef(null);
  const [profileError, setProfileError] = useState('');
  const [totalNights, setTotalNights] = useState(0);

  const handleRatingUpdate = (newRating) => {
    if (venue) {
      setVenue({
        ...venue,
        rating: newRating
      });
    }
  };

  useEffect(() => {
  setTotalGuests(adults + children + disabled);
}, [adults, children, disabled]);

  const handleMetaClick = (metaType, event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    const tooltipTop = rect.top + scrollTop - 60;
    const tooltipLeft = rect.left + (rect.width / 2) - 100;
    
    setTooltipPosition({
      top: tooltipTop,
      left: Math.max(10, tooltipLeft)
    });

    let message = '';
    switch (metaType) {
      case 'maxGuests':
        message = `The total amount of guests allowed in a single booking is ${venue.maxGuests}`;
        break;
      case 'wifi':
        message = 'Free Wi-Fi internet access is included with your stay';
        break;
      case 'parking':
        message = 'Free parking is available for guests during their stay';
        break;
      case 'breakfast':
        message = 'Complimentary breakfast is included with your booking';
        break;
      case 'pets':
        message = 'Pet-friendly venue - your furry friends are welcome to stay';
        break;
      default:
        message = 'Additional information about this amenity';
    }

    setActiveTooltip(message);

    setTimeout(() => {
      setActiveTooltip(null);
    }, 5000);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeTooltip && !event.target.closest(`.${styles.meta}`)) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeTooltip]);

useEffect(() => {
  const handleAuthChange = async () => {
    const loggedIn = isLoggedIn();
    setUserLoggedIn(loggedIn);

    if (loggedIn) {
      try {
        const role = await getUserRole();
        console.log("Detected user role:", role);
        setUserRole(role);
      } 
      catch (error) {
        console.error('Error determining user role:', error);
        setUserRole('customer');
      }
    } 
    else {
      setUserRole('guest');
    }
  };

    handleAuthChange();
    window.addEventListener("authchange", handleAuthChange);
    return () => window.removeEventListener("authchange", handleAuthChange);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const updateLeftImages = useCallback((slideIndex, mediaArray) => {
    if (!mediaArray || mediaArray.length === 0) return [];
    
    const totalImages = mediaArray.length;
    const leftImagesArray = [];
    
    leftImagesArray.push(mediaArray[slideIndex]);
    
    for (let i = 1; i < 3; i++) {
      const nextIndex = (slideIndex + i) % totalImages;
      leftImagesArray.push(mediaArray[nextIndex]);
    }
    
    return leftImagesArray;
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
        setLeftImages(updateLeftImages(0, mediaArray));

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
  }, [id, updateLeftImages]);

useEffect(() => {
  if (checkInDate && checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const diffTime = checkOut - checkIn;
    const nights = Math.max(diffTime / (1000 * 60 * 60 * 24), 0);
    setTotalNights(nights);

    if (venue?.price) {
      const total = nights * venue.price;
      setTotalPrice(total);
    }
  } 
  else {
    setTotalNights(0);
    setTotalPrice(0);
  }
}, [checkInDate, checkOutDate, venue?.price]);

  const toggleCalendar = useCallback((type) => {
    if (showCalendar && calendarInitiatedFrom === type) {
      setShowCalendar(false);
      setCalendarInitiatedFrom(null);
    } 
    else {
      setShowCalendar(true);
      setCalendarInitiatedFrom(type);
      setSelectedDateType(type);
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
        setSelectedDateType('end');
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

  const handleNext = useCallback(() => {
    if (!venue?.media?.length) return;
    const mediaArray = getValidMedia(venue.media);
    const newIndex = (currentSlide + 1) % mediaArray.length;
    setCurrentSlide(newIndex);
    setLeftImages(updateLeftImages(newIndex, mediaArray));
  }, [venue, currentSlide, updateLeftImages]);

  const handlePrev = useCallback(() => {
    if (!venue?.media?.length) return;
    const mediaArray = getValidMedia(venue.media);
    const newIndex = (currentSlide - 1 + mediaArray.length) % mediaArray.length;
    setCurrentSlide(newIndex);
    setLeftImages(updateLeftImages(newIndex, mediaArray));
  }, [venue, currentSlide, updateLeftImages]);

  const handlePreviewImageClick = useCallback((clickedImage) => {
    if (!venue?.media?.length) return;
    const mediaArray = getValidMedia(venue.media);
    
    const newIndex = mediaArray.findIndex(item => item.url === clickedImage.url);
    
    if (newIndex !== -1 && newIndex !== currentSlide) {
      setCurrentSlide(newIndex);
      setLeftImages(updateLeftImages(newIndex, mediaArray));
    }
  }, [venue, currentSlide, updateLeftImages]);

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
    window.location.reload();
  }, [
    checkInDate, 
    checkOutDate, 
    adults, 
    children, 
    disabled, 
    venue, 
    checkForDoubleBooking
  ]);

  const [totalGuests, setTotalGuests] = useState(adults + children + disabled);

const mediaArray = venue ? getValidMedia(venue.media) : [];
const currentImage = mediaArray[currentSlide]?.url;
const currentAlt = mediaArray[currentSlide]?.alt || venue?.name || '';

  if (loading) return <VenueDetailsSkeleton />;

if (!venue) return (
  <div className={styles.pageContent}>
    <VenueNotFound 
      venueId={id}
      onGoBack={() => navigate(-1)}
      onBrowseVenues={() => navigate('/')}
      
    />
  </div>
);

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
                    const isCurrentImage = item.url === currentImage;
                    return (
                      <img
                        key={`${item.url}-${index}`}
                        src={item.url}
                        alt={item.alt || `Preview ${index}`}
                        style={{ 
                          height: dynamicHeight,
                        }}
                        className={`${styles.previewImage} ${isCurrentImage ? styles.currentPreview : ''}`}
                        onClick={() => handlePreviewImageClick(item)}
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
            
            <p className={styles.pricepernight}>$ {venue.price} <span>/per night</span></p>
            
            <div className={styles.dividerLine}></div>
            
            {venue.meta && (
              <div className={styles.meta}>
                <ul>
                  <li 
                    className={styles.clickableMeta}
                    onClick={(e) => handleMetaClick('maxGuests', e)}
                  >
                    <div className={styles.maxGuestsLeft}>
                      <img src={crowd} className={styles.crowdIcon} alt="Max guests" />
                      <p>{venue.maxGuests}</p>
                    </div>
                  </li>
                  {venue.meta.wifi && (
                    <li 
                      className={styles.clickableMeta}
                      onClick={(e) => handleMetaClick('wifi', e)}
                    >
                      <div className={styles.included}></div>
                      <i className="fa-solid fa-wifi"></i>
                      <p>Wi-Fi</p>
                    </li>
                  )}
                  {venue.meta.parking && (
                    <li 
                      className={styles.clickableMeta}
                      onClick={(e) => handleMetaClick('parking', e)}
                    >
                      <div className={styles.included}></div>
                      <i className="fa-solid fa-car"></i>
                      <p>Parking</p>
                    </li>
                  )}
                  {venue.meta.breakfast && (
                    <li 
                      className={styles.clickableMeta}
                      onClick={(e) => handleMetaClick('breakfast', e)}
                    >
                      <div className={styles.included}></div>
                      <i className="fa-solid fa-utensils"></i>
                      <p>Breakfast</p>
                    </li>
                  )}
                  {venue.meta.pets && (
                    <li 
                      className={styles.clickableMeta}
                      onClick={(e) => handleMetaClick('pets', e)}
                    >
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
              {owner ? (
                <div className={styles.ownerWrapper}>
                  <Link
                    to={`/view-profile/${owner.name}`}
                    className={styles.venueProfileName}
                    onClick={(e) => {
                      if (!userLoggedIn) {
                        e.preventDefault();
                        setProfileError('Only logged in users can view Profiles');
                        
                        setTimeout(() => {
                          setProfileError('');
                        }, 5000);
                      }
                    }}
                  >
                    <img
                      src={owner.avatar?.url || '/media/images/mdefault.jpg'}
                      alt={owner.avatar?.alt || 'Venue owner'}
                    />
                    <p>{owner.name || 'Unknown Owner'}</p>
                  </Link>
                  
                  {profileError && <p className={styles.profileError}>{profileError}</p>}
                </div>
              ) : (
                <p>Owner information not available</p>
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
  {userLoggedIn && userRole === 'guest' ? (
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
      {bookingError && <p className={styles.errorText}>{bookingError}</p>}
      {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}
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
            <span> / ${venue.price} per night</span>
          </p>
        </div>  
      </div>                
      <div className={styles.submitButton}>
        <Buttons size="medium" version="v1" onClick={handleSubmit}>
          Book Room
        </Buttons>
      </div>
    </>
  ) : userLoggedIn && userRole === 'venueManager' ? (
    <div className={styles.loginReminder}>
      <p className={styles.loginMessage}>
        Venue Managers cannot book venues. Please log in as a Customer to make a booking.
      </p>
      <Buttons
        size="medium"
        version="v1"
        onClick={() => {
          window.location.href = "/login-costumer";
        }}
      >
        Login as Customer
      </Buttons>
    </div>
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

      <MetaTooltip 
        message={activeTooltip} 
        isVisible={!!activeTooltip}
        position={tooltipPosition}
      />

      {showBookingPopup && (
        <CostumPopup 
          message={popupMessage} 
          onClose={() => setShowBookingPopup(false)}
          showButtons={false}  
        />
      )}
    </motion.div>
  );
};

export default VenueDetails;