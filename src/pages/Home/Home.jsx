import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import debounce from 'lodash.debounce';
import styles from './Home.module.css';

import homeBanner from "/media/images/banner2.png";
import Edge from "/media/images/beige-edge.png";
import registerImage from "/media/hotelTypes/hotelReseption.jpeg";

import animalImage from "/media/metaImages/animal.jpeg";
import breakfastImage from "/media/metaImages/breakfast.jpeg";
import parkingImage from "/media/metaImages/parking.jpeg";
import wifiImage from "/media/metaImages/wifi.jpeg";

import { VENUES } from '../../constants';
import { headers } from '../../headers';
import HotelCardFirstType from '../../components/HotelCardFirstType/HotelCardFirstType.jsx';

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showScrollIcon, setShowScrollIcon] = useState(true);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const guestDropdownRef = useRef(null);

  const [filters, setFilters] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    adults: 1,
    children: 0,
    disabled: 0,
  });

  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch hotels and extract top rated & unique locations
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch(VENUES, { method: "GET", headers: headers() });

        if (!response.ok) throw new Error("Failed to fetch hotels");

        const result = await response.json();

        const getTopRatedHotels = (hotelsArray) =>
          (hotelsArray || [])
            .filter(hotel => typeof hotel.rating === "number")
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);

        setHotels(getTopRatedHotels(result.data));

        const locationsSet = new Set();
        (result.data || []).forEach(hotel => {
          const city = hotel.location?.city;
          const country = hotel.location?.country;
          if (city && country) locationsSet.add(`${city}, ${country}`);
        });

        setAllLocations(Array.from(locationsSet));
      } catch (error) {
        console.error("Error fetching hotels:", error);
      }
    };

    fetchHotels();
  }, []);

  // Scroll icon toggle
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollIcon(window.scrollY === 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle suggestions with debounce
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

  // Handle text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    if (name === "destination") handleDestinationSuggestions(value);
  };

  // Handle guest counter change
  const handleGuestsChange = (e) => {
    const { name, value } = e.target;
    if (name === "children" && value > 0 && filters.adults === 0 && filters.disabled === 0) {
      alert("At least one adult or Assisted guest must be present if there are children.");
      return;
    }
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Guest info display
  const renderGuestInfo = () => {
    let guestInfo = `${filters.adults} Adult${filters.adults !== 1 ? "s" : ""}`;
    if (filters.children > 0) guestInfo += `, ${filters.children} Child${filters.children !== 1 ? "ren" : ""}`;
    if (filters.disabled > 0) guestInfo += `, ${filters.disabled} Disabled${filters.disabled !== 1 ? "s" : ""}`;
    return guestInfo;
  };

  // Apply filters and navigate
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

        setHotels(filtered);
      } 
      
      catch (error) {
        console.error("Error filtering venues:", error);
      }
    }

    navigate("/hotels", { state: { filters } });
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

  // Placeholder loading skeleton
  const HotelTypeSkeleton = () => (
    <div className={`${styles.hotelType} ${styles.skeleton}`}>
      <div className={styles.skeletonImage}></div>
      <div className={styles.skeletonText}></div>
    </div>
  );

  return (
    <div className={styles.pageContent}>
      {/* Banner & Filters */}
      <section className={styles.firstSection}>
        <div className={styles.homeBanner}>
          <h1>Holidaze</h1>
          <p>Elegance meets Comfort</p>
          <img src={homeBanner} alt="Home Banner" />
        </div>

        <div className={styles.bannerFilters}>
          <img src={Edge} className={styles.edgeLeft} alt="" />
          <div className={styles.filterContent}>
            <div className={styles.allFilters}>
              {/* Left filters */}
              <div className={styles.filtersLeft}>
                {/* Destination */}
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

                {/* Calendar */}
                <div className={styles.filterCalender}>
                  <i
                    className="fa-solid fa-calendar-days"
                    onClick={() => {
                      const startDateInput = document.getElementById('start-date');
                      startDateInput.focus();
                      startDateInput.click();
                    }}
                  ></i>
                  <input
                    id="start-date"
                    name="startDate"
                    type="date"
                    value={filters.startDate}
                    onChange={handleInputChange}
                    className={styles.startDateFilter}
                  />
                  <input
                    id="end-date"
                    name="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={handleInputChange}
                    className={styles.endDateFilter}
                  />
                </div>
              </div>

              {/* Guests */}
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

              {/* Search Button */}
              <button
                className={styles.filterSearch}
                onClick={applyFilters}
                disabled={
                  (parseInt(filters.adults) + parseInt(filters.disabled) < 1) || !filters.startDate
                }
              >
                Search
              </button>
            </div>
          </div>
          <img src={Edge} className={styles.edgeRight} alt="" />
        </div>
      </section>

      {/* Scroll Icon */}
      {showScrollIcon && (
        <div className={styles.scrollIcon}>
          <i className={`fa-solid fa-chevron-down ${styles.bounceIcon}`}></i>
          <i className={`fa-solid fa-chevron-down ${styles.bounceIcon} ${styles.delay}`}></i>
        </div>
      )}

      {/* Section: Choose Hotel Type */}
      <section className={styles.secondSection}>
        <div className={styles.secondBorder}>
          <div className={styles.typeTitle}>
            <h2>Choose your perfect Stay</h2>
            <p>“A journey of a thousand miles begins<br />with a single step.”</p>
          </div>

          <div className={styles.typeContent}>
            {hotels.length === 0 ? (
              <>
                <HotelTypeSkeleton />
                <HotelTypeSkeleton />
                <HotelTypeSkeleton />
                <HotelTypeSkeleton />
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

      {/* Section: Register or Logged In View */}
      <section className={styles.thirdSection}>
        <div className={styles.thirdBorder}>
          <div className={styles.thirdContentRegister}>
            <img src={registerImage} alt="Reception" />
            <div className={styles.thirdInfo}>
              <h2>Join Us and Start Your<br />Next Adventure today...</h2>
              <p>Unlock Booking, Reservations and Discounts by Creating an Account with us today.</p>
              <Link to="/register-costumer" className={styles.registerButton}>Register</Link>
            </div>
          </div>

          <div className={styles.thirdContentLogin}>
            <img src={registerImage} alt="Reception" />
            <div className={styles.thirdInfo}>
              <h2>Welcome back Username,<br />What would you like to do today?</h2>
              <Link>My Upcoming Bookings</Link>
              <Link>Check out Venues</Link>
              <Link>Let Destiny Decide!</Link>
              <Link to="/profile-costumer" className={styles.registerButton}>My Profile</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Popular Hotels */}
      <section className={styles.fourthSection}>
        <div className={styles.fourthBorder}>
          <div className={styles.fourthContent}>
            <div className={styles.fourthTitle}>
              <h2>Explore Our Most Popular Hotels<br />for Every Traveler</h2>
              <Link to="/hotels" className={styles.browseAllLink}>Browse All</Link>
            </div>

            <div className={styles.popularHotels}>
              {hotels.map((hotel) => (
                <HotelCardFirstType key={hotel.id} hotel={hotel} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
