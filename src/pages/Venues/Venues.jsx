import { useEffect, useState, useRef } from 'react';
import { VENUES } from '../../constants.js';
import { headers } from '../../headers.js';
import { motion } from "framer-motion";
import styles from './Venues.module.css';
import { useSearchParams } from 'react-router-dom';
import VenueCardSecondType from '../../components/VenueCardSecondType/VenueCardSecondType.jsx';
import debounce from 'lodash.debounce';
import Buttons from '../../components/Buttons/Buttons.jsx';
import Searchbar from '../../components/Searchbar/Searchbar.jsx';
import Sidebar from '../../components/Sidebar/Sidebar.jsx';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const normalizeString = (str) => {
  return str
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const formatSuggestion = (str) => {
  return str
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const Venues = () => {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersVisible, setFiltersVisible] = useState(true);
  const [visibleCount, setVisibleCount] = useState(18);
  const [noMatches, setNoMatches] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchResults, setSearchResults] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [metaFilters, setMetaFilters] = useState([]);
  const [availableRatings, setAvailableRatings] = useState([1, 2, 3, 4, 5]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  const [continents, setContinents] = useState([]);
  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');

  const PAGE_SIZE = filtersVisible ? 18 : 20;

  const inputRefs = {
    continent: useRef(null),
    country: useRef(null),
    city: useRef(null),
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.entries(inputRefs).forEach(([key, ref]) => {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowSuggestions(prev => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [filters, setFilters] = useState({
    continent: '',
    country: '',
    city: '',
    adults: 1,
    children: 0,
    assisted: 0,
    minRating: 0,
    meta: {},
    ratings: [],
    priceMin: minPrice,
    priceMax: maxPrice
  });

  const [locationSuggestionList, setLocationSuggestionList] = useState({
    continent: [],
    country: [],
    city: [],
  });
  
  const [showLocationSuggestions, setShowLocationSuggestions] = useState({
    continent: false,
    country: false,
    city: false,
  });  
  
  const [inputValues, setInputValues] = useState({
    continent: '',
    country: '',
    city: '',
  });

  useEffect(() => {
    const normalizeAndCollect = (key) => {
      const unique = new Map();
  
      venues.forEach(venue => {
        const raw = venue.location?.[key];
        if (raw) {
          const normalized = normalizeString(raw);
          const formatted = formatSuggestion(raw);
          if (!unique.has(normalized)) {
            unique.set(normalized, formatted);
          }
        }
      });
  
      return Array.from(unique.values());
    };
  
    setLocationSuggestionList({
      continent: normalizeAndCollect('continent'),
      country: normalizeAndCollect('country'),
      city: normalizeAndCollect('city'),
    });
  }, [venues]);    

  const clearFilters = () => {
    setFilters({
      continent: '',
      country: '',
      city: '',
      adults: 1,
      children: 0,
      assisted: 0,
      minRating: 0,
      meta: {},
      ratings: [],
      priceMin: minPrice,
      priceMax: maxPrice
    });
    setSearchQuery('');
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (['continent', 'country', 'city'].includes(name)) {
      setInputValues(prev => ({ ...prev, [name]: value }));
    }

    if (name === 'ratings') {
      setFilters(prev => {
        const newRatings = checked
          ? [...prev.ratings, parseInt(value)]
          : prev.ratings.filter(r => r !== parseInt(value));
        return { ...prev, ratings: newRatings };
      });
    } 
    
    else if (type === 'checkbox') {
      setFilters(prev => ({
        ...prev,
        meta: {
          ...prev.meta,
          [name]: checked,
        }
      }));
    } 
    
    else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const toggleSidebar = () => setShowSidebar(prev => !prev);

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.trim()) {
      const searchTerm = value.toLowerCase();
      const filtered = venues.filter(venue => {
      const nameMatch = venue.name?.toLowerCase().startsWith(searchTerm);
      const cityMatch = venue.location?.city?.toLowerCase().startsWith(searchTerm);
      const countryMatch = venue.location?.country?.toLowerCase().startsWith(searchTerm);
      const ownerMatch = venue.owner?.name?.toLowerCase().startsWith(searchTerm);

        return nameMatch || cityMatch || countryMatch || ownerMatch;
      });
      setFilteredVenues(filtered);
      setNoMatches(filtered.length === 0);
    } 
    
    else {
      setFilteredVenues(venues);
      setNoMatches(false);
    }
  };

  const handleSuggestionClick = (result) => {
    setSearchQuery(result.name);
    setSearchResults([]);
  };

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch(`${VENUES}?sort=rating&sortOrder=desc`, {
          method: 'GET',
          headers: headers(),
        });
        if (!response.ok) throw new Error("Failed to fetch venues");

        const data = await response.json();
        const venuesData = data.data || [];

        const normalizedVenues = venuesData.map(venue => ({
          ...venue,
          city: venue.location?.city || '',
          country: venue.location?.country || '',
          continent: venue.location?.continent || ''
        }));

        const continentsSet = new Set();
        const countriesSet = new Set();
        const citiesSet = new Set();

        setVenues(venuesData);
        setFilteredVenues(venuesData);

        const prices = venuesData.map(venue => venue.price || 0);
        setMinPrice(Math.min(...prices));
        setMaxPrice(Math.max(...prices));

        const min = Math.min(...prices);

const max = Math.max(...prices);

setMinPrice(min);
setMaxPrice(max);

setFilters(prev => ({
  ...prev,
  priceMin: min,
  priceMax: max
}));

        const metaKeys = new Set();
        venuesData.forEach(venue => {
          if (venue.meta) {
            Object.keys(venue.meta).forEach(key => metaKeys.add(key));
          }
        });

        setMetaFilters(Array.from(metaKeys));

        const ratingsSet = new Set();
        venuesData.forEach(venue => {
          if (venue.rating) ratingsSet.add(Math.floor(venue.rating));
        });

        setAvailableRatings(Array.from(ratingsSet).sort((a, b) => a - b));

        venuesData.forEach(venue => {
          const loc = venue.location || {};
          if (loc.continent) continentsSet.add(loc.continent);
          if (loc.country) countriesSet.add(loc.country);
          if (loc.city) citiesSet.add(loc.city);
        });

        setContinents([...continentsSet]);
        setCountries([...countriesSet]);
        setCities([...citiesSet]);
      } 
      
      catch (error) {
        console.error("Error fetching venues:", error);
      } 
      
      finally {
        setLoading(false);
      }
    };

    fetchVenues();
  }, []);

  useEffect(() => {
    const parsedFilters = {
      continent: searchParams.get("continent") || '',
      country: searchParams.get("country") || '',
      city: searchParams.get("city") || '',
      adults: parseInt(searchParams.get("adults")) || 1,
      children: parseInt(searchParams.get("children")) || 0,
      assisted: parseInt(searchParams.get("assisted")) || 0,
      ratings: searchParams.getAll("ratings").map(Number),
      meta: {}
    };

    metaFilters.forEach(metaKey => {
      if (searchParams.get(metaKey) === "true") {
        parsedFilters.meta[metaKey] = true;
      }
    });

    setFilters(prev => ({ ...prev, ...parsedFilters }));
    setCurrentPage(parseInt(searchParams.get("page")) || 1);
  }, [metaFilters.length]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.continent) params.set("continent", filters.continent);
    if (filters.country) params.set("country", filters.country);
    if (filters.city) params.set("city", filters.city);
    if (filters.adults > 0) params.set("adults", filters.adults);
    if (filters.children > 0) params.set("children", filters.children);
    if (filters.assisted > 0) params.set("assisted", filters.assisted);
    filters.ratings.forEach(r => params.append("ratings", r));
    Object.keys(filters.meta).forEach(key => {
      if (filters.meta[key]) params.set(key, "true");
    });
    params.set("page", currentPage);

    setSearchParams(params);
  }, [filters, currentPage]);

  useEffect(() => {
    const filtered = venues.filter(venue => {
      const matchesContinent = filters.continent
        ? venue.location?.continent?.toLowerCase() === filters.continent.toLowerCase()
        : true;
  
      const matchesCountry = filters.country
        ? venue.location?.country?.toLowerCase() === filters.country.toLowerCase()
        : true;
  
      const matchesCity = filters.city
        ? venue.location?.city?.toLowerCase() === filters.city.toLowerCase()
        : true;
  
      const totalGuests = (filters.adults || 0) + (filters.children || 0) + (filters.assisted || 0);
      const matchesGuests = venue.maxGuests >= totalGuests;
  
      const matchesRating = filters.ratings.length > 0
        ? filters.ratings.includes(Math.floor(venue.rating))
        : true;
  
      const matchesMeta = Object.keys(filters.meta).every(metaKey => {
        return filters.meta[metaKey] === false || venue.meta?.[metaKey] === true;
      });
  
      const matchesPrice =
        (filters.priceMin === 0 || venue.price >= filters.priceMin) &&
        (filters.priceMax === 0 || venue.price <= filters.priceMax);
  
      return (
        matchesContinent &&
        matchesCountry &&
        matchesCity &&
        matchesGuests &&
        matchesRating &&
        matchesMeta &&
        matchesPrice
      );
    });
  
    setFilteredVenues(filtered);
    setNoMatches(filtered.length === 0);
  }, [filters, venues]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 10, filteredVenues.length));
  };

  const handlePageClick = (pageNum) => {
    setCurrentPage(pageNum);
    scrollToTop();
  };

  const goToNextPage = () => {
    if (currentPage < pageTotal) setCurrentPage(prev => prev + 1);
    scrollToTop();
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
    scrollToTop();
  };

  const [showSuggestions, setShowSuggestions] = useState({
    continent: false,
    country: false,
    city: false,
  });  

  const getSuggestions = (type) => {
    const input = inputValues[type]?.toLowerCase().replace(/[-_]/g, ' ').trim();
    if (!input) return [];
  
    return locationSuggestionList[type].filter(item => {
      const normalizedItem = normalizeString(item);
      return normalizedItem.includes(input);
    });
  };
  
  const handleLocationSuggestionClick = (type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
    setInputValues(prev => ({ ...prev, [type]: value }));
    setShowLocationSuggestions(prev => ({ ...prev, [type]: false }));
  };
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.entries(inputRefs).forEach(([key, ref]) => {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowLocationSuggestions(prev => ({ ...prev, [key]: false }));
        }
      });
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);    

  const pageTotal = Math.max(1, Math.ceil(filteredVenues.length / PAGE_SIZE));

  return (
    <motion.div
      className={styles.pageContent}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {showSidebar && <div className={styles.backdrop} onClick={toggleSidebar}></div>}
      <Sidebar
  showSidebar={showSidebar}
  toggleSidebar={toggleSidebar}
  inputValues={inputValues}
  handleFilterChange={handleFilterChange}
  getSuggestions={getSuggestions}
  handleSuggestionClickSecond={handleLocationSuggestionClick}
  filters={filters}
  minPrice={minPrice}
  maxPrice={maxPrice}
  metaFilters={metaFilters}
  clearFilters={clearFilters}
  setShowSuggestions={setShowSuggestions}
  venues={venues}
  setFilteredVenues={setFilteredVenues}
  setNoMatches={setNoMatches}
  minPrice={minPrice}
  maxPrice={maxPrice}
/>
      <section className={styles.rightSection}>
        <div className={styles.rightBorder}>
          <div className={styles.rightTitles}>
            <h1>Find your Dream Stay</h1>
            <p>...with Holidaze</p>
          </div>

          <div className={styles.filterTopSection}>
          <div className={styles.topSearchbar}>
          <Searchbar
    filters={filters}
    setFilters={setFilters}
    venues={venues}
    setSearchQuery={setSearchQuery}
    setFilteredVenues={setFilteredVenues}
    setNoMatches={setNoMatches}
  />
          </div>
            <Buttons size='medium' version='v1' onClick={toggleSidebar}>
              Filters
            </Buttons>
          </div>

          {loading ? (
            <div className={styles.allHotels}>
              {Array.from({ length: 6 }).map((_, i) => (
                <VenueCardSecondType key={i} venue={null} />
              ))}
            </div>
          ) : noMatches ? (
            <p>Could not find a match. Please try again with different criteria.</p>
          ) : (
            <>
              <div className={styles.allHotels}>
                {filteredVenues
                  .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
                  .map(venue => (
                    <VenueCardSecondType key={venue.id} venue={venue} />
                  ))}
              </div>

              {window.innerWidth >= 1024 && pageTotal > 1 && (
                <div className={styles.pagination}>
                  {currentPage > 1 && (
                    <button onClick={goToPrevPage} className={styles.page}>Prev</button>
                  )}
                  {Array.from({ length: pageTotal }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => handlePageClick(p)}
                      className={p === currentPage ? styles.pageActive : styles.page}
                    >
                      {p}
                    </button>
                  ))}
                  {currentPage < pageTotal && (
                    <button onClick={goToNextPage} className={styles.page}>Next</button>
                  )}
                </div>
              )}

              {window.innerWidth < 1024 && visibleCount < filteredVenues.length && (
  <button className={styles.loadMoreButton} onClick={loadMore}>
    Load More
  </button>
)}
            </>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default Venues;