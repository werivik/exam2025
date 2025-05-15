import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import styles from './ViewProfile.module.css';
import { PROFILES_SINGLE, PROFILES_SINGLE_BY_VENUES } from '../../constants';
import { headers } from '../../headers';
import VenueCardSecondType from '../../components/VenueCardSecondType/VenueCardSecondType';

import defaultAvatar from '/media/images/mdefault.jpg';
import starRating from '../../../media/rating/christmas-stars.png';
import bannerImage from '../../../media/logo/loadingScreen.png';
import bannerEdge from '../../../media/images/beige-edge.png';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const ViewProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({});
  const [assignedVenues, setAssignedVenues] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  
  const mobileRefs = {
    profile: useRef(null),
    venues: useRef(null),
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token || !id) {
        console.error('Missing token or username from URL');
        return;
      }
      
      try {
        const profileUrl = PROFILES_SINGLE.replace("<name>", id);
        const response = await fetch(profileUrl, {
          method: 'GET',
          headers: headers(token),
        });
  
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.errors?.[0]?.message || 'Failed to fetch user data');
        }
  
        setUserData(data.data);
        
        const venuesResponse = await fetch(PROFILES_SINGLE_BY_VENUES.replace('<name>', id), {
          method: 'GET',
          headers: headers(token),
        });
  
        const venuesData = await venuesResponse.json();
        if (venuesResponse.ok) {
          const venues = venuesData.data || [];
          setAssignedVenues(venues);
          
          let totalRating = 0;
          let ratedVenueCount = 0;
  
          venues.forEach((venue) => {
            if (venue.rating && venue.rating > 0) {
              totalRating += venue.rating;
              ratedVenueCount += 1;
            }
          });
  
          if (ratedVenueCount > 0) {
            const avg = totalRating / ratedVenueCount;
            setAverageRating(Math.min(5, parseFloat(avg.toFixed(1))));
            setTotalReviews(ratedVenueCount);
          }
        } 
        else {
          console.error('Failed to fetch venues');
        }
      } 
      catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchUserData();
  }, [id]);

  const filteredVenues = useMemo(() => {
    const sorted = [...assignedVenues];
    
    switch (sortOption) {
      case "ratingHigh":
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "ratingLow":
        return sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
      case "priceHigh":
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "priceLow":
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      default:
        return sorted;
    }
  }, [sortOption, assignedVenues]);

  const handleVenueClick = (venue) => {
    navigate(`/venue-details/${venue.id}`);
  };
  
  const goBack = () => {
    navigate(-1);
  };

  const RatingDisplay = () => (
    <div className={styles.rating}>
      <img src={starRating} alt="Star rating" />
      {averageRating}<span> / ({totalReviews}) reviews</span>
    </div>
  );
  
  const SortDropdown = () => (
    <select
      value={sortOption}
      onChange={(e) => setSortOption(e.target.value)}
      className={styles.sortDropdown}
    >
      <option value="default">All</option>
      <option value="ratingHigh">Rating: High to Low</option>
      <option value="ratingLow">Rating: Low to High</option>
      <option value="priceHigh">Price: High to Low</option>
      <option value="priceLow">Price: Low to High</option>
    </select>
  );
  
  const ProfileInfo = () => (
    <div className={styles.profileInfo}>
      <h2>{capitalizeFirstLetter(userData.name) || 'User'}</h2>
      <p>Venue Manager</p>
      <RatingDisplay />
    </div>
  );
  
  const ProfileHeader = ({ includeBackButton = false }) => (
    <div className={styles.profileTop}>
      <div className={styles.bannerWrapper}>
        <img src={userData.banner?.url || bannerImage} alt="Profile Banner" />
      </div>
      <div className={styles.avatarWrapper}>
        <img src={bannerEdge} className={styles.edgeLeft} alt="" />
        <img
          className={styles.avatar}
          src={userData.avatar?.url || defaultAvatar}
          alt={userData.name || 'User Avatar'}
        />
        <img src={bannerEdge} className={styles.edgeRight} alt="" />
      </div>
      {includeBackButton ? (
        <div className={styles.profileInfo}>
          <h2>{capitalizeFirstLetter(userData.name) || 'User'}</h2>
          <p>Venue Manager</p>
          <RatingDisplay />
          <div className={styles.gobackBtn}>
            <button onClick={goBack}>Go Back</button>
          </div>
        </div>
      ) : null}
    </div>
  );
  
  const VenuesList = ({ showLabel = false }) => (
    <div className={styles.venuesSection} ref={mobileRefs.venues}>
      <div className={styles.sectionHeader}>
        <h3>Venues</h3>
        <div>
          {showLabel && <label>Sort By:</label>}
          <SortDropdown />
        </div>
      </div>

      {filteredVenues.length > 0 ? (
        <div className={styles.venueGrid}>
          {filteredVenues.map((venue) => (
            <VenueCardSecondType
              key={venue.id}
              venue={venue}
              onClick={() => handleVenueClick(venue)}
            />
          ))}
        </div>
      ) : (
        <p>No venues yet.</p>
      )}
    </div>
  );

  return (
    <motion.div
      className={styles.container}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <div className={styles.profilePage}>
        <section className={styles.mobileProfile}>
          <ProfileHeader />
          <ProfileInfo />
          <div className={styles.divider}></div>
          <VenuesList />
        </section>

        <section className={styles.tabletProfile}>
          <ProfileHeader includeBackButton={true} />
          <div className={styles.divider}></div>
          <VenuesList showLabel={true} />
        </section>
      </div>
    </motion.div>
  );
};

export default ViewProfile;