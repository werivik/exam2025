import { useEffect, useState } from 'react';
import { VENUES } from '../../constants';
import { headers } from '../../headers';
import styles from './Hotels.module.css';
import registerImage from "/media/hotelTypes/hotelReseption.jpeg";
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Hotels = () => {
    const [hotels, setHotels] = useState([]);
    const [allLocations, setAllLocations] = useState([]);
    const [filteredHotels, setFilteredHotels] = useState([]);
    const [filters, setFilters] = useState({
        continent: '',
        country: '',
        city: '',
        maxGuests: 1,
        minRating: 0,
        meta: {},
    });
    const [metaFilters, setMetaFilters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(16);

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
            const matchesGuests = hotel.maxGuests >= filters.maxGuests;
            const matchesRating = hotel.rating >= (filters.minRating || 0);

            const matchesMeta = Object.keys(filters.meta).every(metaKey => {
                return filters.meta[metaKey] === false || hotel.meta[metaKey] === true;
            });

            return matchesContinent && matchesCountry && matchesCity && matchesGuests && matchesRating && matchesMeta;
        });

        setFilteredHotels(filtered);
    }, [filters, hotels]);

    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
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

    return (
        <div className={styles.HotelsStyle}>
            <section className={styles.leftSection}>
                <div className={styles.leftBorder}>
                    <h2>Filters</h2>
                    <div className={styles.allFilters}>
                        <div className={styles.categoryFilter}>
                            <h3>Destination:</h3>
                            <label>
                                Continent:
                                <select name="continent" onChange={handleFilterChange} value={filters.continent}>
                                    <option value="">All</option>
                                    {Array.from(new Set(hotels.map(hotel => hotel.location.continent))).map((continent, index) => (
                                        <option key={index} value={continent}>{continent}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Country:
                                <select name="country" onChange={handleFilterChange} value={filters.country}>
                                    <option value="">All</option>
                                    {Array.from(new Set(hotels.map(hotel => hotel.location.country))).map((country, index) => (
                                        <option key={index} value={country}>{country}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                City:
                                <select name="city" onChange={handleFilterChange} value={filters.city}>
                                    <option value="">All</option>
                                    {Array.from(new Set(hotels.map(hotel => hotel.location.city))).map((city, index) => (
                                        <option key={index} value={city}>{city}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <div className={styles.occupancyFilter}>
                            <h3>Max Guests:</h3>
                            <input
                                type="number"
                                name="maxGuests"
                                min="1"
                                value={filters.maxGuests}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className={styles.ratingFilter}>
                            <h3>Rating:</h3>
                            <input
                                type="number"
                                name="minRating"
                                min="0"
                                max="5"
                                value={filters.minRating}
                                onChange={handleFilterChange}
                            />
                        </div>

                        <div className={styles.metaFilter}>
                            <h3>Facilities:</h3>
                            {metaFilters.map((metaKey) => (
                                <label key={metaKey}>
                                    <input
                                        type="checkbox"
                                        name={metaKey}
                                        checked={filters.meta[metaKey] || false}
                                        onChange={handleFilterChange}
                                    />
                                    {metaKey.charAt(0).toUpperCase() + metaKey.slice(1)}
                                </label>
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
                        <div>Loading hotels...</div>
                    ) : (
                        <>
                            <div className={styles.allHotels}>
                                {filteredHotels.slice(0, visibleCount).map((hotel) => (
                                    <Link to={`/hotel-details/${hotel.id}`} key={hotel.id} className={styles.hotelCard}>
                                        <div className={styles.rating}>
                                            <div className={styles.stars}>{renderStars(hotel.rating || 0)}</div>
                                        </div>
                                        <img
                                            src={hotel.media?.[0]?.url || registerImage}
                                            alt={hotel.media?.[0]?.alt || hotel.name}
                                            className={styles.hotelImage}
                                        />
                                        <div className={styles.hotelInfo}>
                                            <h3>{hotel.name}</h3>
                                            <p className={styles.hotelLocation}>
                                                {hotel.location?.city || "Unknown City"}, {hotel.location?.country || "Unknown Country"}
                                            </p>
                                            <p className={styles.hotelPrice}>
                                                <span>from</span> ${hotel.price || "—"}<span> / per night</span>
                                            </p>
                                            <p className={styles.seeMore}>See more</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
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
