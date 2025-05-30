import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { VENUES } from '../../constants.js';
import { headers } from '../../headers.js';
import { motion } from "framer-motion";
import styles from './Venues.module.css';
import { useSearchParams, useLocation } from 'react-router-dom';
import VenueCard from '../../components/VenueCard/VenueCard.jsx';
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
    ?.toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() || '';
};

const formatSuggestion = (str) => {
  return str
    ?.toLowerCase()
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || '';
};

const PAGE_SIZE = 20;

const Venues = () => {
  const [venues, setVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(18);
  const [noMatches, setNoMatches] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showSidebar, setShowSidebar] = useState(false);
  const [metaFilters, setMetaFilters] = useState([]);
  const [availableRatings, setAvailableRatings] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [sortOption, setSortOption] = useState("all");
  const [searchQuery, setSearchQuery] = useState('');
  const topRef = useRef(null);
  const [initialFiltersApplied, setInitialFiltersApplied] = useState(false);
  const [initialMetaFilters, setInitialMetaFilters] = useState(null);
  const [initialLocationFilters, setInitialLocationFilters] = useState(null);
  const [searchPlaceholder, setSearchPlaceholder] = useState("Search venues, locations, or owners...");

  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const inputRefs = {
    continent: useRef(null),
    country: useRef(null),
    city: useRef(null),
  };

  const [filters, setFilters] = useState({
    continent: '',
    country: location.state?.filters?.country || '',
    city: location.state?.filters?.city || '',
    adults: 1,
    children: 0,
    assisted: 0,
    minRating: 0,
    meta: {},
    ratings: [],
    priceMin: 0,
    priceMax: 0
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
  country: location.state?.filters?.country || '',
  city: location.state?.filters?.city || '',
  });

  const extractLocationSuggestions = useCallback((venuesData) => {
    const continents = new Map();
    const countries = new Map();
    const cities = new Map();
  
    venuesData.forEach(venue => {
      const location = venue.location || {};
      
      if (location.continent) {
        const normalized = normalizeString(location.continent);
        const formatted = formatSuggestion(location.continent);
        continents.set(normalized, formatted);
      }
      
      if (location.country) {
        const normalized = normalizeString(location.country);
        const formatted = formatSuggestion(location.country);
        countries.set(normalized, formatted);
      }
      
      if (location.city) {
        const normalized = normalizeString(location.city);
        const formatted = formatSuggestion(location.city);
        cities.set(normalized, formatted);
      }
    });
  
    return {
      continent: Array.from(continents.values()),
      country: Array.from(countries.values()),
      city: Array.from(cities.values()),
    };
  }, []);

  const clearFilters = useCallback(() => {
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
    setInputValues({
      continent: '',
      country: '',
      city: '',
    });
    setCurrentPage(1);
  }, [minPrice, maxPrice]);
  
  const handleFilterChange = useCallback((e) => {
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
  }, []);

  const toggleSidebar = useCallback(() => {
    setShowSidebar(prev => !prev);
  }, []);

  const handleSearchInputChange = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        let allVenues = [];
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

        allVenues = allVenues.concat(venuesData);
        currentPage++;
      }

      setVenues(allVenues);
      setFilteredVenues(allVenues);

      const prices = allVenues.map(venue => venue.price || 0);
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
      allVenues.forEach(venue => {
        if (venue.meta) {
          Object.keys(venue.meta).forEach(key => metaKeys.add(key));
        }
      });
      setMetaFilters(Array.from(metaKeys));

      const ratingsSet = new Set();
      allVenues.forEach(venue => {
        if (venue.rating) ratingsSet.add(Math.floor(venue.rating));
      });
      setAvailableRatings(Array.from(ratingsSet).sort((a, b) => a - b));

      setLocationSuggestionList(extractLocationSuggestions(allVenues));
    } 
    catch (error) {
      console.error("Error fetching venues:", error);
    } 
    finally {
      setLoading(false);
    }
  };

  fetchVenues();
  }, [extractLocationSuggestions]);

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
    params.set("page", currentPage.toString());

    setSearchParams(params, { replace: true });
  }, [filters, currentPage, setSearchParams]);

  useEffect(() => {
    if (!venues.length) return;
    
    const filtered = venues.filter(venue => {
      const matchesContinent = !filters.continent || 
        normalizeString(venue.location?.continent).startsWith(normalizeString(filters.continent));
      
      const matchesCountry = !filters.country || 
        normalizeString(venue.location?.country).startsWith(normalizeString(filters.country));
      
      const matchesCity = !filters.city || 
        normalizeString(venue.location?.city).startsWith(normalizeString(filters.city));       

      const totalGuests = (filters.adults || 0) + (filters.children || 0) + (filters.assisted || 0);
      const matchesGuests = venue.maxGuests >= totalGuests;

      const matchesRating = filters.ratings.length === 0 || 
        filters.ratings.includes(Math.floor(venue.rating || 0));

      const matchesMeta = Object.entries(filters.meta).every(([key, value]) => 
        !value || venue.meta?.[key] === true);

      const matchesPrice =
        (filters.priceMin === 0 || venue.price >= filters.priceMin) &&
        (filters.priceMax === 0 || venue.price <= filters.priceMax);

      const matchesSearch = !searchQuery || 
        venue.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.location?.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.location?.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      return (
        matchesContinent &&
        matchesCountry &&
        matchesCity &&
        matchesGuests &&
        matchesRating &&
        matchesMeta &&
        matchesPrice &&
        matchesSearch
      );
    });

    let sorted = [...filtered];
    switch (sortOption) {
      case "az":
        sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case "priceLowHigh":
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "priceHighLow":
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "ratingLowHigh":
        sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
        break;
      case "ratingHighLow":
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }

    setFilteredVenues(sorted);
    setNoMatches(filtered.length === 0);
    
  }, [filters, venues, sortOption, searchQuery]);

  useEffect(() => {
    document.body.style.overflow = showSidebar ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [showSidebar]);

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

  const pageTotal = useMemo(() => 
    Math.max(1, Math.ceil(filteredVenues.length / PAGE_SIZE)),
  [filteredVenues.length]);

  const getPageNumbers = (currentPage, totalPages) => {
    const maxPageNumbers = 5;
    let startPage;
    if (totalPages <= maxPageNumbers) {
      startPage = 1;
    } 
    else if (currentPage <= 3) {
      startPage = 1;
    } 
    else if (currentPage >= totalPages - 2) {
      startPage = totalPages - 4;
    } 
    else {
      startPage = currentPage - 2;
    }
    return Array.from({ length: Math.min(maxPageNumbers, totalPages) }, (_, i) => startPage + i);
  };

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + 10, filteredVenues.length));
  }, [filteredVenues.length]);

  const handlePageClick = useCallback((pageNum) => {
    setCurrentPage(pageNum);
    scrollToTop();
  }, [scrollToTop]);

  const goToNextPage = useCallback(() => {
    if (currentPage < pageTotal) {
      setCurrentPage(prev => prev + 1);
      scrollToTop();
    }
  }, [currentPage, pageTotal, scrollToTop]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      scrollToTop();
    }
  }, [currentPage, scrollToTop]);

  const getSuggestions = useCallback((type) => {
    const input = inputValues[type]?.toLowerCase().replace(/[-_]/g, ' ').trim();
    if (!input) return [];
    return locationSuggestionList[type].filter(item => 
      normalizeString(item).includes(input)
    );
  }, [inputValues, locationSuggestionList]);

  const handleLocationSuggestionClick = useCallback((type, value) => {
    setFilters(prev => ({ ...prev, [type]: value }));
    setInputValues(prev => ({ ...prev, [type]: value }));
    setShowLocationSuggestions(prev => ({ ...prev, [type]: false }));
  }, []);

  const visibleVenues = useMemo(() => {
    if (isMobile) {
      return filteredVenues.slice(0, visibleCount);
    } 
    else {
      return filteredVenues.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    }
  }, [filteredVenues, currentPage, visibleCount, isMobile]);

  useEffect(() => {
    }, [currentPage, visibleVenues]);

  useEffect(() => {
    if (!initialFiltersApplied) return;
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
    params.set("page", currentPage.toString());
    setSearchParams(params, { replace: true });
  }, [filters, currentPage, setSearchParams, initialFiltersApplied]);

  useEffect(() => {
    if (!initialFiltersApplied && venues.length > 0) {
      const urlParams = new URLSearchParams(location.search);
      const stateFilters = location.state?.filters || {};
      const newFilters = { ...filters };
      let hasChanges = false;
      if (urlParams.get('country')) {
        newFilters.country = urlParams.get('country');
        setInputValues(prev => ({ ...prev, country: urlParams.get('country') }));
        hasChanges = true;
      }
      if (urlParams.get('city')) {
        newFilters.city = urlParams.get('city');
        setInputValues(prev => ({ ...prev, city: urlParams.get('city') }));
        hasChanges = true;
      }
      if (urlParams.get('continent')) {
        newFilters.continent = urlParams.get('continent');
        setInputValues(prev => ({ ...prev, continent: urlParams.get('continent') }));
        hasChanges = true;
      }
      if (urlParams.get('adults')) {
        newFilters.adults = parseInt(urlParams.get('adults')) || 1;
        hasChanges = true;
      }
      if (urlParams.get('children')) {
        newFilters.children = parseInt(urlParams.get('children')) || 0;
        hasChanges = true;
      }
      if (urlParams.get('assisted')) {
        newFilters.assisted = parseInt(urlParams.get('assisted')) || 0;
        hasChanges = true;
      }
    const ratingsFromUrl = urlParams.getAll('ratings').map(r => parseInt(r)).filter(r => !isNaN(r));
      if (ratingsFromUrl.length > 0) {
        newFilters.ratings = ratingsFromUrl;
        hasChanges = true;
      }
    metaFilters.forEach(key => {
      if (urlParams.get(key) === 'true') {
        newFilters.meta[key] = true;
        hasChanges = true;
      }
    });
    if (stateFilters.meta) {
      newFilters.meta = { ...newFilters.meta, ...stateFilters.meta };
      hasChanges = true;
    }
    if (stateFilters.startDate) {
      newFilters.startDate = stateFilters.startDate;
      hasChanges = true;
    }
    if (stateFilters.endDate) {
      newFilters.endDate = stateFilters.endDate;
      hasChanges = true;
    }
    if (stateFilters.adults !== undefined) {
      newFilters.adults = stateFilters.adults;
      hasChanges = true;
    }
    if (stateFilters.children !== undefined) {
      newFilters.children = stateFilters.children;
      hasChanges = true;
    }
    if (stateFilters.assisted !== undefined) {
      newFilters.assisted = stateFilters.assisted;
      hasChanges = true;
    }
    if (stateFilters.city) {
      newFilters.city = stateFilters.city;
      setInputValues(prev => ({ ...prev, city: stateFilters.city }));
      hasChanges = true;
    }
    if (stateFilters.country) {
      newFilters.country = stateFilters.country;
      setInputValues(prev => ({ ...prev, country: stateFilters.country }));
      hasChanges = true;
    }
    if (stateFilters.continent) {
      newFilters.continent = stateFilters.continent;
      setInputValues(prev => ({ ...prev, continent: stateFilters.continent }));
      hasChanges = true;
    } 
    const pageFromUrl = parseInt(urlParams.get('page')) || 1;
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }
    if (hasChanges) {
      setFilters(newFilters);
    }
      setInitialFiltersApplied(true);
    }
  }, [venues, location.search, location.state, initialFiltersApplied, metaFilters, filters, currentPage]);

