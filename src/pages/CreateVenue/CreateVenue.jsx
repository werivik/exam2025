import React, { useState } from 'react';
import styles from './CreateVenue.module.css';
import { headers } from '../../headers';
import { motion } from "framer-motion";
import { VENUE_CREATE } from "../../constants";
import CostumPopup from '../../components/CostumPopup/CostumPopup';

const CreateVenue = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    maxGuests: 0,
    rating: 0,
    media: [
      { url: '', alt: '' }
    ],
    meta: {
      wifi: false,
      parking: false,
      breakfast: false,
      pets: false
    },
    location: {
      address: '',
      city: '',
      zip: '',
      country: '',
      continent: '',
      lat: 0,
      lng: 0
    }
  });  

  const [popup, setPopup] = useState({ isVisible: false, message: '', type: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'meta') {
      const [metaKey, metaValue] = value.split('=');
      setFormData({
        ...formData,
        meta: {
          ...formData.meta,
          [metaKey]: metaValue === 'true'
        }
      });
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
        location: {
          ...formData.location,
          [field]: value
        }
      });
    } 
    
    else {
        setFormData({
          ...formData,
          [name]: name === 'price' || name === 'maxGuests'
            ? Number(value)
            : value,
        });
      }      
  };

  const handleAddMedia = () => {
    setFormData(prevState => ({
      ...prevState,
      media: [...prevState.media, { url: '', alt: '' }]
    }));
  };

  const handleDeleteMedia = (index) => {
    if (formData.media.length > 1) {
      const newMedia = [...formData.media];
      newMedia.splice(index, 1);
      setFormData({ ...formData, media: newMedia });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('Token is required!');
      return;
    }
  
    const transformedFormData = {
      ...formData,
      media: formData.media
        .filter(item => item.url.trim() !== '')
        .map(item => ({ url: item.url, alt: item.alt }))
    };    
  
    const dataToSend = transformedFormData;
  
    try {
      const response = await fetch(VENUE_CREATE, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(dataToSend),
      });
  
      const data = await response.json();
      if (response.ok) {
        setPopup({
          isVisible: true,
          message: 'Venue created successfully!',
          type: 'success'
        });
      }
      else {
        setPopup({
          isVisible: true,
          message: `Error creating venue: ${data.message}`,
          type: 'error'
        });
      }
    } 
    catch (error) {
      console.error('Error creating venue:', error);
      setPopup({
        isVisible: true,
        message: 'Something went wrong. Please try again.',
        type: 'error'
      });
    }
  };  

  const closePopup = () => {
    setPopup({ isVisible: false, message: '', type: '' });
  };

  return (
    <motion.div
      className={styles.createVenueContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      <section className={`${styles.pageContent} ${popup.isVisible ? styles.blurred : ''}`}>
      <h2>Create a New Venue</h2>
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
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.fieldGroup}>
          <label>Max Guests</label>
          <input
            type="number"
            name="maxGuests"
            value={formData.maxGuests}
            onChange={handleChange}
            required
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
                  value={media.url}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name={`media-${index}-alt`}
                  placeholder="Image Alt Text"
                  value={media.alt}
                  onChange={handleChange}
                />
                {index > 0 && (
                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleDeleteMedia(index)}
                  >
                    Delete Image
                  </button>
                )}
              </div>
            ))}
            <div className={styles.mediaButtons}>
              <button
                type="button"
                className={styles.addButton}
                onClick={handleAddMedia}
              >
                Add Image
              </button>
            </div>
          </div>

        <div className={styles.fieldGroup}>
          <label>Meta Tags</label>
          <div>
            <label>
              <input
                type="checkbox"
                name="meta"
                value="wifi=true"
                onChange={handleChange}
                checked={formData.meta.wifi}
              />
              Wifi
            </label>
            <label>
              <input
                type="checkbox"
                name="meta"
                value="parking=true"
                onChange={handleChange}
                checked={formData.meta.parking}
              />
              Parking
            </label>
            <label>
              <input
                type="checkbox"
                name="meta"
                value="breakfast=true"
                onChange={handleChange}
                checked={formData.meta.breakfast}
              />
              Breakfast
            </label>
            <label>
              <input
                type="checkbox"
                name="meta"
                value="pets=true"
                onChange={handleChange}
                checked={formData.meta.pets}
              />
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

        <button type="submit" className={styles.submitButton}>
          Create Venue
        </button>
      </form>
        </section>

        {popup.isVisible && (
          <CustomPopup
            message={popup.message}
            onClose={closePopup}
            showButtons={false}
          />
        )}

    </motion.div>
  );
};

export default CreateVenue;