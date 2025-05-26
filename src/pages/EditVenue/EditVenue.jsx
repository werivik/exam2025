import React, { useState, useEffect } from 'react';
import styles from './EditVenue.module.css';
import { VENUE_UPDATE } from '../../constants';
import { headers } from '../../headers';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import CostumPopup from '../../components/CostumPopup/CostumPopup';
import Buttons from "../../components/Buttons/Buttons";

const EditVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [popupMessage, setPopupMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupType, setPopupType] = useState('success');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    maxGuests: 0,
    media: [{ url: '', alt: '' }, { url: '', alt: '' }, { url: '', alt: '' }],
    meta: { wifi: false, parking: false, breakfast: false, pets: false },
    location: {
      address: '',
      city: '',
      zip: '',
      country: '',
      continent: '',
      lat: 0,
      lng: 0,
    },
  });

  useEffect(() => {
    if (state?.venue) {
      const venue = state.venue;
      setFormData({
        name: venue.name,
        description: venue.description,
        price: venue.price || 0,
        maxGuests: venue.maxGuests || 0,
        media: venue.media || [{ url: '', alt: '' }, { url: '', alt: '' }, { url: '', alt: '' }],
        meta: venue.meta || { wifi: false, parking: false, breakfast: false, pets: false },
        location: venue.location || {
          address: '',
          city: '',
          zip: '',
          country: '',
          continent: '',
          lat: 0,
          lng: 0,
        },
      });
    } 
    else if (id) {
      fetchVenueById(id);
    } 
    else {
      navigate('/admin-profile');
    }
  }, [state, id, navigate]);

  const fetchVenueById = async (venueId) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setPopupMessage(
          <>
            <h2>Authentication Required</h2>
            <p>Please log in to edit this venue.</p>
          </>
        );
        setPopupType('error');
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          navigate('/login');
        }, 2000);
        return;
      }

      const response = await fetch(`${VENUE_UPDATE.replace('<id>', venueId)}?_published=true`, {
        method: 'GET',
        headers: headers(token),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({
          name: data.name,
          description: data.description,
          price: data.price || 0,
          maxGuests: data.maxGuests || 0,
          media: data.media || [{ url: '', alt: '' }, { url: '', alt: '' }, { url: '', alt: '' }],
          meta: data.meta || { wifi: false, parking: false, breakfast: false, pets: false },
          location: data.location || {
            address: '',
            city: '',
            zip: '',
            country: '',
            continent: '',
            lat: 0,
            lng: 0,
          },
        });
      } 
      else {
        setPopupMessage(
          <>
            <h2>Failed to Load Venue</h2>
            <p>Could not retrieve venue information. Redirecting to profile.</p>
          </>
        );
        setPopupType('error');
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          navigate('/admin-profile');
        }, 2000);
      }
    } 
    catch (error) {
      setPopupMessage(
        <>
          <h2>Network Error</h2>
          <p>Failed to connect to the server. Please check your connection and try again.</p>
        </>
      );
      setPopupType('error');
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate('/admin-profile');
      }, 2000);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    let newValue = value;
  
    if (type === 'checkbox' && name.startsWith('meta-')) {
      const metaKey = name.split('-')[1];
      setFormData((prev) => ({
        ...prev,
        meta: { ...prev.meta, [metaKey]: checked },
      }));
      return;
    } 
    else if (name.startsWith('media-')) {
      const parts = name.split('-');
      const index = parseInt(parts[1], 10);
      const field = parts[2];
      const newMedia = [...formData.media];
      newMedia[index][field] = value;
      setFormData({ ...formData, media: newMedia });
    } 
    else if (name.includes('location')) {
      const field = name.split('-')[1];
      setFormData({
        ...formData,
        location: { ...formData.location, [field]: value },
      });
    } 
    else {
      if (name === 'price' || name === 'maxGuests') {
        newValue = newValue.replace(/^0+(?!$)/, '');
  
        if (/^\d*$/.test(newValue)) {
          newValue = Number(newValue);
        }
      }
  
      setFormData({
        ...formData,
        [name]: newValue,
      });
    }
  };  

  const handleAddMedia = () => {
    setFormData((prev) => ({
      ...prev,
      media: [...prev.media, { url: '', alt: '' }],
    }));
  };
  
  const handleDeleteMedia = (index) => {
    if (formData.media.length > 1) {
      const updatedMedia = [...formData.media];
      updatedMedia.splice(index, 1);
      setFormData({ ...formData, media: updatedMedia });
    }
  };  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setPopupMessage(
        <>
          <h2>Authentication Required</h2>
          <p>Please log in to save changes.</p>
        </>
      );
      setPopupType('error');
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        navigate('/login');
      }, 2000);
      return;
    }
  
    const transformedFormData = {
      ...formData,
      media: formData.media.filter(item => item.url.trim() !== '').map(item => ({
        url: item.url,
        alt: item.alt,
      })),
      meta: formData.meta.wifi || formData.meta.parking || formData.meta.breakfast || formData.meta.pets
        ? formData.meta
        : undefined,
      location: formData.location.address || formData.location.city || formData.location.zip || formData.location.country
        ? formData.location
        : undefined,
    };
  
    try {
      const response = await fetch(VENUE_UPDATE.replace('<id>', id), {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify(transformedFormData),
      });
  
      const data = await response.json();
      if (response.ok) {
        setPopupMessage(
          <>
            <h2>Successfully Edited "{formData.name}"</h2>
            <p>Redirecting to Profile Page.</p>
          </>
        );
        setPopupType('success');
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          navigate('/admin-profile');
        }, 3000);
      } 
      else {
        const errorMsg = data.errors
          ? data.errors.map(err => err.message).join(', ')
          : data.message || 'Unknown error occurred';
        
        setPopupMessage(
          <>
            <h2>Could not Save the Changes</h2>
            <p>{errorMsg}</p>
          </>
        );        
        setPopupType('error');
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      }
    } 
    catch (error) {
      setPopupMessage(
        <>
          <h2>Network Error</h2>
          <p>Failed to save changes. Please check your connection and try again.</p>
        </>
      );      
      setPopupType('error');
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };  

  const closePopup = () => {
    setShowPopup(false);
  };  
  
  const goBackToAdminProfile = () => {
    navigate('/admin-profile');
  };

  useEffect(() => {
  document.title = 'Edit Venue - Holidaze';
  
  return () => {
    document.title = 'Holidaze';
  };
}, []);

  return (
    <motion.div
      className={styles.editVenueContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className={`${styles.blurWrapper} ${showPopup ? styles.blurred : ''}`}>
      <section className={styles.pageContent}>
        <h1>Edit Venue</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Price</label>
            <input
              type="text"
              name="price"
              value={formData.price.toString()}
              onChange={handleChange}
              required
              inputMode="numeric"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Max Guests</label>
            <input
              type="text"
              name="maxGuests"
              value={formData.maxGuests.toString()}
              onChange={handleChange}
              required
              inputMode="numeric"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Media (Images)</label>
            {formData.media.map((media, index) => (
              <div key={index} className={styles.mediaField}>
                <input
                  type="url"
                  name={`media-${index}-url`}
                  placeholder="Image URL"
                  value={media.url || ''}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name={`media-${index}-alt`}
                  placeholder="Image Alt Text"
                  value={media.alt || ''}
                  onChange={handleChange}
                />
                {index > 0 && (
                  <Buttons 
                    size='removeMedia'
                    onClick={() => handleDeleteMedia(index)}>
                    Remove 
                  </Buttons>
                )}
              </div>
            ))}
            <div className={styles.mediaButtons}>
              <Buttons 
                size='addMedia'
                onClick={handleAddMedia}>
                + Add Media      
              </Buttons>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label>Meta Tags</label>
            <div className={styles.metaCheckboxContainer}>
              <label className={styles.metaLabel}>
                <input
                  type="checkbox"
                  name="meta-wifi"
                  className={styles.metaCheckbox}
                  onChange={handleChange}
                  checked={formData.meta.wifi}
                />
                <span className={styles.customCheckbox}></span>
                Wifi
              </label>
              <label className={styles.metaLabel}>
                <input
                  type="checkbox"
                  name="meta-parking"
                  className={styles.metaCheckbox}
                  onChange={handleChange}
                  checked={formData.meta.parking}
                />
                <span className={styles.customCheckbox}></span>
                Parking
              </label>
              <label className={styles.metaLabel}>
                <input
                  type="checkbox"
                  name="meta-breakfast"
                  className={styles.metaCheckbox}
                  onChange={handleChange}
                  checked={formData.meta.breakfast}
                />
                <span className={styles.customCheckbox}></span>
                Breakfast
              </label>
              <label className={styles.metaLabel}>
                <input
                  type="checkbox"
                  name="meta-pets"
                  className={styles.metaCheckbox}
                  onChange={handleChange}
                  checked={formData.meta.pets}
                />
                <span className={styles.customCheckbox}></span>
                Pets
              </label>
            </div>
          </div>

          <div className={styles.fieldGroup}>
            <label>Location</label>
            <div>
              <input
                type="text"
                name="location-address"
                placeholder="Address"
                value={formData.location.address}
                onChange={handleChange}
              />
              <input
                type="text"
                name="location-city"
                placeholder="City"
                value={formData.location.city}
                onChange={handleChange}
              />
              <input
                type="text"
                name="location-zip"
                placeholder="ZIP"
                value={formData.location.zip}
                onChange={handleChange}
              />
              <input
                type="text"
                name="location-country"
                placeholder="Country"
                value={formData.location.country}
                onChange={handleChange}
              />
              <input
                type="text"
                name="location-continent"
                placeholder="Continent"
                value={formData.location.continent}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.editButtons}>
            <Buttons
              size='medium'
              version='v2'
              onClick={goBackToAdminProfile}
            >
              Cancel Editing
            </Buttons>

            <Buttons 
              size='medium'
              version='v1'
              type="submit"
            >
              Save Changes
            </Buttons>
          </div>
        </form>
      </section>
      </div>

      {showPopup && (
        <CostumPopup
          message={popupMessage}
          onClose={closePopup}
          showButtons={false}
        />
      )}

    </motion.div>
  );
};

export default EditVenue;