useEffect(() => {
  if (location.state?.filters) {
    const { filters } = location.state;
    
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
      setSearchPlaceholder(`Searching for "${location.state.searchQuery}"`);
    }
    
    if (filters.country || filters.city || filters.continent) {
      setInitialLocationFilters({
        country: filters.country || '',
        city: filters.city || '',
        continent: filters.continent || ''
      });
    }
    if (filters.meta) {
      setInitialMetaFilters(filters.meta);
    }
    if (filters.adults) {
      setFilters(prev => ({ ...prev, adults: filters.adults }));
    }
    if (filters.children) {
      setFilters(prev => ({ ...prev, children: filters.children }));
    }
    if (filters.assisted) {
      setFilters(prev => ({ ...prev, assisted: filters.assisted }));
    }
  }
}, [location.state]);

useEffect(() => {
  if (!initialFiltersApplied) return;
  
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
  params.set("page", currentPage.toString());

  setSearchParams(params, { replace: true });
}, [filters, currentPage, setSearchParams, initialFiltersApplied]);

useEffect(() => {
  document.title = 'Venues - Holidaze';
  
  return () => {
    document.title = 'Holidaze';
  };
}, []);

  return (
    <motion.div
      className={styles.pageContent}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5, ease: "easeInOut" }}>
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
        setShowSuggestions={setShowLocationSuggestions}
        venues={venues}
        setFilteredVenues={setFilteredVenues}
        setNoMatches={setNoMatches}
        initialLocationFilters={initialLocationFilters}
        initialMetaFilters={initialMetaFilters}/>
      <div ref={topRef} />
      <section className={styles.rightSection}>
        <div className={styles.rightBorder}>
          <div className={styles.topSection}>
            <div className={styles.rightTitles}>
              <h1>Find your Dream Stay</h1>
              <p>...with Holidaze</p>
            </div>
            <div className={styles.divideLine}></div>

            <div className={styles.filterTopSection}>
            <div className={styles.filterTop}>
              <div className={styles.topSearchbar}>
              <Searchbar
                filters={filters}
                setFilters={setFilters}
                venues={venues}
                setSearchQuery={setSearchQuery}
                searchQuery={searchQuery}
                handleSearchInputChange={handleSearchInputChange}
                setFilteredVenues={setFilteredVenues}
                setNoMatches={setNoMatches}
                placeholder={searchPlaceholder}
              />
            </div>
              <Buttons size='small' version='v2' onClick={toggleSidebar}>
              All Filters
            </Buttons>
            </div>
              <div className={styles.sortDropdown}>
                <div>
                <label htmlFor="sort">Sort by:</label>
                <select
                  id="sort"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}>
                  <option value="all">All</option>
                  <option value="az">A - Z</option>
                  <option value="priceLowHigh">Price: Low to High</option>
                  <option value="priceHighLow">Price: High to Low</option>
                  <option value="ratingLowHigh">Rating: Low to High</option>
                  <option value="ratingHighLow">Rating: High to Low</option>
                </select>
                </div>
                <Buttons size='small' version='v2' onClick={toggleSidebar}>
              All Filters
            </Buttons>
              </div>
          </div>
          </div>

          <div className={styles.divideLine}></div>

          {loading ? (
            <div className={styles.allHotels}>
              {Array.from({ length: 8 }).map((_, i) => (
                <VenueCard key={i} venue={null} />
              ))}
            </div>
          ) : noMatches ? (
            <p>Could not find a match. Please try again with different criteria.</p>
          ) : (
            <>
              <div className={styles.allHotels}>
                {visibleVenues.map(venue => (
                  <VenueCard key={venue.id} venue={venue} />
                ))}
              </div>
              {window.innerWidth >= 725 && pageTotal > 1 && (
                <div className={styles.paginationWrapper}>
                  <div className={styles.pagination}>
                    {currentPage > 1 && (
                      <button onClick={goToPrevPage} className={styles.page}>Prev</button>
                    )}
                    {getPageNumbers(currentPage, pageTotal).map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageClick(pageNum)}
                        className={pageNum === currentPage ? styles.pageActive : styles.page}
                      >
                        {pageNum}
                      </button>
                    ))}
                    
                    {currentPage < pageTotal && (
                      <button onClick={goToNextPage} className={styles.page}>Next</button>
                    )}
                  </div>
                </div>
              )}
              {window.innerWidth < 725 && visibleCount < filteredVenues.length && (
                <div className={styles.loadMoreWrapper}>
                  <Buttons size='medium' version='v2' onClick={loadMore}>Load more</Buttons>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default Venues;