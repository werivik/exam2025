import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './Hotels.module.css';
import registerImage from "/media/hotelTypes/hotelReseption.jpeg";

import fullStar from "/media/rating/star-solid.svg";
import emptyStar from "/media/rating/star-regular.svg";
import halfStar from "/media/rating/star-half-stroke-solid.svg";

import { VENUES } from '../../constants';
import { headers } from '../../headers';

const Hotels = () => {
    const [hotels, setHotels] = useState([]);
    const [visibleCount, setVisibleCount] = useState(8);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotels = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${VENUES}?sort=rating&sortOrder=desc`, {
                    method: 'GET',
                    headers: headers(),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch hotels");
                }

                const data = await response.json();
                setHotels(Array.isArray(data.data) ? data.data : []);
            } catch (error) {
                console.error("Error fetching hotels:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHotels();
    }, []);

    const loadMore = () => {
        setVisibleCount((prev) => Math.min(prev + 8, hotels.length));
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.4 && rating % 1 <= 0.6;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        for (let i = 0; i < fullStars; i++) {
            stars.push(<img key={`full-${i}`} src={fullStar} alt="Full Star" />);
        }

        if (hasHalfStar) {
            stars.push(<img key="half" src={halfStar} alt="Half Star" />);
        }

        for (let i = 0; i < emptyStars; i++) {
            stars.push(<img key={`empty-${i}`} src={emptyStar} alt="Empty Star" />);
        }

        return stars;
    };

    return (
        <div className={styles.HotelsStyle}>
            <section className={styles.leftSection}>
                <div className={styles.leftBorder}>
                    <h2>Filters</h2>
                    <div className={styles.allFilters}>
                        <div className={styles.categoryFilter}>
                            <h3>Categories:</h3>
                            <p>Beach</p>
                            <p>Pool</p>
                            <p>Spa</p>
                            <p>Family</p>
                            <p>Animal Friendly</p>
                            <p>Hike Trails</p>
                            <p>Child-free</p>
                        </div>
                        <div className={styles.occupancyFilter}>
                            <h3>Occupancy:</h3>
                            <p>1 Adult</p>
                        </div>
                        <div className={styles.priceFilter}>
                            <h3>Price Range:</h3>
                            <p>$ 175 - $ 899</p>
                        </div>
                        <div className={styles.bedFilter}>
                            <h3>Bed types:</h3>
                            <p>Single</p>
                            <p>Twin</p>
                            <p>Queen</p>
                            <p>King</p>
                            <p>XL King</p>
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
                                {hotels.slice(0, visibleCount).map((hotel) => (
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
                            {visibleCount < hotels.length && (
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
