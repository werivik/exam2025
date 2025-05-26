import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from "framer-motion";
import debounce from 'lodash.debounce';
import styles from './Home.module.css';
import { isLoggedIn } from "../../auth/auth";
import Buttons from '../../components/Buttons/Buttons';

import Edge from "../../../public/media/images/beige-edge.png";
import registerImage from "../../../public/media/hotelTypes/hotelReseption.jpeg";
import animalImage from "../../../public/media/metaImages/animal-min.jpeg";
import breakfastImage from "../../../public/media/metaImages/breakfast-min.jpg";
import parkingImage from "../../../public/media/metaImages/parking-min.jpeg";
import wifiImage from "../../../public/media/metaImages/wifi-min.jpeg";

import { VENUES } from '../../constants';
import { headers } from '../../headers';
import VenueCardFirstType from '../../components/PopularCard/PopularCard';
import PopularCard from '../../components/PopularCard/PopularCard';
import CustomCalender from '../../components/CostumCalender/CostumCalender';
import BannerSlideshow from '../../components/BannerSlideshow/BannerSlideshow';

import paris from '../../../public/media/images/parisDestination-min.jpeg';
import greece from '../../../public/media/images/greeceDestination-min.jpeg';
import japan from '../../../public/media/images/tokyoDestination-min.jpeg';
import america from '../../../public/media/images/yorkDestination-min.jpeg';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};
const FEATURE_TYPES = [
  { image: breakfastImage, label: "Breakfast Included", meta: { breakfast: true } },
  { image: parkingImage, label: "Free Parking", meta: { parking: true } },
  { image: wifiImage, label: "Excellent WiFi", meta: { wifi: true } },
  { image: animalImage, label: "Animal Friendly", meta: { pets: true } },
];
const FeatureTypeSkeleton = () => (
  <div className={styles.featureTypeSkeleton}>
    <div className={styles.featureSkeletonImage}></div>
    <div className={styles.featureSkeletonText}></div>
  </div>
);
const POPULAR_DESTINATIONS = [
  {
    id: 1,
    name: "Paris",
    country: "France",
    description: "City of Lights",
    image: paris,
  },
  {
    id: 2,
    name: "Santorini",
    country: "Greece",
    description: "Breathtaking Island Views",
    image: greece,
  },
  {
    id: 3,
    name: "Tokyo",
    country: "Japan",
    description: "Mix of Tradition & Innovation",
    image: japan,
  },
  {
    id: 4,
    name: "New York",
    country: "USA",
    description: "The City That Never Sleeps",
    image: america,
  }
];
const normalizeString = (str) => {
  return str
    ?.toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || '';
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

const Home = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");
  
  const [venues, setVenues] = useState([]);
  const [allVenues, setAllVenues] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showScrollIcon, setShowScrollIcon] = useState(true);
  const [showGuestDropdown, setShowGuestDropdown] = useState(false);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarInitiatedFrom, setCalendarInitiatedFrom] = useState(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(isLoggedIn());
  const [displayedVenues, setDisplayedVenues] = useState([]);
  
  const guestDropdownRefOne = useRef(null);
  const guestDropdownRefTwo = useRef(null);
  const calendarRef = useRef(null);
  const dateFilterRef = useRef(null);
  
  const [filters, setFilters] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    adults: 1,
    children: 0,
    disabled: 0,
  });
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        let allVenuesData = [];
        let currentPage = 1;
        const pageSize = 100;

        while (true) {
          const response = await fetch(`${VENUES}?page=${currentPage}&pageSize=${pageSize}`, {
            method: 'GET',
            headers: headers(),
          });

          if (!response.ok) throw new Error("Failed to fetch venues");

          const data = await response.json();
          const venuesData = data.data || [];

          if (venuesData.length === 0) break;

          allVenuesData = allVenuesData.concat(venuesData);
          currentPage++;
        }

        setAllVenues(allVenuesData);

        const getTopRatedVenues = (venuesArray) =>
          (venuesArray || [])
            .filter(venue => typeof venue.rating === "number")
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);

        setVenues(getTopRatedVenues(allVenuesData));

const locationsSet = new Set();
const citiesSet = new Set();
const countriesSet = new Set();
const continentsSet = new Set();

