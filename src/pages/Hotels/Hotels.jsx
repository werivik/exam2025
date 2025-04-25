import { useEffect, useState } from 'react';
import { VENUES } from '../../constants';
import { headers } from '../../headers';
import { motion } from "framer-motion";
import styles from './Hotels.module.css';
import { useLocation, useSearchParams } from 'react-router-dom';
import HotelCardSecondType from '../../components/HotelCardSecondType/HotelCardSecondType.jsx';

const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
};

const Hotels = () => {
    const [hotels, setHotels] = useState([]);
    const [filteredHotels, setFilteredHotels] = useState([]);
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
    });
    const [metaFilters, setMetaFilters] = useState([]);
    const [availableRatings, setAvailableRatings] = useState([1, 2, 3, 4, 5]);
    const [filtersVisible, setFiltersVisible] = useState(true);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(18);
    const [noMatches, setNoMatches] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 18;

    const [searchParams, setSearchParams] = useSearchParams();

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

        metaFilters.forEach((metaKey) => {
            if (searchParams.get(metaKey) === "true") {
                parsedFilters.meta[metaKey] = true;
            }
        });

        setFilters(prev => ({ ...prev, ...parsedFilters }));
        const initialPage = parseInt(searchParams.get("page")) || 1;
        setCurrentPage(initialPage);
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
            if (filters.meta[key]) {
                params.set(key, "true");
            }
        });

        params.set("page", currentPage);

        setSearchParams(params);
    }, [filters, currentPage]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await fetch(`${VENUES}?sort=rating&sortOrder=desc`, {
                    method: 'GET',
                    headers: headers(),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch hotels");
                }

                const data = await response.json();
                const hotelsData = Array.isArray(data.data) ? data.data : [];
                setHotels(hotelsData);
                setFilteredHotels(hotelsData);

                const metaKeys = new Set();
                hotelsData.forEach(hotel => {
                    if (hotel.meta) {
                        Object.keys(hotel.meta).forEach(key => {
                            metaKeys.add(key);
                        });
                    }
                });

                setMetaFilters(Array.from(metaKeys));
                setLoading(false);
            } 
            
            catch (error) {
                console.error("Error fetching hotels:", error);
                setLoading(false);
            }
        };

        fetchHotels();
    }, []);

    useEffect(() => {
        const filtered = hotels.filter(hotel => {
            const matchesContinent = filters.continent ? hotel.location.continent === filters.continent : true;
            const matchesCountry = filters.country ? hotel.location.country === filters.country : true;
            const matchesCity = filters.city ? hotel.location.city === filters.city : true;

            const totalGuests =
                parseInt(filters.adults || 0) +
                parseInt(filters.children || 0) +
                parseInt(filters.assisted || 0);

            const matchesGuests = hotel.maxGuests >= totalGuests;

            const matchesRating = filters.ratings.length > 0
                ? filters.ratings.includes(Math.floor(hotel.rating))
                : true;

            const matchesMeta = Object.keys(filters.meta).every(metaKey => {
                return filters.meta[metaKey] === false || hotel.meta[metaKey] === true;
            });

            return matchesContinent && matchesCountry && matchesCity && matchesGuests && matchesRating && matchesMeta;
        });

        setFilteredHotels(filtered);

        if (filtered.length === 0) {
            setNoMatches(true);
        } 
        
        else {
            setNoMatches(false);
        }
    }, [filters, hotels]);

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

    const toggleFilters = () => {
        setFiltersVisible(prev => !prev);
    };

    const pageTotal = Math.max(1, Math.ceil(filteredHotels.length / PAGE_SIZE));

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const loadMore = () => {
        setVisibleCount((prev) => Math.min(prev + 10, filteredHotels.length));
    };

    const handlePageClick = (pageNum) => {
        setCurrentPage(pageNum);
        scrollToTop();
    };

    const goToNextPage = () => {
        if (currentPage < pageTotal) {
            setCurrentPage(currentPage + 1);
        }
        scrollToTop();
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
        scrollToTop();
    };

    return (
        <motion.div
            className={styles.pageContent}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            transition={{ duration: 0.5, ease: "easeInOut" }}
        >
            <section
                className={`${styles.leftSection} ${filtersVisible ? styles.visible : styles.hidden}`}
            >
                <div className={styles.leftContent}>
                <button
                    className={`${styles.toggleFilterButton} ${filtersVisible ? styles.filtersVisible : ''}`}
                    onClick={toggleFilters}
                >
                    {filtersVisible ? 'Hide Filters' : 'Show Filters'}
                </button>

                    <div className={`${styles.leftBorder} ${filtersVisible ? styles.visible : styles.hidden}`}>
                    <div className={styles.leftBorderContent}>
                <h2>Filters</h2>
                    <div className={styles.allFilters}>
                        <div className={styles.filterPeople}>
                            <div className={styles.guestSelector}>
                                <p className={styles.totalGuests}>
                                    {`${filters.adults} Adults, ${filters.children} Children, ${filters.assisted} Assisted`}
                                </p>
                            </div>
                        </div>
                        <div className={styles.categoryFilter}>
                            <h3>Destination</h3>
                            <label>
                                <span>Continent</span>
                                <select name="continent" onChange={handleFilterChange} value={filters.continent}>
                                    <option value="">All Continents</option>
                                    {Array.from(new Set(hotels.map(hotel => hotel.location.continent))).map((continent, index) => (
                                        <option key={index} value={continent}>{continent}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                <span>Country</span>
                                <select name="country" onChange={handleFilterChange} value={filters.country}>
                                    <option value="">All Countries</option>
                                    {Array.from(new Set(hotels.map(hotel => hotel.location.country))).map((country, index) => (
                                        <option key={index} value={country}>{country}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                <span>City</span>
                                <select name="city" onChange={handleFilterChange} value={filters.city}>
                                    <option value="">All Cities</option>
                                    {Array.from(new Set(hotels.map(hotel => hotel.location.city))).map((city, index) => (
                                        <option key={index} value={city}>{city}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div className={styles.ratingFilter}>
                            <h3>Rating:</h3>
                            {availableRatings.map((rating) => (
                                <label key={rating}>
                                    <input
                                        type="checkbox"
                                        name="ratings"
                                        value={rating}
                                        checked={filters.ratings.includes(rating)}
                                        onChange={handleFilterChange}
                                    />
                                    {rating} Star{rating > 1 ? 's' : ''}
                                </label>
                            ))}
                        </div>
                        <div className={styles.metaFilter}>
                            <h3>Meta Filters:</h3>
                            {metaFilters.length > 0 && metaFilters.map((metaKey) => (
                                <div key={metaKey} className={styles.metaCheckbox}>
                                    <label>
                                        <input
                                            type="checkbox"
                                            name={metaKey}
                                            checked={filters.meta[metaKey] || false}
                                            onChange={handleFilterChange}
                                        />
                                        {metaKey}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                    </div>
                </div>

            </section>

            <section
                className={`${styles.rightSection} ${filtersVisible ? '' : styles.expandedRightSection}`}
            >
                <div className={styles.rightBorder}>
                    <div className={styles.rightTitles}>
                        <h1>Find your Dream Stay</h1>
                        <p>...with Holidaze</p>
                    </div>

                    {loading ? (
                        <div className={styles.allHotels}>
                            {Array.from({ length: 6 }).map((_, i) => (
                                <HotelCardSecondType key={i} hotel={null} />
                            ))}
                        </div>
                    ) : (
                        <>
                            {noMatches ? (
                                <p>
                                    Could not find a match. Please try again with different
                                    credentials or try again later.
                                </p>
                            ) : (
                                <div className={styles.allHotels}>
                                    {filteredHotels
                                        .slice(
                                            (currentPage - 1) * PAGE_SIZE,
                                            currentPage * PAGE_SIZE
                                        )
                                        .map(hotel => (
                                            <HotelCardSecondType key={hotel.id} hotel={hotel} />
                                        ))}
                                </div>
                            )}

                            {window.innerWidth < 1024 && visibleCount < filteredHotels.length && (
                                <button
                                    className={styles.loadMoreButton}
                                    onClick={loadMore}
                                >
                                    Load More
                                </button>
                            )}

{window.innerWidth >= 1024 && pageTotal > 1 && (
    <div className={styles.pagination}>
        {currentPage > 1 && (
            <button
                onClick={goToPrevPage}
                className={styles.page}
            >
                Prev
            </button>
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
            <button
                onClick={goToNextPage}
                className={styles.page}
            >
                Next
            </button>
        )}
    </div>
)}
                        </>
                    )}
                </div>
            </section>
        </motion.div>
    );
};

export default Hotels;