import { useEffect, useState, useCallback, useRef, React } from 'react';
import { useNavigate, Link, redirect } from 'react-router-dom';
import { motion } from "framer-motion";
import debounce from 'lodash.debounce';
import styles from './Home.module.css';
import { isLoggedIn } from "../../auth/auth";
import Buttons from '../../components/Buttons/Buttons';

import Edge from "/media/images/beige-edge.png";
import registerImage from "/media/hotelTypes/hotelReseption.jpeg";
import animalImage from "/media/metaImages/animal.jpeg";
import breakfastImage from "/media/metaImages/breakfast.jpg";
import parkingImage from "/media/metaImages/parking.jpeg";
import wifiImage from "/media/metaImages/wifi.jpeg";

import { VENUES } from '../../constants';
import { headers } from '../../headers';
import VenueCardFirstType from '../../components/VenueCardFirstType/VenueCardFirstType';
import CustomCalender from '../../components/CostumCalender/CostumCalender';
import BannerSlideshow from '../../components/BannerSlideshow/BannerSlideshow';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const Home = () => {
  const [venues, setVenues] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showScrollIcon, setShowScrollIcon] = useState(true);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const guestDropdownRef = useRef(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState('start');
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isLoggedIn());
  const [profile, setProfile] = useState(null);

  const toggleCalendar = (type) => {
    setShowCalendar(false);
    setSelectedDateType(type);
    setTimeout(() => {
      setShowCalendar(true);
    }, 0);
  };  

  const handleDateChange = (newDate) => {
    if (selectedDateType === 'start') {
      setCheckInDate(newDate);
      setFilters(prev => ({ ...prev, startDate: newDate }));
    } 
    else {
      setCheckOutDate(newDate);
      setFilters(prev => ({ ...prev, endDate: newDate }));
    }
    setShowCalendar(false);
  };  

  const [filters, setFilters] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    adults: 1,
    children: 0,
    disabled: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch(VENUES, { method: "GET", headers: headers() });

        if (!response.ok) throw new Error("Failed to fetch venues");

        const result = await response.json();

        const getTopRatedVenues = (venuesArray) =>
          (venuesArray || [])
            .filter(venue => typeof venue.rating === "number")
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);

        setVenues(getTopRatedVenues(result.data));

        const locationsSet = new Set();
        (result.data || []).forEach(venue => {
          const city = venue.location?.city;
          const country = venue.location?.country;
          if (city && country) locationsSet.add(`${city}, ${country}`);
        });

        setAllLocations(Array.from(locationsSet));
      } 
      catch (error) {
        console.error("Error fetching venues:", error);
      }
    };

    fetchVenues();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollIcon(window.scrollY === 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDestinationSuggestions = useCallback(
    debounce((input) => {
      if (!input) return setSuggestions([]);
      const searchTerm = input.toLowerCase();
      const matches = allLocations.filter((loc) =>
        loc.toLowerCase().startsWith(searchTerm)
      );
      setSuggestions(matches.length ? matches : ["No matching results..."]);
    }, 300),
    [allLocations]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    if (name === "destination") handleDestinationSuggestions(value);
  };

  const handleGuestsChange = (e) => {
    const { name, value } = e.target;
    if (name === "children" && value > 0 && filters.adults === 0 && filters.disabled === 0) {
      alert("At least one adult or Assisted guest must be present if there are children.");
      return;
    }
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const renderGuestInfo = () => {
    let guestInfo = `${filters.adults} Adult${filters.adults !== 1 ? "s" : ""}`;
    if (filters.children > 0) guestInfo += `, ${filters.children} Child${filters.children !== 1 ? "ren" : ""}`;
    if (filters.disabled > 0) guestInfo += `, ${filters.disabled} Assisted${filters.disabled !== 1 ? " Guests" : ""}`;
    return guestInfo;
  };

  const applyFilters = async () => {
    const totalGuests = parseInt(filters.adults) + parseInt(filters.disabled);
    if (totalGuests < 1) return alert("Please enter at least one adult or assisted guest.");
    if (!filters.startDate) return alert("Please select a start date.");

    if (filters.destination.trim()) {
      try {
        let query = `${VENUES}/search`;
        const params = new URLSearchParams();

        params.append("q", filters.destination.trim());
        if (filters.startDate) params.append("startDate", filters.startDate);
        if (filters.endDate) params.append("endDate", filters.endDate);
        query += `?${params.toString()}`;

        const response = await fetch(query, { method: "GET", headers: headers() });
        if (!response.ok) throw new Error("Failed to fetch filtered results");

        const result = await response.json();
        const filtered = result.data.filter(venue => 
          venue.maxGuests >=
          (parseInt(filters.adults) + parseInt(filters.children) + parseInt(filters.disabled))
        );

        setVenues(filtered);
      } 
      catch (error) {
        console.error("Error filtering venues:", error);
      }
    }

    navigate("/venues", { state: { filters } });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        guestDropdownRef.current &&
        !guestDropdownRef.current.contains(event.target)
      ) {
        setShowGuestDropdown(false);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); 

  const VenueTypeSkeleton = () => (
    <div className={`${styles.venueType} ${styles.skeleton}`}>
      <div className={styles.skeletonImage}></div>
      <div className={styles.skeletonText}></div>
    </div>
  );

  const [showWarning, setShowWarning] = useState(false);

  const checkConditionsForSearch = () => {
    const totalGuests = parseInt(filters.adults) + parseInt(filters.disabled);
    if (totalGuests < 1 || !filters.startDate) {
      setShowWarning(true);
    } 
    
    else {
      setShowWarning(false);
      applyFilters();
    }
  };

  useEffect(() => {
    const update = () => setIsUserLoggedIn(isLoggedIn());

    window.addEventListener("authchange", update);
    window.addEventListener("storage", (e) => {
      if (e.key === "accessToken") update();
    });

    update();

    return () => {
      window.removeEventListener("authchange", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const username = localStorage.getItem("username");

  return (
    <>
<motion.div
  className={styles.pageContent}
  initial="initial"
  animate="animate"
  exit="exit"
  variants={pageVariants}
  transition={{ duration: 0.5, ease: "easeInOut" }}
>
      <section className={styles.firstSection}>
        <div className={styles.heroSection}>
        <BannerSlideshow />
        <div className={styles.bannerFilters}>
          <img src={Edge} className={styles.edgeLeft} alt="" />
          <div className={styles.filterContent}>
            <div className={styles.allFilters}>
              <div className={styles.filtersLeft}>
                <div className={styles.filterDestination}>
                  <i className="fa-solid fa-location-dot"></i>
                  <input
                    name="destination"
                    placeholder="Search destination..."
                    value={filters.destination}
                    onChange={handleInputChange}
                    autoComplete="off"
                  />
                  {filters.destination && suggestions.length > 0 && (
                    <ul className={styles.suggestionsList}>
                      {suggestions.map((suggestion, index) => (
                        <li
                          key={index}
                          onClick={() => {
                            if (suggestion !== "No matching results...") {
                              setFilters(prev => ({ ...prev, destination: suggestion }));
                              setSuggestions([]);
                            }
                          }}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className={styles.filterCalender}>
        <i
          className="fa-solid fa-calendar-days"
          onClick={() => toggleCalendar('start')}
        ></i>
        <input
          className={styles.startDateFilter}
          type="text"
          value={checkInDate}
          placeholder="Start Date"
          onClick={() => toggleCalendar('start')}
          readOnly
        />

        <i
          className="fa-solid fa-calendar-days"
          onClick={() => toggleCalendar('end')}
        ></i>
        <input
          className={styles.endDateFilter}
          type="text"
          value={checkOutDate}
          placeholder="End Date"
          onClick={() => toggleCalendar('end')}
          readOnly
        />
        <div className={styles.costumCalenderPosition}>
        {showCalendar && (
  <CustomCalender
    key={selectedDateType + checkInDate + checkOutDate}
    value={selectedDateType === 'start' ? checkInDate : checkOutDate}
    onDateChange={handleDateChange}
  />
)}
        </div>
      </div>
              </div>
              <div className={styles.filterPeople}>
                <i className="fa-solid fa-person"></i>
                <div
  className={styles.guestSelector}
  onClick={() => setShowGuestDropdown(prev => !prev)}
  ref={guestDropdownRef}
>
                  <p>{renderGuestInfo()}</p>
                  <div className={`${styles.dropdownMenu} ${showGuestDropdown ? styles.open : ""}`}>
                    {["adults", "children", "disabled"].map((type) => (
                      <div key={type} className={styles.dropdownRow}>
                        <span className={styles.label}>
                        {type === "adults" ? "Adults" : type === "children" ? "Children" : "Assisted Guests"}
                        </span>
                        <div className={styles.counterControls}>
                          {filters[type] > 0 && (
                            <button onClick={(e) => {
                              e.stopPropagation();
                              setFilters(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 1) }));
                            }}>-</button>
                          )}
                          <span>{filters[type]}</span>
                          <button onClick={(e) => {
                            e.stopPropagation();
                            setFilters(prev => ({ ...prev, [type]: prev[type] + 1 }));
                          }}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Buttons size='small' version='v1'onClick={checkConditionsForSearch}>
                Search
              </Buttons>

            </div>
            {showWarning && (
        <div className={styles.warningPopup}>
          <div className={styles.popupContent}>
            <h2>Warning</h2>
            <p>Please enter at least one adult or assisted guest, and select a start date to use the filter.</p>
            <button onClick={() => setShowWarning(false)} className={styles.closeWarningPopup}>X</button>
          </div>
        </div>
      )}
          </div>
          <img src={Edge} className={styles.edgeRight} alt="" />
        </div>
        </div>
      </section>
      {showScrollIcon && (
        <div className={styles.scrollIcon}>
          <i className={`fa-solid fa-chevron-down ${styles.bounceIcon}`}></i>
          <i className={`fa-solid fa-chevron-down ${styles.bounceIcon} ${styles.delay}`}></i>
        </div>
      )}
      <section className={styles.secondSection}>
        <div className={styles.secondBorder}>
          <div className={styles.typeTitle}>
            <h2>Choose your perfect Stay</h2>
            <p>“A journey of a thousand miles begins<br />with a single step.”</p>
          </div>

          <div className={styles.typeContent}>
            {venues.length === 0 ? (
              <>
                <VenueTypeSkeleton />
                <VenueTypeSkeleton />
                <VenueTypeSkeleton />
                <VenueTypeSkeleton />
              </>
            ) : (
              <>
                {[
                  { image: breakfastImage, label: "Breakfast Included", meta: { breakfast: true } },
                  { image: parkingImage, label: "Free Parking", meta: { parking: true } },
                  { image: wifiImage, label: "Excellent WiFi", meta: { wifi: true } },
                  { image: animalImage, label: "Animal Friendly", meta: { pets: true } },
                ].map((type, idx) => (
                  <div
                    key={idx}
                    className={styles.hotelType}
                    onClick={() => navigate("/hotels", { state: { filters: { meta: type.meta } } })}
                  >
                    <img src={type.image} alt={type.label} />
                    <h3>{type.label}</h3>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </section>
      <section className={styles.thirdSection}>
        <div className={styles.thirdBorder}>

        {isUserLoggedIn ? (
        <>
<div className={styles.thirdContentLogin}>
            <img src={registerImage} alt="Reception" />
            <div className={styles.thirdInfo}>
<h2>Welcome back <span>{username}</span>,</h2>
              <h3>What would you like to do today?</h3>
              <div className={styles.thirdInfoLinks}>
              <Link>Upcoming Bookings</Link>
              <Link>Check out Venues</Link>
              <Link>See my Profile</Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className={styles.thirdContentRegister}>
            <img src={registerImage} alt="Reception" />
            <div className={styles.thirdInfo}>
              <h2>Join Us and Start Your<br />Next Adventure today...</h2>
              <p>Unlock Booking, Reservations and Discounts by Creating an Account with us today.</p>
              <Link to="/register-costumer" className={styles.registerButton}>
              <Buttons size='large' version='v1'>
                Register
              </Buttons>
              </Link>
            </div>
          </div>
        </>
      )}

        </div>
      </section>
      <section className={styles.fourthSection}>
        <div className={styles.fourthBorder}>
          <div className={styles.fourthContent}>
            <div className={styles.fourthTitle}>
              <h2>Explore Our Most Popular Hotels<br />for Every Traveler</h2>
              <Link to="/venues" className={styles.browseAllLink}>Browse All</Link>
            </div>

            <div className={styles.popularHotels}>
              {venues.map((venue) => (
                <VenueCardFirstType key={venue.id} venue={venue} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </motion.div>
    </>
  );
};

export default Home;
