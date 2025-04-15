import { Link } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import debounce from 'lodash.debounce';
import styles from './Home.module.css';

import slideshowNext from "/media/icons/slideshow-next-button.png";
import slideshowPrev from "/media/icons/slideshow-next-button.png";

import homeBanner from "/media/images/banner2.png";
import Edge from "/media/images/beige-edge.png";

import fullStar from "/media/rating/star-solid.svg";
import emptyStar from "/media/rating/star-regular.svg";
import halfStar from "/media/rating/star-half-stroke-solid.svg";

import registerImage from "/media/hotelTypes/hotelReseption.jpeg";

import animalImage from "/media/metaImages/animal.jpeg";
import breakfastImage from "/media/metaImages/breakfast.jpeg";
import parkingImage from "/media/metaImages/parking.jpeg";
import wifiImage from "/media/metaImages/wifi.jpeg";

import { VENUES } from '../../constants';
import { headers } from '../../headers';

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showScrollIcon, setShowScrollIcon] = useState(true);
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
    const fetchHotels = async () => {
      try {
        const response = await fetch(VENUES, {
          method: "GET",
          headers: headers(),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch hotels");
        }

        const result = await response.json();

        const getTopRatedHotels = (hotelsArray) => {
          return (hotelsArray || [])
            .filter(hotel => typeof hotel.rating === "number")
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 5);
        };

        const limitedHotels = getTopRatedHotels(result.data);
        setHotels(limitedHotels);

        const locationsSet = new Set();

        (result.data || []).forEach(hotel => {
          const city = hotel.location?.city;
          const country = hotel.location?.country;

          if (city && country) {
            locationsSet.add(`${city}, ${country}`);
          }
        });

        setAllLocations(Array.from(locationsSet));
      } 
      
      catch (error) {
        console.error("Error fetching hotels:", error);
      }
    };

    fetchHotels();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setShowScrollIcon(true);
      } 
      
      else {
        setShowScrollIcon(false);
      }
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
    setFilters((prev) => ({ ...prev, [name]: value }));

    if (name === "destination") {
      handleDestinationSuggestions(value);
    }
  };

  const navigate = useNavigate();
    
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.4 && rating % 1 <= 0.6;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    for (let i = 0; i < fullStars; i++) {
      stars.push(<img key={`full-${i}`} src={fullStar} alt="Full Star" />);
    }

    if (hasHalfStar) {
      stars.push(<img key="half" src={halfStar} alt="Half Star" />);
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push(<img key={`empty-${i}`} src={emptyStar} alt="Empty Star" />);
    }

    return stars;
  };

  const handleGuestsChange = (e) => {
    const { name, value } = e.target;
    if (name === "children" && value > 0 && (filters.adults === 0 && filters.disabled === 0)) {
      alert("At least one adult or disabled guest must be present if there are children.");
      return;
    }
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const renderGuestInfo = () => {
    let guestInfo = `${filters.adults} Adult${filters.adults !== 1 ? "s" : ""}`;
    if (filters.children > 0) {
      guestInfo += `, ${filters.children} Child${filters.children !== 1 ? "ren" : ""}`;
    }
    if (filters.disabled > 0) {
      guestInfo += `, ${filters.disabled} Disabled${filters.disabled !== 1 ? "s" : ""}`;
    }
    return guestInfo;
  };

  const applyFilters = async () => {
    const totalGuests =
      parseInt(filters.adults) + parseInt(filters.disabled);
  
    if (totalGuests < 1) {
      alert("Please enter at least one adult or assisted guest.");
      return;
    }
  
    if (!filters.startDate) {
      alert("Please select a start date.");
      return;
    }
  
    if (filters.destination.trim()) {
      try {
        let query = `${VENUES}/search`;
        const params = new URLSearchParams();
  
        params.append("q", filters.destination.trim());
  
        if (filters.startDate) {
          params.append("startDate", filters.startDate);
        }
  
        if (filters.endDate) {
          params.append("endDate", filters.endDate);
        }
  
        query += `?${params.toString()}`;
  
        const response = await fetch(query, {
          method: "GET",
          headers: headers(),
        });
  
        if (!response.ok) throw new Error("Failed to fetch filtered results");
  
        const result = await response.json();
  
        const filtered = result.data.filter((venue) => {
          const matchesGuests =
            venue.maxGuests >=
            parseInt(filters.adults) +
            parseInt(filters.children) +
            parseInt(filters.disabled);
          return matchesGuests;
        });
  
        setHotels(filtered);
  
      } 
      
      catch (error) {
        console.error("Error filtering venues:", error);
      }
    }
  
    navigate("/hotels", { state: { filters } });
  };
  
  return (
    <div className={styles.home}>
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
                              setFilters((prev) => ({
                                ...prev,
                                destination: suggestion,
                              }));
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
                    placeholder="Select Start Date"
                    className={styles.startDateFilter}
                  />
                  <input
                    id="end-date"
                    name="endDate"
                    type="date"
                    value={filters.endDate}
                    onChange={handleInputChange}
                    placeholder="Select End Date"
                    className={styles.endDateFilter}
                  />
                </div>
              </div>
              <div className={styles.filterPeople}>
  <i className="fa-solid fa-person"></i>
  <div className={styles.guestsInputs}>
    <label className={styles.filterPeopleAdults}>
      Adults
      <input
        name="adults"
        type="number"
        min="1"
        value={filters.adults}
        onChange={handleGuestsChange}
      />
    </label>
    <label>
      Children
      <input
        name="children"
        type="number"
        min="0"
        value={filters.children}
        onChange={handleGuestsChange}
      />
    </label>
    <label>
      Assisted Guests
      <input
        name="disabled"
        type="number"
        min="0"
        value={filters.disabled}
        onChange={handleGuestsChange}
      />
    </label>
    {(filters.children > 0 || filters.disabled > 0) && (
      <p>{renderGuestInfo()}</p>
    )}
  </div>
</div>
            </div>
            <button
  className={styles.filterSearch}
  onClick={applyFilters}
  disabled={
    (parseInt(filters.adults) + parseInt(filters.disabled) < 1) ||
    !filters.startDate
  }
>
  Search
</button>
          </div>
          <img src={Edge} className={styles.edgeRight} alt="" />
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
          <div
  className={styles.hotelType}
  onClick={() =>
    navigate("/hotels", {
      state: {
        filters: {
          meta: {
            breakfast: true,
          },
        },
      },
    })
  }
>
  <img src={breakfastImage} alt="Breakfast" />
  <h3>Breakfast Included</h3>
</div>

<div
  className={styles.hotelType}
  onClick={() =>
    navigate("/hotels", {
      state: {
        filters: {
          meta: {
            parking: true,
          },
        },
      },
    })
  }
>
  <img src={parkingImage} alt="Free Parking" />
  <h3>Free Parking</h3>
</div>

<div
  className={styles.hotelType}
  onClick={() =>
    navigate("/hotels", {
      state: {
        filters: {
          meta: {
            wifi: true,
          },
        },
      },
    })
  }
>
  <img src={wifiImage} alt="Excellent WiFi" />
  <h3>Excellent WiFi</h3>
</div>

<div
  className={styles.hotelType}
  onClick={() =>
    navigate("/hotels", {
      state: {
        filters: {
          meta: {
            pets: true,
          },
        },
      },
    })
  }
>
  <img src={animalImage} alt="Animal Friendly" />
  <h3>Animal Friendly</h3>
</div>
          </div>
        </div>
      </section>
  
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
              <h2>Welcome back Username, <br></br>What would you like to do today?</h2>
              <Link>My Upcoming Bookings</Link>
              <Link>Check out Venues</Link>
              <Link>Let Destiny Decide!</Link>
              <Link to="/profile-costumer" className={styles.registerButton}>My Profile</Link>
            </div>
          </div>
        </div>
      </section>
  
      <section className={styles.fourthSection}>
        <div className={styles.fourthBorder}>
          <div className={styles.fourthContent}>
            <div className={styles.fourthTitle}>
              <h2>Explore Our Most Popular Hotels<br />for Every Traveler</h2>
              <Link to="/hotels">Browse All</Link>
            </div>
            <div className={styles.popularHotels}>
              {hotels.map((hotel) => (
                <Link to={`/hotel-details/${hotel.id}`} key={hotel.id} className={styles.hotelCard}>
                  <img
                    src={hotel.media?.[0]?.url || registerImage}
                    alt={hotel.media?.[0]?.alt || hotel.name}
                  />
                  <div className={styles.hotelInfo}>
                    <h3>{hotel.name}</h3>
                    <p>
                      {hotel.location?.city || "Unknown City"},{" "}
                      {hotel.location?.country || "Unknown Country"}
                    </p>
                    <div className={styles.starRating}>
                      {renderStars(hotel.rating || 0)}
                    </div>
                    <span>See more</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );  
};

export default Home;
