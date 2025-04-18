import { useState, useEffect } from 'react';
import styles from './CostumerProfile.module.css';
import defaultAvatar from '/media/images/mdefault.jpg';
import { PROFILES_SINGLE, PROFILES_UPDATE } from '../../constants';
import { headers } from '../../headers';

const CostumerProfile = ({ username, accessToken }) => {
  const [user, setUser] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [profilePicture, setProfilePicture] = useState(defaultAvatar);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Starting API call...");
        setLoading(true);
        const url = PROFILES_SINGLE.replace('<name>', username);

        const response = await fetch(url, {
          method: 'GET',
          headers: headers(accessToken),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (data.data) {
          setUser(data.data);
          setProfilePicture(data.data.avatar?.url || defaultAvatar);
          const [firstName, lastName] = data.data.name.split(' ');
          setNewFirstName(firstName || '');
          setNewLastName(lastName || '');
        } 
        
        else {
          throw new Error('Invalid data format received from API');
        }
      } 
      
      catch (err) {
        console.error("Error fetching user data:", err);
        setError(`Failed to load customer data: ${err.message}`);
      } 
      
      finally {
        console.log("API call finished.");
        setLoading(false);
      }
    };

    if (username && accessToken) {
      console.log("Username and accessToken are valid:", username, accessToken);
      fetchUserData();
    }
  }, [username, accessToken]);

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameChange = async () => {
    setEditingName(false);
    setUser((prevUser) => ({
      ...prevUser,
      name: `${newFirstName} ${newLastName}`,
    }));
    try {
      const response = await fetch(PROFILES_UPDATE.replace('<name>', username), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers(accessToken) },
        body: JSON.stringify({
          name: `${newFirstName} ${newLastName}`,
          avatar: { url: profilePicture },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update name and avatar.');
      }
    } 
    
    catch (err) {
      console.error("Failed to update profile:", err);
      setError('Failed to update profile.');
    }
  };

  const renderBookings = () => {
    if (!user || user.bookings.length === 0) {
      return <p>No bookings made yet.</p>;
    }
    return (
      <ul>
        {user.bookings.map((booking) => (
          <li key={booking.id}>
            <strong>{booking.venue.name}</strong> ({booking.dateFrom} - {booking.dateTo})
            <p>{booking.venue.description}</p>
          </li>
        ))}
      </ul>
    );
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!user) return <p>No user data available.</p>;

  return (
    <section className={styles.pageContent}>
      <div>
        <h1>Welcome, {user.name.split(' ')[0]}</h1>
      </div>

      <div className={styles.avatarContainer}>
        <img
          src={profilePicture}
          alt={user.avatar?.alt || 'Profile Avatar'}
          className={styles.avatar}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleProfilePictureChange}
          className={styles.avatarInput}
        />
      </div>

      <div className={styles.nameSection}>
        {editingName ? (
          <div>
            <input
              type="text"
              value={newFirstName}
              onChange={(e) => setNewFirstName(e.target.value)}
              className={styles.nameInput}
              placeholder="First Name"
            />
            <input
              type="text"
              value={newLastName}
              onChange={(e) => setNewLastName(e.target.value)}
              className={styles.nameInput}
              placeholder="Last Name"
            />
            <button onClick={handleNameChange}>Save</button>
          </div>
        ) : (
          <div>
            <p>{user.name}</p>
            <button onClick={() => setEditingName(true)}>Edit Name</button>
          </div>
        )}
      </div>

      <div className={styles.bookingsSection}>
        <h2>Your Bookings</h2>
        {renderBookings()}
      </div>
    </section>
  );
};

export default CostumerProfile;
