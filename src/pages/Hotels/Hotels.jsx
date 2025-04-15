import { useEffect, useState } from 'react';
import { VENUES } from '../../constants';
import { headers } from '../../headers';
import styles from './Hotels.module.css';
import registerImage from "/media/hotelTypes/hotelReseption.jpeg";
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import LoadingCard from '../../components/LoadingCard/LoadingCard.jsx';
import HotelCardSecondType from '../../components/HotelCardSecondType/HotelCardSecondType.jsx';

const Hotels = () => {
    const [hotels, setHotels] = useState([]);
    const [allLocations, setAllLocations] = useState([]);
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
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(16);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [noMatches, setNoMatches] = useState(false);

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

                const locationsSet = new Set();
                hotelsData.forEach(hotel => {
                    if (hotel.location) {
                        locationsSet.add(hotel.location.continent);
                        locationsSet.add(hotel.location.country);
                        locationsSet.add(hotel.location.city);
                    }
                });

                setAllLocations(Array.from(locationsSet));

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

    const loadMore = () => {
        setVisibleCount((prev) => Math.min(prev + 8, hotels.length));
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.4 && rating % 1 <= 0.6;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        for (let i = 0; i < fullStars; i++) {
            stars.push(<img key={`full-${i}`} src="/media/rating/star-solid.svg" alt="Full Star" />);
        }

        if (hasHalfStar) {
            stars.push(<img key="half" src="/media/rating/star-half-stroke-solid.svg" alt="Half Star" />);
        }

        for (let i = 0; i < emptyStars; i++) {
            stars.push(<img key={`empty-${i}`} src="/media/rating/star-regular.svg" alt="Empty Star" />);
        }

        return stars;
    };

    const location = useLocation();

    useEffect(() => {
        if (location.state?.filters) {
            setFilters(prev => ({
                ...prev,
                ...location.state.filters,
                meta: {
                    ...prev.meta,
                    ...location.state.filters.meta
                }
            }));
        }
    }, [location.state]);

    const handleEditClick = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleGuestChange = (type, increment) => {
        setFilters(prev => ({
            ...prev,
            [type]: Math.max(type === "adults" ? 1 : 0, prev[type] + increment),
        }));
    };

    return (
        <div className={styles.HotelsStyle}>
            <section className={styles.leftSection}>
                <div className={styles.leftBorder}>
                    <h2>Filters</h2>
                    <div className={styles.allFilters}>
                        <div className={styles.filterPeople}>
                            <div className={styles.guestSelector}>
                                <p onClick={handleEditClick} className={styles.totalGuests}>
                                    {`${filters.adults} Adults, ${filters.children} Children, ${filters.assisted} Assisted`}
                                </p>
                                {dropdownOpen && (
                                    <div className={styles.guestControls}>
                                        <div className={styles.guestType}>
                                            <span className={styles.guestTypeLabel}>Adults</span>
                                            <div className={styles.counterControls}>
                                                {filters.adults > 1 && (
                                                    <button className={styles.guestButtons} onClick={() => handleGuestChange("adults", -1)}>-</button>
                                                )}
                                                <span>{filters.adults}</span>
                                                <button className={styles.guestButtons} onClick={() => handleGuestChange("adults", 1)}>+</button>
                                            </div>
                                        </div>
                                        <div className={styles.guestType}>
                                            <span className={styles.guestTypeLabel}>Children</span>
                                            <div className={styles.counterControls}>
                                                {filters.children > 0 && (
                                                    <button className={styles.guestButtons} onClick={() => handleGuestChange("children", -1)}>-</button>
                                                )}
                                                <span>{filters.children}</span>
                                                <button className={styles.guestButtons} onClick={() => handleGuestChange("children", 1)}>+</button>
                                            </div>
                                        </div>
                                        <div className={styles.guestType}>
                                            <span className={styles.guestTypeLabel}>Assisted Guests</span>
                                            <div className={styles.counterControls}>
                                                {filters.assisted > 0 && (
                                                    <button className={styles.guestButtons} onClick={() => handleGuestChange("assisted", -1)}>-</button>
                                                )}
                                                <span>{filters.assisted}</span>
                                                <button className={styles.guestButtons} onClick={() => handleGuestChange("assisted", 1)}>+</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
            </section>
            <section className={styles.rightSection}>
                <div className={styles.rightBorder}>
                    <div className={styles.rightTitles}>
                        <h1>Find your Dream Stay</h1>
                        <p>...with Restelle</p>
                    </div>
                    {loading ? (
                        <div className={styles.allHotels}>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <LoadingCard key={index} />
                            ))}
                        </div>
                    ) : (
                        <>
                            {noMatches ? (
                                <p>Could not find a match. Please try again with different credentials or try again later.</p>
                            ) : (
                                <div className={styles.allHotels}>
                                    {filteredHotels.slice(0, visibleCount).map((hotel) => (
                                        <HotelCardSecondType key={hotel.id} hotel={hotel} />
                                    ))}
                                </div>
                            )}
                            {visibleCount < filteredHotels.length && (
                                <button className={styles.loadMoreButton} onClick={loadMore}>
                                    Load More
                                </button>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Hotels;