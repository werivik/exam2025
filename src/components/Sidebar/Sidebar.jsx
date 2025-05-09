import React, { useState } from 'react';
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
  setNoMatches
}) => {

  const [adults, setAdults] = useState('');
  const [children, setChildren] = useState('');
  const [assistedGuests, setAssistedGuests] = useState('');  

  const handleGuestChange = (e, type) => {
    const rawValue = e.target.value;
    const value = rawValue === '' ? '' : Math.max(0, parseInt(rawValue));
  
    if (type === 'adults') setAdults(value);
    else if (type === 'children') setChildren(value);
    else if (type === 'assistedGuests') setAssistedGuests(value);
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
  
    console.log(venues);
  
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

  return (
    <>
      {showSidebar && <div className={styles.backdrop} onClick={toggleSidebar}></div>}
      <div className={`${styles.filterSidebar} ${showSidebar ? styles.showSidebar : ''}`}>
        <div className={styles.filterSidebarContent}>
          <Buttons size='closeButton'
          onClick={toggleSidebar}
          >
          &times;
          </Buttons>

          <div className={styles.allFilters}>
            <div className={styles.filterGroup}>
              <h3>Destination</h3>
              {['continent', 'country', 'city'].map((locationType) => (
                <div className={styles.inputWithSuggestions} key={locationType}>
                  <input
                    type="text"
                    name={locationType}
                    placeholder={locationType.charAt(0).toUpperCase() + locationType.slice(1)}
                    value={inputValues[locationType]}
                    onChange={handleFilterChange}
                    onFocus={() => setShowSuggestions(prev => ({ ...prev, [locationType]: true }))}
                    autoComplete="off"
                  />
                  {getSuggestions(locationType).length > 0 && (
                    <ul className={styles.suggestionList}>
                      {getSuggestions(locationType).map((suggestion, idx) => (
                        <li
                          key={idx}
                          onClick={() => handleSuggestionClickSecond(locationType, suggestion)}
                        >
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
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

          <Buttons size='clearFilter' 
          onClick={clearFilters} 
          className={styles.clearFilterButton}>
            Clear Filters
          </Buttons>

        </div>
      </div>
    </>
  );
};

export default Sidebar;
