import React, { useState, useEffect, useRef } from 'react';
import styles from './Searchbar.module.css';

const Searchbar = ({ filters, setFilters, venues, setSearchQuery, setFilteredVenues, setNoMatches }) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  const allCities = [...new Set(venues.map(venue => venue.city).filter(Boolean))];
  const allCountries = [...new Set(venues.map(venue => venue.country).filter(Boolean))];
  const allContinents = [...new Set(venues.map(venue => venue.continent).filter(Boolean))];
  const allVenueNames = [...new Set(venues.map(venue => venue.name).filter(Boolean))];
  
  const allOptions = [...allCities, ...allCountries, ...allContinents, ...allVenueNames];  

  useEffect(() => {
    if (!inputValue) {
      setSuggestions([]);
      return;
    }

    const input = inputValue.toLowerCase();
    const filtered = allOptions.filter(opt => 
      typeof opt === 'string' && opt.toLowerCase().startsWith(input)
    );    
    setShowSuggestions(true);
    
  }, [inputValue]);

  const handleSelectSuggestion = (value) => {
    setInputValue('');
    setShowSuggestions(false);

    if (allContinents.includes(value)) {
      setFilters(prev => ({ ...prev, continent: value }));
    } 
    else if (allCountries.includes(value)) {
      setFilters(prev => ({ ...prev, country: value }));
    } 
    else if (allCities.includes(value)) {
      setFilters(prev => ({ ...prev, city: value }));
    } 
    else if (allVenueNames.includes(value)) {
      setFilters(prev => ({ ...prev, venue: value }));
    }
  };

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      handleSelectSuggestion(suggestions[0]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.searchbarContainer} ref={suggestionsRef}>
      <i class="fa-solid fa-magnifying-glass"></i>
      <input
        type="text"
        placeholder="Search venues, cities, countries..."
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {showSuggestions && (
        <ul className={styles.suggestionsList}>
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleSelectSuggestion(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Searchbar;
