import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './Searchbar.module.css';

const Searchbar = ({ filters, setFilters, venues, setSearchQuery, setFilteredVenues, setNoMatches }) => {
  const [inputValue, setInputValue] = useState('');
  const [searchbarSuggestions, setSearchbarSuggestions] = useState([]);
  const [showSearchbarSuggestions, setShowSearchbarSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  const allOptions = useMemo(() => {
    const cities = [...new Set(venues.map(venue => venue.location?.city).filter(Boolean))];
    const countries = [...new Set(venues.map(venue => venue.location?.country).filter(Boolean))];
    const continents = [...new Set(venues.map(venue => venue.location?.continent).filter(Boolean))];
    const venueNames = [...new Set(venues.map(venue => venue.name).filter(Boolean))];
    return [...cities, ...countries, ...continents, ...venueNames];
  }, [venues]);

  useEffect(() => {
    if (!inputValue) {
      setSearchbarSuggestions([]);
      return;
    }

    const input = inputValue.toLowerCase();
    const filtered = allOptions.filter(opt =>
      typeof opt === 'string' && opt.toLowerCase().startsWith(input)
    );

    setSearchbarSuggestions(filtered);
    setShowSearchbarSuggestions(true);
  }, [inputValue, allOptions]);

  const handleSelectSuggestion = (value) => {
    setInputValue(value);
    setShowSearchbarSuggestions(false);
    setSearchQuery(value);
    filterVenues(value);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setSearchQuery(value);
    filterVenues(value);
  };

  const filterVenues = (query) => {
    if (!query.trim()) {
      setFilteredVenues(venues);
      setNoMatches(false);
      return;
    }

    const filtered = venues.filter(venue => {
      const nameMatch = venue.name?.toLowerCase().includes(query.toLowerCase());
      const cityMatch = venue.location?.city?.toLowerCase().includes(query.toLowerCase());
      const countryMatch = venue.location?.country?.toLowerCase().includes(query.toLowerCase());
      const continentMatch = venue.location?.continent?.toLowerCase().includes(query.toLowerCase());
      return nameMatch || cityMatch || countryMatch || continentMatch;
    });

    setFilteredVenues(filtered);
    setNoMatches(filtered.length === 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchbarSuggestions.length > 0) {
      handleSelectSuggestion(searchbarSuggestions[0]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSearchbarSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={styles.searchbarContainer} ref={suggestionsRef}>
      <i className="fa-solid fa-magnifying-glass"></i>
      <input
        type="text"
        placeholder="Search venues, cities, countries..."
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {showSearchbarSuggestions && searchbarSuggestions.length > 0 && (
        <div className={styles.SearchbarSuggestionsWrapper}>
          <ul className={styles.SearchbarSuggestionsList}>
            {searchbarSuggestions.map((suggestion, index) => (
              <li
                key={index}
                className={styles.suggestionItem}
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Searchbar;