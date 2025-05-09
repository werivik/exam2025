import { useParams } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import styles from './VenueDetails.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import Buttons from '../../components/Buttons/Buttons';
import { isLoggedIn } from '../../auth/auth';
import { handleBookingSubmit } from '../../auth/booking';
import { handleFavoriteToggle } from '../../auth/favorite';
import slideshowNext from "/media/icons/slideshow-next-button.png";
import slideshowPrev from "/media/icons/slideshow-next-button.png";
import star from "/media/rating/christmas-stars.png";
import heartEmpty from "/media/icons/heartempty.png";
import heartFull from "/media/icons/heartfull.png";
import heartGif from "/media/icons/heartgif.gif";
import crowd from "/media/icons/crowd-icon.png";
import money from "/media/icons/money.png";
import { VENUES } from '../../constants';
import { headers } from '../../headers';
import CustomCalender from '../../components/CostumCalender/CostumCalender';
import CostumPopup from '../../components/CostumPopup/CostumPopup';

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
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [owner, setOwner] = useState(null);
  const [filters, setFilters] = useState({
    adults: 1,
    children: 0,
    disabled: 0,
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(isLoggedIn());
  const [bookingError, setBookingError] = useState('');

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [disabled, setDisabled] = useState(0);
  const [showBookingPopup, setShowBookingPopup] = useState(() => {
    return sessionStorage.getItem('showBookingPopup') === 'true';
  });
  
  const [popupMessage, setPopupMessage] = useState('');

  const dropdownRef = useRef(null);

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
        const response = await fetch(`${VENUES}/${id}`, {
          method: 'GET',
          headers: headers(),
        });

        if (!response.ok) throw new Error("Failed to fetch Venue details");

        const result = await response.json();
        setVenue(result.data);

        const mediaArray = getValidMedia(result.data.media);
        setLeftImages(mediaArray.slice(0, 3));

        const userResponse = await fetch('/user/profile', { method: 'GET', headers: headers() });
        const userData = await userResponse.json();
        setUserProfile(userData.data);
        
        if (userData?.data?.favorites?.includes(result.data.id)) {
          setIsFavorite(true);
        }        

        if (result.data?.owner?.name) {
          try {
            const ownerRes = await fetch(`${VENUES}/../profiles/${result.data.owner.name}?_venues=true`, {
              headers: headers(),
            });
            const ownerJson = await ownerRes.json();
            setOwner(ownerJson.data);
          } 
          
          catch (ownerErr) {
            console.error("Failed to fetch owner profile:", ownerErr);
          }
        }

                
        if (data?.data) {
          setExistingBookings(data.data.map((booking) => ({
            startDate: new Date(booking.dateFrom),
            endDate: new Date(booking.dateTo),
          })));
        }

        if (!owner) {
          setOwner({
            name: "Test Owner",
            avatar: {
              url: "/media/images/mdefault.jpg",
              alt: "Placeholder",
            },
          });
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

  const toggleCalendar = (type) => {
    setSelectedDateType(type);
    setShowCalendar(!showCalendar);
  };

  const checkForDoubleBooking = (newStart, newEnd) => {
    for (let booking of existingBookings) {
      if (!(newEnd < booking.startDate || newStart > booking.endDate)) {
        return true;
      }
    }
    return false;
  };

  const handleNext = () => {
    if (!venue?.media?.length) return;
    const mediaArray = getValidMedia(venue.media);
    const newIndex = (currentSlide + 1) % mediaArray.length;
    setCurrentSlide(newIndex);
    const nextLeftImages = [
      ...leftImages.slice(1),
      mediaArray[(currentSlide + 3) % mediaArray.length],
    ];
    setLeftImages(nextLeftImages);
  };

  const handlePrev = () => {
    if (!venue?.media?.length) return;
    const mediaArray = getValidMedia(venue.media);
    const newIndex = (currentSlide - 1 + mediaArray.length) % mediaArray.length;
    setCurrentSlide(newIndex);
    const nextLeftImages = [
      mediaArray[(currentSlide - 1 + mediaArray.length) % mediaArray.length],
      ...leftImages.slice(0, 2),
    ];
    setLeftImages(nextLeftImages);
  };

  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate || !venue?.price) return;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.max((checkOut - checkIn) / (1000 * 60 * 60 * 24), 1);
    const pricePerNight = venue.price;
    const total = nights * pricePerNight;
    setTotalPrice(total);
  };

  const renderGuestInfo = () => {
    let guestInfo = `${filters.adults} Adult${filters.adults !== 1 ? "s" : ""}`;
    if (filters.children > 0) {
      guestInfo += `, ${filters.children} Child${filters.children !== 1 ? "ren" : ""}`;
    }
    if (filters.disabled > 0) {
      guestInfo += `, ${filters.disabled} Assisted Guest${filters.disabled !== 1 ? "s" : ""}`;
    }
    return guestInfo;
  };

  const totalGuests = adults + children + disabled;

  useEffect(() => {
    if (venue?.price && checkInDate && checkOutDate) {
      calculateTotalPrice();
    }
  }, [checkInDate, checkOutDate, venue?.price]);

  const handleDateChange = (date) => {
    if (selectedDateType === 'start') {
      setCheckInDate(date);
    } 
    
    else {
      setCheckOutDate(date);
    }
    setShowCalendar(false);
  };

  const handleSubmit = async () => {
    const formattedCheckInDate = new Date(checkInDate).toISOString().split('T')[0];
    const formattedCheckOutDate = new Date(checkOutDate).toISOString().split('T')[0];
    const guests = adults + children + disabled;

    const newStart = new Date(newStartDate);
    const newEnd = new Date(newEndDate);

    if (newStart >= newEnd) {
      setErrorMessage('End date must be after start date.');
      return;
    }

    const isDoubleBooked = checkForDoubleBooking(newStart, newEnd);

    if (isDoubleBooked) {
      setErrorMessage('You have an existing booking during these dates.');
    } 

    if (guests > venue.maxGuests) {
      setPopupMessage(`This venue only allows up to ${venue.maxGuests} guests.`);
      setShowBookingPopup(true);
      return;
    }

    setPopupMessage('Booking Confirmed!');
    setShowBookingPopup(true);
    await handleBookingSubmit(formattedCheckInDate, formattedCheckOutDate, guests, venue.id, setShowBookingPopup, setPopupMessage);
  };

  if (loading) return <div className={styles.pageStyle}><p>Loading...</p></div>;
  if (!venue) return <div className={styles.pageStyle}><p>Venue not found.</p></div>;

  const mediaArray = getValidMedia(venue.media);
  const currentImage = mediaArray[currentSlide]?.url;
  const currentAlt = mediaArray[currentSlide]?.alt || venue.name;

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
        <div className={styles.slideshowProgress}>
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
            <div className={styles.starRating}><img src={star}></img>{venue.rating}</div>
          </div>
        </div>
            <p className={styles.description}><h3>Description</h3><br />{venue.description}</p>
            <p>$ {venue.price} <span className={styles.pricepernight}>/per night</span></p>
            <div className={styles.dividerLine}></div>
            {venue.meta && (
              <div className={styles.meta}>
                    <ul>
                    <li>
                    <div className={styles.maxGuestsLeft}>
                      <img src={crowd} className={styles.crowdIcon}></img>
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
            {owner && (
              <div className={styles.venueOwner}>
                <p><strong>Venue Host</strong></p>
                <div className={styles.venueProfileName}>
                  {owner.avatar?.url && (
                    <img
                      src={owner.avatar.url}
                      alt={owner.avatar.alt || `${owner.name}'s avatar`}
                    />
                  )}
                  <p>{owner.name}</p>
                </div>
              </div>
            )}
          </div>
          <div className={styles.hotelInfoRight}>
  {userLoggedIn ? (
    <>
      <div className={styles.bookDateContent}>
        <h3>Find the Perfect Date</h3>
        <div className={styles.bookDate}>
          <div className={styles.bookDateStart}>
          <i className="fa-solid fa-calendar-days" onClick={() => toggleCalendar('start')}></i>
          <input
            type="text"
            value={checkInDate}
            placeholder="Check-in Date"
            onClick={() => toggleCalendar('start')}
            readOnly
          />
          </div>
          <div className={styles.bookDateEnd}>
          <i className="fa-solid fa-calendar-days" onClick={() => toggleCalendar('end')}></i>
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
    onClick={() => setShowGuestDropdown((prev) => !prev)}
    ref={dropdownRef}
  >
    <p>{`${adults + children + disabled} Guests`}</p>
    <div
      className={`${styles.dropdownMenu} ${showGuestDropdown ? styles.open : ''}`}
    >
      {["adults", "children", "disabled"].map((type) => (
        <div key={type} className={styles.dropdownRow}>
          <span className={styles.label}>
            {type === "adults"
              ? "Adults"
              : type === "children"
              ? "Children"
              : `Assisted Guest${disabled !== 1 ? "s" : ""}`}
          </span>
          <div className={styles.counterControls}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (type === "adults") {
                  setAdults(Math.max(1, adults - 1));
                } 
                
                else if (type === "children") {
                  setChildren(Math.max(0, children - 1));
                } 
                
                else {
                  setDisabled(Math.max(0, disabled - 1));
                }
              }}
            >
              -
            </button>
            <span>{type === "adults" ? adults : type === "children" ? children : disabled}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (type === "adults") {
                  setAdults(adults + 1);
                } 
                
                else if (type === "children") {
                  setChildren(children + 1);
                } 
                
                else {
                  setDisabled(disabled + 1);
                }
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

      <div className={styles.dividerLine}></div>

      <div className={styles.maxGuestsPrice}>
      <p className={styles.maxGuestsSecond}><strong>Max Guests</strong> {venue.maxGuests}</p>
      <div className={styles.bookPrice}>
        <p><span className={styles.totalPriceSpan}>Total Price</span><strong> ${totalPrice.toFixed(2)}</strong> <span>/ ${venue.price} per night</span></p>

        <Buttons size="large" version="v2" onClick={handleSubmit}>
          Book Room
        </Buttons>
      </div>  
      </div>

      <div className={styles.maxGuestsSecond}>
        <p>Total Price:<strong> ${totalPrice.toFixed(2)}</strong> <span>/ ${venue.price} per night</span></p>

        <Buttons size="large" version="v2" onClick={handleSubmit}>
          Book Room
        </Buttons>
      </div>

      <div className={styles.dividerLine}></div>

      <p className={styles.maxGuestsFirst}><strong>Max Guests</strong> {venue.maxGuests}</p>

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
  />
)}
    </motion.div>
  );
};

export default VenueDetails;