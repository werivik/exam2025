import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './HotelDetails.module.css';

import slideshowNext from "/media/icons/slideshow-next-button.png";
import slideshowPrev from "/media/icons/slideshow-next-button.png";

import { VENUES } from '../../constants';
import { headers } from '../../headers';

const getValidMedia = (mediaArray) => {
    if (!Array.isArray(mediaArray)) return [];
    return mediaArray.filter(item => typeof item.url === 'string' && item.url.trim() !== '');
};

const HotelDetails = () => {
    const { id } = useParams();
    const [hotel, setHotel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    const [showScrollIcon, setShowScrollIcon] = useState(true);


    useEffect(() => {
        const fetchHotel = async () => {
            try {
                const response = await fetch(`${VENUES}/${id}`, {
                    method: 'GET',
                    headers: headers(),
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch hotel details");
                }

                const result = await response.json();
                setHotel(result.data);
                setLoading(false);
            } 
            
            catch (error) {
                console.error("Error fetching hotel:", error);
                setLoading(false);
            }
        };

        fetchHotel();
    }, [id]);

    useEffect(() => {
        const handleScroll = () => {
          if (window.scrollY === 0) {
            setShowScrollIcon(true);
          } else {
            setShowScrollIcon(false);
          }
        };
      
        window.addEventListener('scroll', handleScroll);
      
        return () => window.removeEventListener('scroll', handleScroll);
      }, []);

    const handleNext = () => {
        if (!hotel?.media?.length) return;
        setCurrentSlide((prev) => (prev + 1) % hotel.media.length);
    };

    const handlePrev = () => {
        if (!hotel?.media?.length) return;
        setCurrentSlide((prev) => (prev - 1 + hotel.media.length) % hotel.media.length);
    };

    if (loading) {
        return <div className={styles.pageStyle}><p>Loading...</p></div>;
    }

    if (!hotel) {
        return <div className={styles.pageStyle}><p>Hotel not found.</p></div>;
    }

    const mediaArray = getValidMedia(hotel.media);
    const hasGallery = mediaArray.length > 1;
    const hasOneImage = mediaArray.length === 1;
    const currentImage = mediaArray[currentSlide]?.url;
    const currentAlt = mediaArray[currentSlide]?.alt || hotel.name;

    const bannerImageUrl = hotel.bannerImageUrl || '/default-banner.jpg';

    const getThumbnailImages = () => {
        if (!mediaArray.length) return [];

        const nextSlide = (currentSlide + 1) % mediaArray.length;

        return [mediaArray[currentSlide], mediaArray[nextSlide]];
    };

    const thumbnailImages = getThumbnailImages();

    return (
        <section className={styles.pageContent}>
            <div className={styles.pageStyle}>
                <div className={styles.slideshowSection}>
                    {hasGallery && (
                        <div className={styles.slideshowSection}>
                            {/* Left Section */}
                            <div className={styles.slideshowLeft}>
                                {thumbnailImages.map((item, index) => (
                                    <img
                                        key={`${item.url}-${index}`}
                                        src={item.url}
                                        alt={item.alt || `Preview ${index}`}
                                        className={`${styles.previewImage} ${index === 0 ? styles.activePreview : ''}`}
                                        onClick={() => setCurrentSlide((currentSlide + index) % mediaArray.length)}
                                    />
                                ))}
                            </div>

                            {/* Right Section (Main Image) */}
                            <div className={styles.slideshowRight}>
                                <div className={styles.slideshowButtons}>
                                    <div className={styles.slideshowButtonPrev} onClick={handlePrev}>
                                        <img src={slideshowPrev} alt="Previous" />
                                    </div>
                                    <div className={styles.slideshowButtonNext} onClick={handleNext}>
                                        <img src={slideshowNext} alt="Next" />
                                    </div>
                                </div>
                                <img
                                    src={currentImage}
                                    alt={currentAlt}
                                    className={styles.detailImage}
                                />
                            </div>
                        </div>
                    )}

                    {hasOneImage && (
                        <div className={styles.noSlideshow}>
                            <img
                                src={mediaArray[0].url}
                                alt={mediaArray[0].alt || hotel.name}
                                className={styles.detailImage}
                            />
                        </div>
                    )}

                    {!mediaArray.length && (
                        <div className={styles.noSlideshow}>
                            <img
                                src={bannerImageUrl}
                                alt="Banner"
                                className={styles.detailImage}
                            />
                        </div>
                    )}
                </div>

                {showScrollIcon && (
  <div className={styles.scrollIcon}>
    <i className={`fa-solid fa-chevron-down ${styles.bounceIcon}`}></i>
    <i className={`fa-solid fa-chevron-down ${styles.bounceIcon} ${styles.delay}`}></i>
  </div>
)}
                <div className={styles.titleLocation}>
                    <h1>{hotel.name}</h1>
                    <p><i class="fa-solid fa-location-dot"></i>{hotel.location?.address}, {hotel.location?.city}, {hotel.location?.country}</p>
                </div>

                <div className={styles.hotelInfo}>
                <div className={styles.hotelInfoLeft}>
                    <p className={styles.hotelRating}><strong>Rating:</strong> {hotel.rating} Stars</p>
                    <p><strong>Description</strong><br></br>{hotel.description}</p>
                    <p><strong>Max Guests:</strong> {hotel.maxGuests}</p>
                </div>

                <div className={styles.hotelInfoRight}> 
                    <p><strong>Price:</strong> ${hotel.price} / per night</p>
                    <button className={styles.bookButton}>Book Room</button>
                </div>
                </div>
            </div>
        </section>
    );
};

export default HotelDetails;
