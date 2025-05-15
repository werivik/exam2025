import { motion } from 'framer-motion';
import styles from './VenueDetailsSkeleton.module.css';

const VenueDetailsSkeleton = () => {
  return (
    <motion.div
      className={styles.pageContent}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className={styles.pageStyle}>
        <div className={`${styles.slideshowSection} ${styles.skeleton}`}>
        </div>
        
        <div className={styles.hotelInfoBottom}>
          <div className={styles.hotelInfoLeft}>
            <div className={styles.hotelInfoTop}>
              <div className={styles.titleLocation}>
                <div className={`${styles.skeletonText}`}/>
                <div className={`${styles.skeletonText}`}/>
                <div className={styles.starRating}>
                  <div className={`${styles.skeletonCircle}`}/>
                  <div className={`${styles.skeletonText}`}/>
                </div>
              </div>
            </div>
            
            <div className={styles.description}>
              <div className={`${styles.skeletonText}`}/>
              <div className={`${styles.skeletonText}`}/>
              <div className={`${styles.skeletonText}`}/>
              <div className={`${styles.skeletonText}`}/>
              <div className={`${styles.skeletonText}`}/>
            </div>
            
            <div className={`${styles.skeletonText}`}/>
            
            <div className={styles.meta}>
              <ul>
                {[1, 2, 3, 4, 5].map((item) => (
                  <li key={item} className={styles.skeletonBg}>
                    <div className={`${styles.skeletonCircle}`}/>
                    <div className={`${styles.skeletonText}`}/>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className={styles.venueOwner}>
              <div className={`${styles.skeletonText}`}/>
              <div className={styles.venueProfileName}>
                <div className={`${styles.skeletonCircle}`}/>
                <div className={`${styles.skeletonText}`}/>
              </div>
            </div>

            <div className={styles.venueInfo}>
              <div className={`${styles.skeletonText}`}/>
              <div className={styles.venueCreationDates}>
                <div className={styles.venueDates}>
                  <div className={`${styles.skeletonText}`}/>
                  <div className={`${styles.skeletonText}`}/>
                </div>
                <div className={styles.venueDates}>
                  <div className={`${styles.skeletonText}`}/>
                  <div className={`${styles.skeletonText}`}/>
                </div>
              </div>
            </div>
          </div>
          
          <div className={`${styles.hotelInfoRight} ${styles.skeletonBgLight}`}>
            <div className={styles.bookDateContent}>
              <div className={`${styles.skeletonText}`}/>
              <div className={styles.bookDate}>
                <div className={styles.bookDateStart}>
                  <div className={`${styles.skeletonCircle}`}/>
                  <div className={`${styles.skeletonBg}`}/>
                </div>
                <div className={styles.bookDateEnd}>
                  <div className={`${styles.skeletonCircle}`}/>
                  <div className={`${styles.skeletonBg}`}/>
                </div>
              </div>
            </div>
            
            <div className={styles.bookGuests}>
              <div className={styles.filterPeople}>
                <div className={`${styles.skeletonCircle}`}/>
                <div className={`${styles.skeletonBg}`} style={{ 
                  width: 'calc(100% - 15px)', 
                  height: '40px', 
                  borderRadius: '0 25px 25px 0', 
                  marginLeft: '15px' 
                }} />
              </div>
            </div>

            <div className={styles.dividerLine}></div>

            <div className={styles.maxGuestsPrice}>
              <div className={styles.maxGuestsSecond}>
                <div className={`${styles.skeletonText}`}/>
              </div>
              <div className={styles.bookPrice}>
                <div className={`${styles.skeletonText}`}/>
                <div className={`${styles.skeletonBg}`}/>
              </div>  
            </div>

            <div className={styles.maxGuestsSecond}>
                <div className={`${styles.skeletonText}`}/>
                <div className={`${styles.skeletonBg}`}/>
            </div>

            <div className={styles.dividerLine}></div>
            
            <div className={styles.maxGuestsFirst}>
                <div className={`${styles.skeletonText}`}/>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default VenueDetailsSkeleton;