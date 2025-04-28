import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminProfile.module.css';
import { motion } from "framer-motion";
import { PROFILES_SINGLE, PROFILES_SINGLE_BY_VENUES } from '../../constants';
import { headers } from '../../headers';
import defaultAvatar from '/media/images/mdefault.jpg';

import VenueCardSecondType from '../../components/VenueCardSecondType/VenueCardSecondType.jsx';

const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const AdminProfile = () => {
  const [userData, setUserData] = useState({});
  const [assignedVenues, setAssignedVenues] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAvatar, setNewAvatar] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      const token = localStorage.getItem('accessToken');
      const username = localStorage.getItem('username');
      console.log('Token:', token);
      console.log('Username:', username);
    
      if (!token || !username) {
        console.error('Missing token or name in localStorage');
        return;
      }
    
      try {
        const adminProfileUrl = PROFILES_SINGLE.replace("<name>", username);
        const response = await fetch(adminProfileUrl, {
          method: 'GET',
          headers: headers(token),
        });
    
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.errors?.[0]?.message || 'Failed to fetch admin data');
        }
    
        console.log('Admin data:', data);
        setUserData(data.data || {});
        setNewName(data.data.name);
        setNewAvatar(data.data.avatar?.url || '');
    
        const venuesResponse = await fetch(PROFILES_SINGLE_BY_VENUES.replace('<name>', username), {
          method: 'GET',
          headers: headers(token),
        });
    
        const venuesData = await venuesResponse.json();
        if (venuesResponse.ok) {
          setAssignedVenues(venuesData.data || []);
          console.log('Venues data:', venuesData);
        } 
        
        else {
          console.error('Failed to fetch venues');
        }
    
      } 
      
      catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };

    fetchAdminData();
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    setShowPopup(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    const token = localStorage.getItem('accessToken');
    const username = localStorage.getItem('username');
    
    if (!token || !username) {
      console.error('Missing token or name in localStorage');
      return;
    }

    try {
      const response = await fetch(`${PROFILES_SINGLE}/${username}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify({
          name: newName,
          avatar: newAvatar,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Profile updated successfully:', data);
        setUserData(data.data);
        setIsEditing(false);
      } 
      
      else {
        console.error('Failed to update profile');
      }
    } 
    
    catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleRedirect = () => {
    navigate('/create-venue');
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
      <div className={`${styles.blurWrapper} ${showPopup ? styles.blurred : ''}`}>

        <div className={styles.adminPageContent}>
        <section className={styles.leftSection}>
          <div className={styles.leftBorder}>
            <div className={styles.profileLeftTop}>
              <img
                src={userData.avatar?.url || defaultAvatar}
                alt={userData.name || 'Admin Avatar'}
              />
              <h3>Welcome back, {userData.name || 'Admin'}</h3>
            </div>
            <div className={styles.profileShortcut}>
              <button onClick={handleEditProfile} className={styles.shortcutLink}>Edit Profile</button>
              <button onClick={handleSignOut} className={styles.signOutButton}>Sign out</button>
              <button onClick={handleRedirect}>Create New Venue</button>
            </div>
          </div>
        </section>

        <section className={styles.rightSection}>
          <div className={styles.rightBorder}>
            <div className={styles.assignedVenues}>
              <div className={styles.venuesTitle}>
                <h2>All Venues</h2>
              </div>
              <div className={styles.allVenues}>
                {assignedVenues && assignedVenues.length > 0 ? (
                  <div className={styles.venuesList}>
                    {assignedVenues.map(venue => (
                      <VenueCardSecondType key={venue.id} venue={venue} />
                    ))}
                  </div>
                ) : (
                  <p>No venues assigned yet.</p>
                )}
              </div>
            </div>

            {isEditing && (
              <div className={styles.edit}>
                <div className={styles.editTitle}>
                  <h2>Edit Profile</h2>
                </div>
                <div className={styles.allEdits}>
                  <div>
                    <label>Username:</label>
                    <input 
                      type="text" 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label>Avatar URL:</label>
                    <input 
                      type="text" 
                      value={newAvatar} 
                      onChange={(e) => setNewAvatar(e.target.value)} 
                    />
                  </div>
                  <button onClick={handleSaveProfile} className={styles.saveButton}>Save</button>
                </div>
              </div>
            )}
          </div>
        </section>
        </div>

        {showPopup && (
          <div className={styles.popupOverlay}>
            <div className={styles.popup}>
              <h2>Signing off...</h2>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminProfile;