(allVenuesData || []).forEach(venue => {
  const location = venue.location;
  if (location) {
    if (location.city) citiesSet.add(location.city);
    if (location.country) countriesSet.add(location.country);
    if (location.continent) continentsSet.add(location.continent);
    
    if (location.city && location.country) {
      locationsSet.add(`${location.city}, ${location.country}`);
    }
    
    if (location.city) locationsSet.add(location.city);
    if (location.country) locationsSet.add(location.country);
    if (location.continent) locationsSet.add(location.continent);
  }
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
  useEffect(() => {
  const handleClickOutside = (event) => {
    if (showGuestDropdown) {
      const currentDropdownRef = window.innerWidth > 1375 ? guestDropdownRefOne : guestDropdownRefTwo;
      if (currentDropdownRef.current && !currentDropdownRef.current.contains(event.target)) {
        setShowGuestDropdown(false);
      }
    }
    if (
      showCalendar &&
      calendarRef.current &&
      !calendarRef.current.contains(event.target) &&
      dateFilterRef.current &&
      !dateFilterRef.current.contains(event.target)
    ) {
      setShowCalendar(false);
      setCalendarInitiatedFrom(null);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  const handleScroll = () => {
    if (showCalendar) {
      setShowCalendar(false);
      setCalendarInitiatedFrom(null);
    }
    if (showGuestDropdown) {
      setShowGuestDropdown(false);
    }
  };
  window.addEventListener("scroll", handleScroll);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
    window.removeEventListener("scroll", handleScroll);
  };
  }, [showCalendar, showGuestDropdown]);
  const updateDisplayedVenues = useCallback(() => {
    const width = window.innerWidth;
    let limit = 5;

    if (width <= 690) {
      limit = 5;
    } 
    else if (width <= 1093) {
      limit = 3;
    } 
    else if (width <= 1375) {
      limit = 4;
    }

    setDisplayedVenues(venues.slice(0, limit));
  }, [venues]);
  useEffect(() => {
    updateDisplayedVenues();

    window.addEventListener("resize", updateDisplayedVenues);
    return () => window.removeEventListener("resize", updateDisplayedVenues);
  }, [venues, updateDisplayedVenues]);
  const handleDestinationSuggestions = useCallback(
  debounce(async (input) => {
    if (!input) return setSuggestions([]);
    const searchTerm = input.toLowerCase();
    
    try {
      const searchResponse = await fetch(`${VENUES}/search?q=${encodeURIComponent(input)}`, {
        method: 'GET',
        headers: headers(),
      });
      
      let apiMatches = [];
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        apiMatches = (searchData.data || []).map(venue => venue.name).filter(Boolean);
      }
      
      const locationMatches = allLocations.filter((loc) =>
        loc.toLowerCase().includes(searchTerm)
      );
      
      const venueMatches = allVenues
        .filter(venue => {
          if (venue.name?.toLowerCase().includes(searchTerm)) return true;
          
          const location = venue.location;
          if (!location) return false;
          
          const cityMatch = location.city?.toLowerCase().includes(searchTerm);
          const countryMatch = location.country?.toLowerCase().includes(searchTerm);
          const continentMatch = location.continent?.toLowerCase().includes(searchTerm);
          const addressMatch = location.address?.toLowerCase().includes(searchTerm);
          
          return cityMatch || countryMatch || continentMatch || addressMatch;
        })
        .map(venue => {
          if (venue.name?.toLowerCase().includes(searchTerm)) {
            return venue.name;
          }
          const location = venue.location;
          if (location?.city && location?.country) {
            return `${location.city}, ${location.country}`;
          }
          return location?.city || location?.country || location?.continent || venue.name;
        })
        .filter(Boolean);      
      const allMatches = [...new Set([...apiMatches, ...locationMatches, ...venueMatches])];
      setSuggestions(allMatches.length ? allMatches.slice(0, 10) : ["No matching results..."]);
    } 
    catch (error) {
      console.error("Error fetching search suggestions:", error);
      const locationMatches = allLocations.filter((loc) =>
        loc.toLowerCase().includes(searchTerm)
      );
      const venueMatches = allVenues
        .filter(venue => 
          venue.name?.toLowerCase().includes(searchTerm) ||
          venue.location?.city?.toLowerCase().includes(searchTerm) ||
          venue.location?.country?.toLowerCase().includes(searchTerm) ||
          venue.location?.continent?.toLowerCase().includes(searchTerm)
        )
        .map(venue => {
          if (venue.name?.toLowerCase().includes(searchTerm)) {
            return venue.name;
          } 
          else if (venue.location?.city && venue.location?.country) {
            return `${venue.location.city}, ${venue.location.country}`;
          }
          return venue.location?.city || venue.location?.country || venue.location?.continent || venue.name;
        })
        .filter(Boolean);
      
      const allMatches = [...new Set([...locationMatches, ...venueMatches])];
      setSuggestions(allMatches.length ? allMatches.slice(0, 10) : ["No matching results..."]);
    }
  }, 300),
  [allLocations, allVenues]
  );
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    if (name === "destination") handleDestinationSuggestions(value);
  };
  const [searchInput, setSearchInput] = useState({
  continent: '',
  country: '',
  city: ''
  });
  const handleSearchInputChange = (e) => {
  const { name, value } = e.target;
  setSearchInput(prev => ({ ...prev, [name]: value }));
  };
  const handleSearch = () => {
  setFilters(prevFilters => ({
    ...prevFilters,
    continent: searchInput.continent,
    country: searchInput.country,
    city: searchInput.city
  }));
  };
  const handleGuestsChange = (type, increment) => {
    const newValue = Math.max(0, filters[type] + increment);
    
    if (type === "adults" && newValue === 0 && filters.children > 0 && filters.disabled === 0) {
      alert("At least one adult or Assisted guest must be present if there are children.");
      return;
    }
    
    if (type === "disabled" && newValue === 0 && filters.children > 0 && filters.adults === 0) {
      alert("At least one adult or Assisted guest must be present if there are children.");
      return;
    }
    
    if (type === "children" && newValue > 0 && filters.adults === 0 && filters.disabled === 0) {
      alert("At least one adult or Assisted guest must be present if there are children.");
      return;
    }
    
    setFilters(prev => ({ ...prev, [type]: newValue }));
  };
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
  const handleDateChange = useCallback((newDate) => {
    if (calendarInitiatedFrom === 'start' || (!checkInDate && calendarInitiatedFrom === 'start')) {
      setCheckInDate(newDate);
      setFilters(prev => ({ ...prev, startDate: newDate }));

      if (checkOutDate && new Date(newDate) >= new Date(checkOutDate)) {
        setCheckOutDate("");
        setFilters(prev => ({ ...prev, endDate: "" }));
      }
      
      if (!checkOutDate || new Date(newDate) >= new Date(checkOutDate)) {
        setCalendarInitiatedFrom('end');
      }
    } 
    else if (calendarInitiatedFrom === 'end') {
      if (checkInDate && new Date(newDate) < new Date(checkInDate)) {
        alert("End date cannot be before start date.");
        return;
      }

      setCheckOutDate(newDate);
      setFilters(prev => ({ ...prev, endDate: newDate }));
      
      setShowCalendar(false);
      setCalendarInitiatedFrom(null);
    }
  }, [calendarInitiatedFrom, checkInDate, checkOutDate]);
  const handleCalendarComplete = useCallback(() => {
    setShowCalendar(false);
    setCalendarInitiatedFrom(null);
  }, []);
  const renderGuestInfo = () => {
    const parts = [];
    
    if (filters.adults > 0) {
      parts.push(`${filters.adults} Adult${filters.adults !== 1 ? "s" : ""}`);
    }
    
    if (filters.children > 0) {
      parts.push(`${filters.children} Child${filters.children !== 1 ? "ren" : ""}`);
    }
    
    if (filters.disabled > 0) {
      parts.push(`${filters.disabled} Assisted${filters.disabled !== 1 ? " Guests" : " Guest"}`);
    }
    
    return parts.join(", ");
  };
  const handleDestinationClick = (destination) => {
  const navigationState = {
    filters: {
      country: destination.country,
      city: destination.name,
      adults: filters.adults,
      children: filters.children,
      assisted: filters.disabled,
      startDate: filters.startDate,
      endDate: filters.endDate,
    }
  };

  const queryParams = new URLSearchParams({
    country: destination.country,
    city: destination.name,
    adults: filters.adults.toString(),
    page: "1",
  });

  navigate(`/venues?${queryParams.toString()}`, { state: navigationState });
  };
  const handleMetaFilterClick = (metaFilter) => {
    const navigationState = {
      filters: {
        meta: metaFilter,
        adults: filters.adults,
        children: filters.children,
        assisted: filters.disabled,
        startDate: filters.startDate,
        endDate: filters.endDate,
      }
    };
    
    navigate("/venues", { state: navigationState });
  };
  const applyFilters = () => {
  if (filters.children > 0 && filters.adults === 0 && filters.disabled === 0) {
    alert("At least one adult or Assisted guest must be present if there are children.");
    return;
  }
  
  const appliedFilters = {};
  
  if (filters.destination) {
    const matchingVenue = allVenues.find(venue => 
      venue.name?.toLowerCase() === filters.destination.toLowerCase()
    );
    
    if (matchingVenue) {
      appliedFilters.city = matchingVenue.location?.city;
      appliedFilters.country = matchingVenue.location?.country;
      appliedFilters.continent = matchingVenue.location?.continent;
      appliedFilters.venueName = matchingVenue.name;
    } 
    else {
      const destinationParts = filters.destination.split(',').map(part => part.trim());      
      if (destinationParts.length === 2) {
        appliedFilters.city = destinationParts[0];
        appliedFilters.country = destinationParts[1];
      } 
      else if (destinationParts.length === 1) {
        const searchTerm = destinationParts[0].toLowerCase();
        const matchingByLocation = allVenues.find(venue => {
          const location = venue.location;
          if (!location) return false;
          
          return location.city?.toLowerCase() === searchTerm ||
                 location.country?.toLowerCase() === searchTerm ||
                 location.continent?.toLowerCase() === searchTerm;
        });
        
        if (matchingByLocation) {
          const location = matchingByLocation.location;
          if (location.city?.toLowerCase() === searchTerm) {
            appliedFilters.city = location.city;
            appliedFilters.country = location.country;
          } 
          else if (location.country?.toLowerCase() === searchTerm) {
            appliedFilters.country = location.country;
          } 
          else if (location.continent?.toLowerCase() === searchTerm) {
            appliedFilters.continent = location.continent;
          }
        } 
        else {
          appliedFilters.destination = filters.destination;
        }
      } else {
        appliedFilters.destination = filters.destination;
      }
    }
  }
  
  if (filters.startDate) appliedFilters.startDate = filters.startDate;
  if (filters.endDate) appliedFilters.endDate = filters.endDate;
  
  appliedFilters.adults = filters.adults;
  appliedFilters.children = filters.children;
  appliedFilters.assisted = filters.disabled;
  
  navigate("/venues", { state: { filters: appliedFilters } });
  };
  const VenueTypeSkeleton = () => (
    <div className={`${styles.venueType} ${styles.skeleton}`}>
      <div className={styles.skeletonImage}></div>
      <div className={styles.skeletonText}></div>
    </div>
  );
  const DestinationFilter = () => (
    <div className={styles.filterDestination}>
      <i className="fa-solid fa-location-dot"></i>
      <input
        name="destination"
        placeholder="Search destination or venue..."
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
  );
  const DateFilter = () => (
    <div className={styles.filterCalender} ref={dateFilterRef}>
      <i
        className="fa-solid fa-calendar-days"
        onClick={(e) => {
          e.stopPropagation();
          toggleCalendar('start');
        }}
      ></i>
      <input
        className={styles.startDateFilter}
        type="text"
        value={formatDateWithOrdinal(checkInDate)}
        placeholder="Start Date"
        onClick={(e) => {
          e.stopPropagation();
          toggleCalendar('start');
        }}
        readOnly
      />

      <i
        className="fa-solid fa-calendar-days"
        onClick={(e) => {
          e.stopPropagation();
          toggleCalendar('end');
        }}
      ></i>
      <input
        className={styles.endDateFilter}
        type="text"
        value={formatDateWithOrdinal(checkOutDate)}
        placeholder="End Date"
        onClick={(e) => {
          e.stopPropagation();
          toggleCalendar('end');
        }}
        readOnly
      />
      <div className={styles.costumCalenderPosition}>
        {showCalendar && (
          <div ref={calendarRef}>
            <CustomCalender
              value={calendarInitiatedFrom === 'start' ? checkInDate : checkOutDate}
              onDateChange={handleDateChange}
              startDate={checkInDate}
              endDate={checkOutDate}
              isSelectingEnd={calendarInitiatedFrom === 'end'}
              onSelectionComplete={handleCalendarComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
  const GuestFilter = ({ refProp }) => (
    <div className={styles.filterPeople}>
      <i className="fa-solid fa-person"></i>
      <div className={styles.guestSelector} ref={refProp}>
        <p onClick={() => setShowGuestDropdown(prev => !prev)}>
          {renderGuestInfo()}
        </p>
        {showGuestDropdown && (
          <div className={`${styles.dropdownMenu} ${styles.open}`}>
            {["adults", "children", "disabled"].map((type) => (
              <div key={type} className={styles.dropdownRow}>
                <span className={styles.label}>
                  {type === "adults"
                    ? "Adults"
                    : type === "children"
                    ? "Children"
                    : "Assisted Guests"}
                </span>
                <div className={styles.counterControls}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGuestsChange(type, -1);
                    }}
                    disabled={filters[type] === 0}
                  >
                    -
                  </button>
                  <span>{filters[type]}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGuestsChange(type, 1);
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
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
                {window.innerWidth > 1375 ? (
                  <div className={styles.filterContent}>
                    <div className={styles.allFilters}>
                      <div className={styles.filtersLeft}>
                        <DestinationFilter />
                        <DateFilter />
                      </div>
                      <GuestFilter refProp={guestDropdownRefOne} />
                        <div className={styles.searchButtonFirst}>
                          <Buttons size='small' version='v1' onClick={applyFilters}>Search</Buttons>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.filterContentSecond}>
                      <div className={styles.allFilters}>
                        <div className={styles.filtersColumns}>
                          <DestinationFilter />
                          <DateFilter />
                          <div className={styles.filtersColumnsBottom}>
                            <GuestFilter refProp={guestDropdownRefTwo} />
                            <div className={styles.searchButtonSecond}>
                              <Buttons size='small' version='v1' onClick={applyFilters}>Search</Buttons>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
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
            
            <div className={styles.metaTitle}>
              <h2>Choose your perfect Stay</h2>
              <p>"A journey of a thousand miles begins<br />with a single step."</p>
            </div>

            <div className={styles.scrollSideIcon}>
              <i className={`fa-solid fa-chevron-down ${styles.bounceIcon}`}></i>
            </div>

            <div className={styles.metaContent}>
              {venues.length === 0 ? (
                <>
                  <FeatureTypeSkeleton />
                  <FeatureTypeSkeleton />
                  <FeatureTypeSkeleton />
                  <FeatureTypeSkeleton />
                </>
              ) : (
                <>
                  {FEATURE_TYPES.map((type, idx) => (
                    <div
                      key={idx}
                      className={styles.metaType}
                      onClick={() => handleMetaFilterClick(type.meta)}
                      style={{ cursor: 'pointer' }}
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
                      <Link to="costumer-profile">Upcoming Bookings</Link>
                      <Link to="/venues">Check out Venues</Link>
                      <Link to="/costumer-profile">See my Profile</Link>
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
                    <Buttons size='large' version='v2'>
                      Register
                    </Buttons>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>        
        <section className={styles.fourthSection}>
          <div className={styles.fourthBorder}>
            <div className={styles.DestinationContent}>
              <div className={styles.DestinationTitle}>
                <h2>Discover Our Most Loved Destinations</h2>
                <p>"The world is a book and those who do not travel read only one page."</p>
              </div>
              <div className={styles.destinationsWrapper}>
                <div className={styles.destinationsContainer}>
                  {POPULAR_DESTINATIONS.map((destination) => (
                    <div 
                      key={destination.id} 
                      className={styles.destinationCard}
                      onClick={() => handleDestinationClick(destination)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className={styles.destinationImageContainer}>
                        <img src={destination.image} alt={destination.name} />
                        <div className={styles.destinationOverlay}></div>
                      </div>
                      <div className={styles.destinationInfo}>
                        <h3>{destination.name}, <span>{destination.country}</span></h3>
                        <p>{destination.description}</p>
                        <div className={styles.exploreButton}>
                          <span>Explore</span>
                          <i className="fa-solid fa-arrow-right"></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className={styles.fifthSection}>
          <div className={styles.fifthBorder}>
            <div className={styles.venuesContent}>
              <div className={styles.venuesTitle}>
                <h2>Explore Our Most Popular Hotels<br />for Every Traveler</h2>
                <Link to="/venues" className={styles.browseAllLink}>Browse All</Link>
              </div>
              <div className={styles.popularHotels}>
                {venues.length === 0 ? (
                  Array.from({ length: window.innerWidth <= 690 ? 5 : window.innerWidth <= 1093 ? 3 : window.innerWidth <= 1375 ? 4 : 5 }).map((_, index) => (
                    <PopularCard key={index} venue={null} />
                  ))
                ) : (
                  displayedVenues.map((venue) => (
                    <PopularCard key={venue.id} venue={venue} />
                  ))
                )}
              </div>
              <Link to="/venues" className={styles.browseAllLinkSecond}>Browse All</Link>
            </div>
          </div>
        </section>
      </motion.div>
    </>
  );
};

export default Home;