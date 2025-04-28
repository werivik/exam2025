import { useEffect, useState, useCallback } from 'react';
import { VENUES } from '../../constants.js';
import { headers } from '../../headers.js';
import { motion } from "framer-motion";
import styles from './Venues.module.css';
import { useSearchParams } from 'react-router-dom';
import VenueCardSecondType from '../../components/VenueCardSecondType/VenueCardSecondType.jsx';
import debounce from 'lodash.debounce';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
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
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [metaFilters, setMetaFilters] = useState([]);
  const [availableRatings, setAvailableRatings] = useState([1, 2, 3, 4, 5]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  const PAGE_SIZE = filtersVisible ? 18 : 20;

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
        const venuesData = Array.isArray(data.data) ? data.data : [];
        setVenues(venuesData);
        setFilteredVenues(venuesData);

        const prices = venuesData.map(venue => venue.price || 0);
        setMinPrice(Math.min(...prices));
        setMaxPrice(Math.max(...prices));

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
      const matchesContinent = filters.continent ? venue.location?.continent === filters.continent : true;
      const matchesCountry = filters.country ? venue.location?.country === filters.country : true;
      const matchesCity = filters.city ? venue.location?.city === filters.city : true;
      const totalGuests = (filters.adults || 0) + (filters.children || 0) + (filters.assisted || 0);
      const matchesGuests = venue.maxGuests >= totalGuests;
      const matchesRating = filters.ratings.length > 0 ? filters.ratings.includes(Math.floor(venue.rating)) : true;
      const matchesMeta = Object.keys(filters.meta).every(metaKey => {
        return filters.meta[metaKey] === false || venue.meta?.[metaKey] === true;
      });

      return matchesContinent && matchesCountry && matchesCity && matchesGuests && matchesRating && matchesMeta;
    });

    setFilteredVenues(filtered);
    setNoMatches(filtered.length === 0);
  }, [filters, venues]);

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'ratings') {
      setFilters(prev => {
        const newRatings = checked
          ? [...prev.ratings, parseInt(value)]
          : prev.ratings.filter(rating => rating !== parseInt(value));
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

  const toggleFilters = () => setFiltersVisible(prev => !prev);

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

      {/* Sidebar NOT COMPLETE */}
      {showSidebar && <div className={styles.backdrop} onClick={toggleSidebar}></div>}
      <div className={`${styles.filterSidebar} ${showSidebar ? styles.showSidebar : ''}`}>
        <div className={styles.filterSidebarContent}>
          <h2>Filter Your Search</h2>

          {/* Destination */}
          <div className={styles.filterGroup}>
            <h3>Destination</h3>
            <input type="text" name="continent" placeholder="Continent" onChange={handleFilterChange} />
            <input type="text" name="country" placeholder="Country" onChange={handleFilterChange} />
            <input type="text" name="city" placeholder="City" onChange={handleFilterChange} />
          </div>

          {/* Price Range */}
          <div className={styles.filterGroup}>
            <h3>Price Range</h3>
            <input
              type="number"
              name="priceMin"
              value={filters.priceMin || minPrice}
              min={minPrice}
              max={maxPrice}
              onChange={handleFilterChange}
              placeholder={`Min Price ($${minPrice})`}
            />
            <input
              type="number"
              name="priceMax"
              value={filters.priceMax || maxPrice}
              min={minPrice}
              max={maxPrice}
              onChange={handleFilterChange}
              placeholder={`Max Price ($${maxPrice})`}
            />
          </div>

          {/* Guests */}
          <div className={styles.filterGroup}>
            <h3>Guests</h3>
            <input type="number" name="adults" placeholder="Adults" min="0" onChange={handleFilterChange} />
            <input type="number" name="children" placeholder="Children" min="0" onChange={handleFilterChange} />
            <input type="number" name="assisted" placeholder="Assisted" min="0" onChange={handleFilterChange} />
          </div>

          {/* Meta filters */}
          <div className={styles.filterGroup}>
            <h3>Facilities</h3>
            {metaFilters.map(metaKey => (
              <div key={metaKey}>
                <input
                  type="checkbox"
                  name={metaKey}
                  checked={filters.meta[metaKey] || false}
                  onChange={handleFilterChange}
                />
                <label>{metaKey}</label>
              </div>
            ))}
          </div>

          {filteredVenues.length > 0 && (
            <div className={styles.resultsPopup}>
                <p>Found {filteredVenues.length} Results</p>
            </div>
          )}

          <button onClick={toggleSidebar} className={styles.closeSidebarButton}>Close</button>
        </div>
      </div>

      {/* Main Section */}
      <section className={styles.rightSection}>
        <div className={styles.rightBorder}>
          <div className={styles.rightTitles}>
            <h1>Find your Dream Stay</h1>
            <p>...with Holidaze</p>
          </div>

          {/* Top Search & Filters */}
          <div className={styles.filterTopSection}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder="Search venues..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              autoComplete="off"
              className={styles.searchbarFilter}
            />
            <button className={styles.filterSidebarButton} onClick={toggleSidebar}>
              Filters
            </button>
          </div>

          {/* Hotels List */}
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

              {/* Pagination */}
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
