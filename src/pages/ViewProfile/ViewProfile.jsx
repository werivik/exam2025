import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ViewProfile.module.css';
import { motion } from "framer-motion";
import { PROFILES_SINGLE, PROFILES_SINGLE_BY_VENUES } from '../../constants';
import { headers } from '../../headers';
import defaultAvatar from '/media/images/mdefault.jpg';
import VenueCardSecondType from '../../components/VenueCardSecondType/VenueCardSecondType.jsx';
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
  const [userData, setUserData] = useState({});
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [assignedVenues, setAssignedVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const navigate = useNavigate();

  const { id } = useParams();

  const mobileRefs = {
    profile: useRef(null),
    venues: useRef(null),
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('accessToken');
    const username = id;

    if (!token || !username) {
      console.error('Missing token or username from URL');
      return;
    }

    try {
      const profileUrl = PROFILES_SINGLE.replace("<name>", username);
      const response = await fetch(profileUrl, {
        method: 'GET',
        headers: headers(token),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.errors?.[0]?.message || 'Failed to fetch user data');
      }

      setUserData(data.data);
      await fetchUserVenues(token, username);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const fetchUserVenues = async (token, username) => {
    try {
      const venuesResponse = await fetch(PROFILES_SINGLE_BY_VENUES.replace('<name>', username), {
        method: 'GET',
        headers: headers(token),
      });

      const venuesData = await venuesResponse.json();
      if (venuesResponse.ok) {
        const venues = venuesData.data || [];
        setAssignedVenues(venues);
        setFilteredVenues(venues);
        calculateRatings(venues);
      } else {
        console.error('Failed to fetch venues');
      }
    } catch (error) {
      console.error('Error fetching user venues:', error);
    }
  };

const calculateRatings = (venues) => {
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
  else {
    setAverageRating(0);
    setTotalReviews(0);
  }
};

const handleVenueClick = (venue) => {
  navigate(`/venue-details/${venue.id}`);
};

  const RatingDisplay = () => (
    <div className={styles.rating}>
      <img src={starRating} alt="Star rating" />
      {averageRating}<span> / ({totalReviews}) reviews</span>
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
          <div className={styles.profileTop}>
            <div className={styles.bannerWrapper}>
              <img src={userData.banner?.url || bannerImage} alt="Profile Banner" />
            </div>
            <div className={styles.avatarWrapper}>
              <img src={bannerEdge} className={styles.edgeLeft} />
              <img
                className={styles.avatar}
                src={userData.avatar?.url || defaultAvatar}
                alt={userData.name || 'User Avatar'}
              />
              <img src={bannerEdge} className={styles.edgeRight} />
            </div>
          </div>

          <div className={styles.profileInfo}>
            <h2>{capitalizeFirstLetter(userData.name) || 'User'}</h2>
            <p>Venue Manager</p>
            <RatingDisplay />
          </div>

          <div className={styles.divider}></div>

          <div className={styles.venuesSection} ref={mobileRefs.venues}>
            <div className={styles.sectionHeader}>
              <h3>Venues</h3>
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
        </section>

        <section className={styles.tabletProfile}>
          <div className={styles.profileTop}>
            <div className={styles.bannerWrapper}>
              <img src={userData.banner?.url || bannerImage} alt="Profile Banner" />
            </div>
            <div className={styles.avatarWrapper}>
              <img src={bannerEdge} className={styles.edgeLeft} />
              <img
                className={styles.avatar}
                src={userData.avatar?.url || defaultAvatar}
                alt={userData.name || 'User Avatar'}
              />
              <img src={bannerEdge} className={styles.edgeRight} />
            </div>
            <div className={styles.profileInfo}>
            <h2>{capitalizeFirstLetter(userData.name) || 'User'}</h2>
            <p>Venue Manager</p>
            <RatingDisplay />
          </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.venuesSection} ref={mobileRefs.venues}>
            <div className={styles.sectionHeader}>
              <h3>Venues</h3>
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
        </section>
      </div>
    </motion.div>
  );
};

export default ViewProfile;
