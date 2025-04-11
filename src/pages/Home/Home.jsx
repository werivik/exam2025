import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import styles from './Home.module.css';
import homeBanner from "/media/images/banner2.png";
import Edge from "/media/images/beige-edge.png";

import fullStar from "/media/rating/star-solid.svg";
import emptyStar from "/media/rating/star-regular.svg";
import halfStar from "/media/rating/star-half-stroke-solid.svg";

import beachImage from "/media/hotelTypes/beach.jpeg";
import spaImage from "/media/hotelTypes/spa.jpeg";
import familyImage from "/media/hotelTypes/family.jpeg";
import animalImage from "/media/hotelTypes/animal.jpeg";
import registerImage from "/media/hotelTypes/hotelReseption.jpeg";

import { VENUES } from '../../constants';
import { headers } from '../../headers';

const Home = () => {
    const [hotels, setHotels] = useState([]);

    useEffect(() => {
        const fetchHotels = async () => {
            try {
                const response = await fetch(VENUES, {
                    method: "GET",
                    headers: headers(),
                });
    
                if (!response.ok) {
                    throw new Error("Failed to fetch hotels");
                }
    
                const result = await response.json();
    
                const getTopRatedHotels = (hotelsArray) => {
                    return (hotelsArray || [])
                        .filter(hotel => typeof hotel.rating === "number")
                        .sort((a, b) => b.rating - a.rating)
                        .slice(0, 5);
                };
    
                const limitedHotels = getTopRatedHotels(result.data);
    
                setHotels(limitedHotels);
            } 
            
            catch (error) {
                console.error("Error fetching hotels:", error);
            }
        };
    
        fetchHotels();
    }, []);    

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
        <div className={styles.home}>

            <section className={styles.firstSection}>
                <div className={styles.homeBanner}>
                    <h1>Holidaze</h1>
                    <p>Elegance meet Comfort</p>
                    <img src={homeBanner}></img>
                </div>
                <div className={styles.bannerFilters}>
                    <img src={Edge} className={styles.edgeLeft}></img>
                    <div className={styles.filterContent}>
                        <div className={styles.allFilters}>
                            <div className={styles.filtersLeft}>
                            <div className={styles.filterDestination}>
                                <i class="fa-solid fa-location-dot"></i>
                                <input placeholder='Search destination...'></input>
                            </div>
                            <div className={styles.filterCalender}>
                                <i class="fa-solid fa-calendar-days"></i>
                                <input placeholder='Find the Perfect date...'></input>
                            </div>
                            </div>
                            <div className={styles.filterPeople}>
                                <i class="fa-solid fa-person"></i>
                                <input placeholder='1 Adult'></input>
                            </div>
                        </div>
                        <button className={styles.filterSearch}>
                            Search
                        </button>
                    </div>
                    <img src={Edge} className={styles.edgeRight}></img>
                </div>
            </section>

            <section className={styles.secondSection}>
                <div className={styles.secondBorder}>
                    <div className={styles.typeTitle}>
                        <h2>Choose your perfect Stay</h2>
                        <p>“A journey of a thousand miles begins<br />with a single step.”</p>
                    </div>
                    <div className={styles.typeContent}>
                        <div className={styles.hotelType}>
                            <img src={beachImage}></img>
                            <h3>Beach Experience</h3>
                        </div>
                        <div className={styles.hotelType}>
                            <img src={spaImage}></img>
                            <h3>Relaxing Spa</h3>
                        </div>
                        <div className={styles.hotelType}>
                            <img src={familyImage}></img>
                            <h3>Family Trip</h3>
                        </div>
                        <div className={styles.hotelType}>
                            <img src={animalImage}></img>
                            <h3>Animal Friendly</h3>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.thirdSection}>
                <div className={styles.thirdBorder}>
                    <div className={styles.thirdContent}>
                        <img src={registerImage}></img>
                        <div className={styles.thirdInfo}>
                            <h2>Join Us and Start Your<br />Next Adventure today...</h2>
                            <p>Unlock Booking, Reservations and Discounts by Creating an Account with us</p>
                            <button className={styles.registerButton}>Register</button>
                        </div>
                    </div>
                </div>
            </section>

            <section className={styles.fourthSection}>
                <div className={styles.fourthBorder}>
                    <div className={styles.fourthContent}>
                        <div className={styles.fourthTitle}>
                            <h2>Explore Our Most Popular Hotels<br />for Every Traveler</h2>
                            <Link to="/hotels">Browse All</Link>
                        </div>
                        <div className={styles.popularHotels}>
                        {hotels.map((hotel) => (
  <div key={hotel.id} className={styles.hotelCard}>
    <img
      src={hotel.media?.[0]?.url || registerImage}
      alt={hotel.media?.[0]?.alt || hotel.name}
    />
    <div className={styles.hotelInfo}>
      <h3>{hotel.name}</h3>
      <p>
        {hotel.location?.city || "Uknown City"},{" "}
        {hotel.location?.country || "Uknown Country"}
      </p>
      <div className={styles.starRating}>
        {renderStars(hotel.rating || 0)}
      </div>
      <span>See more</span>
    </div>
  </div>
))}

                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Home;
