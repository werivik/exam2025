import { useParams } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import styles from './HotelDetails.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import Buttons from '../../components/Buttons/Buttons';
import { isLoggedIn, getToken, handleBookingSubmit } from '../../auth/auth';
import slideshowNext from "/media/icons/slideshow-next-button.png";
import slideshowPrev from "/media/icons/slideshow-next-button.png";
import stars from "/media/rating/christmas-stars.png";
import { VENUES } from '../../constants';
import { headers } from '../../headers';
import CustomCalender from '../../components/CostumCalender/CostumCalender';

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

const HotelDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [leftImages, setLeftImages] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
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
    const fetchHotel = async () => {
      try {
        const response = await fetch(`${VENUES}/${id}`, {
          method: 'GET',
          headers: headers(),
        });

        if (!response.ok) throw new Error("Failed to fetch hotel details");

        const result = await response.json();
        setHotel(result.data);

        const mediaArray = getValidMedia(result.data.media);
        setLeftImages(mediaArray.slice(0, 3));

        const userResponse = await fetch('/user/profile', { method: 'GET', headers: headers() });
        const userData = await userResponse.json();
        setUserProfile(userData.data);

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
    fetchHotel();
  }, [id]);

  const toggleCalendar = (type) => {
    setSelectedDateType(type);
    setShowCalendar(!showCalendar);
  };

  const handleNext = () => {
    if (!hotel?.media?.length) return;
    const mediaArray = getValidMedia(hotel.media);
    const newIndex = (currentSlide + 1) % mediaArray.length;
    setCurrentSlide(newIndex);
    const nextLeftImages = [
      ...leftImages.slice(1),
      mediaArray[(currentSlide + 3) % mediaArray.length],
    ];
    setLeftImages(nextLeftImages);
  };

  const handlePrev = () => {
    if (!hotel?.media?.length) return;
    const mediaArray = getValidMedia(hotel.media);
    const newIndex = (currentSlide - 1 + mediaArray.length) % mediaArray.length;
    setCurrentSlide(newIndex);
    const nextLeftImages = [
      mediaArray[(currentSlide - 1 + mediaArray.length) % mediaArray.length],
      ...leftImages.slice(0, 2),
    ];
    setLeftImages(nextLeftImages);
  };

  const calculateTotalPrice = () => {
    if (!checkInDate || !checkOutDate || !hotel?.price) return;
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.max((checkOut - checkIn) / (1000 * 60 * 60 * 24), 1);
    const pricePerNight = hotel.price;
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
    if (hotel?.price && checkInDate && checkOutDate) {
      calculateTotalPrice();
    }
  }, [checkInDate, checkOutDate, hotel?.price]);
    

  const handleDateChange = (date) => {
    if (selectedDateType === 'start') {
      setCheckInDate(date);
    } 
    
    else {
      setCheckOutDate(date);
    }
    setShowCalendar(false);
  };

  const handleSubmit = () => {
    if (!checkInDate || !checkOutDate) {
        setBookingError("Please select both check-in and check-out dates.");
        return;
    }

    const formattedCheckInDate = new Date(checkInDate).toISOString().split('T')[0];
    const formattedCheckOutDate = new Date(checkOutDate).toISOString().split('T')[0];

    handleBookingSubmit(formattedCheckInDate, formattedCheckOutDate);
};

  if (loading) return <div className={styles.pageStyle}><p>Loading...</p></div>;
  if (!hotel) return <div className={styles.pageStyle}><p>Venue not found.</p></div>;

  const mediaArray = getValidMedia(hotel.media);
  const currentImage = mediaArray[currentSlide]?.url;
  const currentAlt = mediaArray[currentSlide]?.alt || hotel.name;

  return (
    <motion.div
    className={styles.pageContent}
    initial="initial"
    animate="animate"
    exit="exit"
    variants={pageVariants}
    transition={{ duration: 0.5, ease: "easeInOut" }}
  >
      <div className={styles.pageStyle}>
        <div className={styles.hotelInfoTop}>
          <div className={styles.titleLocation}>
            <h1>{hotel.name}</h1>
            <p><i className="fa-solid fa-location-dot"></i>{hotel.location?.address}, {hotel.location?.city}, {hotel.location?.country}</p>
          </div>
          <div className={styles.hotelInfoTopRight}>
            <p className={styles.hotelRating}><strong>Rating:</strong> {hotel.rating} <img src={stars} alt="Star" className={styles.singleStar} /></p>
          </div>
        </div>
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
        src={hotel.bannerImageUrl || mediaArray[0]?.url || '/default-banner.jpg'}
        alt={hotel.name}
        className={styles.detailImage}
      />
    </div>
  )}
        </div>
        <div className={styles.hotelInfoBottom}>
          <div className={styles.hotelInfoLeft}>
            <p className={styles.description}><strong>Description</strong><br />{hotel.description}</p>
            {hotel.meta && (
              <div className={styles.meta}>
                <h3>Venue Amenities</h3>
                <ul>
                  <li>
                    {hotel.meta.wifi ? (
                      <div className={styles.included}>
                        <i className="fa-solid fa-check"></i>
                      </div>
                    ) : (
                      <div className={styles.notIncluded}>
                        <i className="fa-solid fa-xmark"></i>
                      </div>
                    )}
                    <i className="fa-solid fa-wifi" style={{ opacity: hotel.meta.wifi ? 1 : 0.5 }}></i> <p style={{ opacity: hotel.meta.wifi ? 1 : 0.5 }}>Wi-Fi</p>
                  </li>
                  <li>
                    {hotel.meta.parking ? (
                      <div className={styles.included}>
                        <i className="fa-solid fa-check"></i>
                      </div>
                    ) : (
                      <div className={styles.notIncluded}>
                        <i className="fa-solid fa-xmark"></i>
                      </div>
                    )}
                    <i className="fa-solid fa-car" style={{ opacity: hotel.meta.parking ? 1 : 0.5 }}></i> <p style={{ opacity: hotel.meta.parking ? 1 : 0.5 }}>Free Parking</p>
                  </li>
                  <li>
                    {hotel.meta.breakfast ? (
                      <div className={styles.included}>
                        <i className="fa-solid fa-check"></i>
                      </div>
                    ) : (
                      <div className={styles.notIncluded}>
                        <i className="fa-solid fa-xmark"></i>
                      </div>
                    )}
                    <i className="fa-solid fa-utensils" style={{ opacity: hotel.meta.breakfast ? 1 : 0.5 }}></i> <p style={{ opacity: hotel.meta.breakfast ? 1 : 0.5 }}>Breakfast Included</p>
                  </li>
                  <li>
                    {hotel.meta.pets ? (
                      <div className={styles.included}>
                        <i className="fa-solid fa-check"></i>
                      </div>
                    ) : (
                      <div className={styles.notIncluded}>
                        <i className="fa-solid fa-xmark"></i>
                      </div>
                    )}
                    <i className="fa-solid fa-paw" style={{ opacity: hotel.meta.pets ? 1 : 0.5 }}></i> <p style={{ opacity: hotel.meta.pets ? 1 : 0.5 }}>Pets Allowed</p>
                  </li>
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
          <i className="fa-solid fa-calendar-days" onClick={() => toggleCalendar('start')}></i>
          <input
            className={styles.bookDateStart}
            type="text"
            value={checkInDate}
            placeholder="Check-in Date"
            onClick={() => toggleCalendar('start')}
            readOnly
          />
          <i className="fa-solid fa-calendar-days" onClick={() => toggleCalendar('end')}></i>
          <input
            className={styles.bookDateEnd}
            type="text"
            value={checkOutDate}
            placeholder="Check-out Date"
            onClick={() => toggleCalendar('end')}
            readOnly
          />
        </div>
        {showCalendar && (
          <CustomCalender
            value={selectedDateType === 'start' ? checkInDate : checkOutDate}
            onDateChange={handleDateChange}
          />
        )}
      </div>

      <div className={styles.bookGuests}>
        <h3></h3>
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

      <div className={styles.bookPrice}>
        <p>Total Price: <strong>${totalPrice.toFixed(2)}</strong> <span>/ ${hotel.price} per night</span></p>

        <Buttons size="large" version="v2" onClick={handleSubmit}>
          Book Room
        </Buttons>
      </div>

      <div className={styles.dividerLine}></div>

      <p><strong>Max Guests</strong> {hotel.maxGuests}</p>

      <div className={styles.favoriteVenue}>
        <div className={styles.heartContainer}>
          <div className={`${styles.heart}`} />
        </div>
        <p>Add to Favorites</p>
      </div>
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
    </motion.div>
  );
};

export default HotelDetails;
