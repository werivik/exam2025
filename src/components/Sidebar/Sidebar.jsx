import React, { useState, useEffect, useRef } from 'react';
import styles from './Sidebar.module.css';
import Buttons from '../Buttons/Buttons';

const Sidebar = ({
  showSidebar,
  toggleSidebar,
  inputValues,
  handleFilterChange,
  getSuggestions,
  handleSuggestionClickSecond,
  filters,
  minPrice,
  maxPrice,
  metaFilters,
  clearFilters,
  setShowSuggestions,
  venues,
  setFilteredVenues,
  setNoMatches,
  initialLocationFilters,
  initialMetaFilters
}) => {

  const [adults, setAdults] = useState('');
  const [children, setChildren] = useState('');
  const [assistedGuests, setAssistedGuests] = useState('');
  
  const continentRef = useRef(null);
  const countryRef = useRef(null);
  const cityRef = useRef(null);

  useEffect(() => {
    setAdults(filters.adults || '');
    setChildren(filters.children || '');
    setAssistedGuests(filters.assisted || '');
  }, [filters.adults, filters.children, filters.assisted]);

  useEffect(() => {
    if (initialLocationFilters) {
      if (initialLocationFilters.country) {
        handleFilterChange({ 
          target: { 
            name: 'country', 
            value: initialLocationFilters.country 
          } 
        });
      }
      if (initialLocationFilters.city) {
        handleFilterChange({ 
          target: { 
            name: 'city', 
            value: initialLocationFilters.city 
          } 
        });
      }
    }
  }, [initialLocationFilters, handleFilterChange]);

  useEffect(() => {
    if (initialMetaFilters) {
      Object.entries(initialMetaFilters).forEach(([key, value]) => {
        if (value) {
          handleFilterChange({
            target: {
              name: key,
              checked: true,
              type: 'checkbox'
            }
          });
        }
      });
    }
  }, [initialMetaFilters, handleFilterChange]);

const handleClickOutside = (event) => {
  const refs = {
    continent: continentRef,
    country: countryRef,
    city: cityRef,
  };

  Object.entries(refs).forEach(([locationType, ref]) => {
    const suggestionList = ref.current?.querySelector(`.${styles.suggestionList}`);
    if (ref.current && !ref.current.contains(event.target) && !suggestionList?.contains(event.target)) {
      setShowSuggestions((prev) => ({
        ...prev,
        [locationType]: false,
      }));
    }
  });
};

  const handleGuestChange = (e, type) => {
    const rawValue = e.target.value;
    const value = rawValue === '' ? '' : Math.max(0, parseInt(rawValue));
  
    if (type === 'adults') {
      setAdults(value);
      handleFilterChange({ target: { name: 'adults', value: value } });
    }
    else if (type === 'children') {
      setChildren(value);
      handleFilterChange({ target: { name: 'children', value: value } });
    }
    else if (type === 'assistedGuests') {
      setAssistedGuests(value);
      handleFilterChange({ target: { name: 'assisted', value: value } });
    }
  };  
  const calculateTotalGuests = () => {
    return (
      parseInt(adults || 0) +
      parseInt(children || 0) +
      parseInt(assistedGuests || 0)
    );
  };
  const filterVenuesByGuests = () => {
    const totalGuests = calculateTotalGuests();  
    if (Array.isArray(venues)) {
      const filtered = venues.filter(venue => {
        return venue.maxGuests >= totalGuests;
      });
      setFilteredVenues(filtered);
      setNoMatches(filtered.length === 0);
    } 
    else {
      console.error("Venues data is not available or not an array.");
    }
  };

  const filterVenuesByPrice = () => {
    const selectedPrice = filters.price || minPrice;
    const filtered = venues.filter((venue) => venue.price <= selectedPrice);
    setFilteredVenues(filtered);
    setNoMatches(filtered.length === 0);
  };

useEffect(() => {
  if (!Array.isArray(venues)) return;
  const totalGuests = calculateTotalGuests();
  const selectedPrice = filters.priceMax || maxPrice;
  const filtered = venues.filter((venue) => {
    const matchesDestination = (() => {
      if (filters.destination && !filters.continent && !filters.country && !filters.city) {
        const searchTerm = filters.destination.toLowerCase();
        const location = venue.location;
        return venue.name?.toLowerCase().includes(searchTerm) ||
               venue.description?.toLowerCase().includes(searchTerm) ||
               location?.city?.toLowerCase().includes(searchTerm) ||
               location?.country?.toLowerCase().includes(searchTerm) ||
               location?.continent?.toLowerCase().includes(searchTerm) ||
               location?.address?.toLowerCase().includes(searchTerm);
      }
      if (filters.continent && venue.location?.continent) {
        if (!venue.location.continent.toLowerCase().includes(filters.continent.toLowerCase())) {
          return false;
        }
      }
      if (filters.country && venue.location?.country) {
        if (!venue.location.country.toLowerCase().includes(filters.country.toLowerCase())) {
          return false;
        }
      }
      if (filters.city && venue.location?.city) {
        if (!venue.location.city.toLowerCase().includes(filters.city.toLowerCase())) {
          return false;
        }
      }
      if (filters.venueName && venue.name) {
        if (!venue.name.toLowerCase().includes(filters.venueName.toLowerCase())) {
          return false;
        }
      }  
      return true;
    })();
    const matchesGuests = venue.maxGuests >= totalGuests;
    const matchesPrice = venue.price <= selectedPrice;
    const matchesMeta = Object.entries(filters.meta || {}).every(([key, value]) => {
      if (!value) return true;
      return venue.meta?.[key];
    });
    return matchesDestination && matchesGuests && matchesPrice && matchesMeta;
  });
  setFilteredVenues(filtered);
  setNoMatches(filtered.length === 0);
}, [filters, venues, maxPrice]);

  const getRefForLocationType = (locationType) => {
    switch (locationType) {
      case 'continent': return continentRef;
      case 'country': return countryRef;
      case 'city': return cityRef;
      default: return null;
    }
  };

  useEffect(() => {
  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

  return (
    <>
      {showSidebar && <div className={styles.backdrop} onClick={toggleSidebar}></div>}
      <div className={`${styles.filterSidebar} ${showSidebar ? styles.showSidebar : ''}`}>
        <div className={styles.filterSidebarContent}>
          <Buttons size='close'
          onClick={toggleSidebar}
          className={styles.closeButton}
          >
          <i className="fa-solid fa-xmark"></i>
          </Buttons>
          <div className={styles.allFilters}>
<div className={styles.filterGroup}>
  <h3>Destination</h3>
  <div className={styles.inputWithSuggestions} ref={continentRef}>
    <input
      className={styles.continent}
      type="text"
      name="continent"
      placeholder="Continent"
      value={inputValues.continent}
      onChange={handleFilterChange}
      onFocus={() => setShowSuggestions(prev => ({ ...prev, continent: true }))}
      autoComplete="off"
    />
    {getSuggestions('continent').length > 0 && (
      <ul className={styles.suggestionList}>
{getSuggestions('continent').length > 0 && (
  <ul className={styles.suggestionList}>
    {getSuggestions('continent').map((suggestion, idx) => (
      <li 
        key={idx}
        onMouseDown={(e) => {
          e.preventDefault();
          handleSuggestionClickSecond('continent', suggestion);
          setShowSuggestions(prev => ({ ...prev, continent: false }));
        }}
      >
        {suggestion}
      </li>
    ))}
  </ul>
)}
      </ul>
    )}
  </div>
  <div className={styles.inputWithSuggestions} ref={countryRef}>
    <input
      className={styles.country}
      type="text"
      name="country"
      placeholder="Country"
      value={inputValues.country}
      onChange={handleFilterChange}
      onFocus={() => setShowSuggestions(prev => ({ ...prev, country: true }))}
      autoComplete="off"
    />
    {getSuggestions('country').length > 0 && (
      <ul className={styles.suggestionList}>
{getSuggestions('country').length > 0 && (
  <ul className={styles.suggestionList}>
    {getSuggestions('country').map((suggestion, idx) => (
      <li 
        key={idx}
        onMouseDown={(e) => {
          e.preventDefault();
          handleSuggestionClickSecond('country', suggestion);
          setShowSuggestions(prev => ({ ...prev, country: false }));
        }}
      >
        {suggestion}
      </li>
    ))}
  </ul>
)}
      </ul>
    )}
  </div>
  <div className={styles.inputWithSuggestions} ref={cityRef}>
    <input
      type="text"
      name="city"
      placeholder="City"
      value={inputValues.city}
      onChange={handleFilterChange}
      onFocus={() => setShowSuggestions(prev => ({ ...prev, city: true }))}
      autoComplete="off"
    />
    {getSuggestions('city').length > 0 && (
      <ul className={styles.suggestionList}>
{getSuggestions('city').length > 0 && (
  <ul className={styles.suggestionList}>
    {getSuggestions('city').map((suggestion, idx) => (
      <li 
        key={idx}
        onMouseDown={(e) => {
          e.preventDefault();
          handleSuggestionClickSecond('city', suggestion);
          setShowSuggestions(prev => ({ ...prev, city: false }));
        }}
      >
        {suggestion}
      </li>
    ))}
  </ul>
)}
      </ul>
    )}
  </div>
</div>
            <div className={styles.divideLine}></div>
            <div className={styles.filterGroup}>
              <h3>Price Range</h3>
              <div className={styles.priceLimits}>
                <span>Min: ${minPrice}</span>
                <span>Max: ${maxPrice}</span>
              </div>
              <div className={styles.priceInputSingle}>
<input
  type="number"
  value={filters.priceMax || ""}
  placeholder={`The Maximum price is ${maxPrice}`}
  min={minPrice}
  max={maxPrice}
  onChange={(e) => {
    const value = e.target.value;

    if (value === "") {
      handleFilterChange({ target: { name: "priceMax", value: "" } });
    } 
    else {
      const numericValue = Math.max(minPrice, Math.min(maxPrice, parseInt(value)));
      handleFilterChange({ target: { name: "priceMax", value: numericValue } });
    }
  }}
/>
              </div>
              <div className={styles.sliderSingle}>
<input
  type="range"
  min={minPrice}
  max={maxPrice}
  value={filters.priceMax || maxPrice}
  onChange={(e) => {
    handleFilterChange({ target: { name: 'priceMax', value: parseInt(e.target.value) } });
  }}
  style={{
    background: `linear-gradient(to right, #1F1B17 ${
      ((filters.priceMax || maxPrice) - minPrice) / (maxPrice - minPrice) * 100
    }%, #ddd ${
      ((filters.priceMax || maxPrice) - minPrice) / (maxPrice - minPrice) * 100
    }%)`
  }}
/>
              </div>
            </div>
            <div className={styles.divideLine}></div>
            <div className={styles.filterGroup}>
              <h3>Guests</h3>
              <div className={styles.guestInputs}>
                <input
                  type="number"
                  name="adults"
                  placeholder="Adults"
                  min="0"
                  value={adults}
                  onChange={(e) => handleGuestChange(e, 'adults')}
                />
                <input
                  type="number"
                  name="children"
                  placeholder="Children"
                  min="0"
                  value={children}
                  onChange={(e) => handleGuestChange(e, 'children')}
                />
                <input
                  type="number"
                  name="assistedGuests"
                  placeholder="Assisted Guests"
                  min="0"
                  value={assistedGuests}
                  onChange={(e) => handleGuestChange(e, 'assistedGuests')}
                />
              </div>
            </div>
            <div className={styles.divideLine}></div>
            <div className={styles.filterGroup}>
  <h3>Facilities</h3>
  <div className={styles.metaFilters}>
    {metaFilters.map(metaKey => (
      <div key={metaKey} className={styles.metaCheckboxWrapper}>
        <label className={styles.metaLabel}>
          <input
            type="checkbox"
            name={metaKey}
            checked={filters.meta[metaKey] || false}
            onChange={handleFilterChange}
            className={styles.metaCheckbox}
          />
          <span className={styles.customCheckbox}></span>
          {metaKey.charAt(0).toUpperCase() + metaKey.slice(1)}
        </label>
      </div>
    ))}
  </div>
            </div>
          </div>
          <div className={styles.divideLine}></div>
          <Buttons size='small'
          version='v1' 
          onClick={clearFilters} 
          className={styles.clearFilterButton}
          >
            Clear Filters
          </Buttons>
        </div>
      </div>
    </>
  );
};

export default Sidebar;