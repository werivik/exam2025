import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './HotelDetails.module.css';

import slideshowNext from "/media/icons/slideshow-next-button.png";
import slideshowPrev from "/media/icons/slideshow-next-button.png";

import { VENUES } from '../../constants';
import { headers } from '../../headers';

const getValidMedia = (mediaArray) => {
    return Array.isArray(mediaArray) ? mediaArray.filter(item => typeof item.url === 'string' && item.url.trim() !== '') : [];
};

const HotelDetails = () => {
    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [leftImages, setLeftImages] = useState([]);
    const [showScrollIcon, setShowScrollIcon] = useState(true);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const response = await fetch(`${VENUES}/${id}`, {
                    method: 'GET',
                    headers: headers(),
                });

                if (!response.ok) throw new Error("Failed to fetch hotel details");

                const result = await response.json();
                setHotel(result.data);
                const mediaArray = getValidMedia(result.data.media);
                setLeftImages(mediaArray.slice(0, 3));
            } 
            
            catch (error) {
                console.error("Error fetching hotel:", error);
            } 
            
            finally {
                setLoading(false);
            }
        };

        fetchHotel();
    }, [id]);

    useEffect(() => {
        const handleScroll = () => setShowScrollIcon(window.scrollY === 0);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNext = () => {
        if (!hotel?.media?.length) return;
        const mediaArray = getValidMedia(hotel.media);
        const newIndex = (currentSlide + 1) % mediaArray.length;
        setCurrentSlide(newIndex);

        const nextLeftImages = [
            ...leftImages.slice(1),
            mediaArray[(currentSlide + 3) % mediaArray.length]
        ];
        setLeftImages(nextLeftImages);
    };

    const handlePrev = () => {
        if (!hotel?.media?.length) return;
        const mediaArray = getValidMedia(hotel.media);
        const newIndex = (currentSlide - 1 + mediaArray.length) % mediaArray.length;
        setCurrentSlide(newIndex);

        const nextLeftImages = [
            mediaArray[(currentSlide - 1 + mediaArray.length) % mediaArray.length],
            ...leftImages.slice(0, 2)
        ];
        setLeftImages(nextLeftImages);
    };

    if (loading) return <div className={styles.pageStyle}><p>Loading...</p></div>;
    if (!hotel) return <div className={styles.pageStyle}><p>Hotel not found.</p></div>;

    const mediaArray = getValidMedia(hotel.media);
    const currentImage = mediaArray[currentSlide]?.url;
    const currentAlt = mediaArray[currentSlide]?.alt || hotel.name;

    return (
        <section className={styles.pageContent}>
            <div className={styles.pageStyle}>
                <div className={styles.hotelInfoTop}>
                    <div className={styles.titleLocation}>
                        <h1>{hotel.name}</h1>
                        <p><i className="fa-solid fa-location-dot"></i>{hotel.location?.address}, {hotel.location?.city}, {hotel.location?.country}</p>
                    </div>
                    <div className={styles.hotelInfoTopRight}>
                        <p>Price: <strong>$ {hotel.price}</strong> / per night</p>
                        <button className={styles.bookButton}>Book Room</button>
                    </div>
                </div>
                <div className={styles.slideshowSection}>
                    {mediaArray.length >= 2 ? (
                        <div className={styles.slideshowSection}>
                            <div className={styles.slideshowLeft}>
                                <div className={styles.slideshowLeftContent}>
                                    {leftImages.map((item, index) => {
                                        const dynamicHeight = leftImages.length === 2 ? '50%' : '32.4%';
                                        return (
                                            <img
                                                key={`${item.url}-${index}`}
                                                src={item.url}
                                                alt={item.alt || `Preview ${index}`}
                                                style={{ height: dynamicHeight }}
                                                className={`${styles.previewImage} ${index === 0 ? styles.activePreview : ''}`}
                                                onClick={() => setCurrentSlide(index)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                            <div className={styles.slideshowRight}>
                                <div className={styles.slideshowButtons}>
                                    <div className={styles.slideshowButtonPrev} onClick={handlePrev}>
                                        <img src={slideshowPrev} alt="Previous" />
                                    </div>
                                    <div className={styles.slideshowButtonNext} onClick={handleNext}>
                                        <img src={slideshowNext} alt="Next" />
                                    </div>
                                </div>
                                <div className={styles.slideshowProgress}>
                                    <p>{currentSlide + 1} out of {mediaArray.length}</p>
                                </div>
                                <img
                                    src={currentImage}
                                    alt={currentAlt}
                                    className={styles.detailImage}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className={styles.noSlideshow}>
                            <img
                                src={hotel.bannerImageUrl || mediaArray[0]?.url || '/default-banner.jpg'}
                                alt={hotel.name}
                                className={styles.detailImage}
                            />
                        </div>
                    )}
                </div>
                <div className={styles.hotelInfoBottom}>
                    <div className={styles.hotelInfoLeft}>
                        <p className={styles.hotelRating}><strong>Rating</strong> {hotel.rating} <img src="/media/rating/star-solid.svg" alt="Star" className={styles.singleStar} /></p>
                        <p className={styles.description}><strong>Description</strong><br />{hotel.description}</p>
                        {hotel.meta && (
                            <div className={styles.meta}>
                                <h3>Amenities</h3>
                                <ul>
                                    {hotel.meta?.wifi && <li><i className="fa-solid fa-wifi"></i> Wi-Fi</li>}
                                    {hotel.meta?.parking && <li><i className="fa-solid fa-car"></i> Free Parking</li>}
                                    {hotel.meta?.breakfast && <li><i className="fa-solid fa-utensils"></i> Breakfast Included</li>}
                                    {hotel.meta?.pets && <li><i className="fa-solid fa-paw"></i> Pets Allowed</li>}
                                </ul>
                            </div>
                        )}
                        <p><strong>Max Guests</strong> {hotel.maxGuests}</p>
                    </div>
                    <div className={styles.hotelInfoRight}>
                        <div className={styles.bookDateGuest}>
                            <h3>Find the Perfect date</h3>
                            <div className={styles.bookDate}>
                                <i class="fa-solid fa-calendar-days"></i>
                                <input type="
                                " 
                                placeholder='Find the Perfect Date'
                                />
                            </div>
                            <div className={styles.bookGuests}>
                                <i class="fa-solid fa-person"></i>
                                <input type="
                                " 
                                placeholder='1 Adult'
                                />
                                <button className={styles.searchRoom}>Search</button>
                            </div>
                        </div>
                        <div className={styles.dividerLine}></div>
                        <div className={styles.bookPrice}>
                            <p>Total Price: <strong>$ {hotel.price}</strong> <span>/ per night</span></p>
                            <button className={styles.bookButton}>Book Room</button>
                        </div>
                        <div className={styles.dividerLine}></div>
                        <div className={styles.favoriteVenue}>
                            <p><i class="fa-regular fa-heart"></i> Favorite the Venue</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HotelDetails;
