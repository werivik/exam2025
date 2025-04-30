import React, { useState } from 'react';
import styles from './CreateVenue.module.css';
import { headers } from '../../headers';
import { motion } from "framer-motion";
import { VENUE_CREATE } from "../../constants";

const CreateVenue = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        maxGuests: 0,
        media: [
          { url: '', alt: '' },
          { url: '', alt: '' },
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
          continent: ''
        }
      });

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
        .map(item => ({ url: item.url, alt: item.alt })),
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
        console.log('Venue created successfully:', data);
      } 
      else {
        console.error('Error creating venue:', data);
      }
    } 
    catch (error) {
      console.error('Error creating venue:', error);
    }
  };  

  return (
    <motion.div
      className={styles.createVenueContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
        <section className={styles.pageContent}>
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
          {[0, 1, 2].map((index) => (
            <div key={index} className={styles.mediaField}>
              <input
                type="url"
                name={`media-${index}-url`}
                placeholder="Image URL"
                value={formData.media[index].url}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name={`media-${index}-alt`}
                placeholder="Image Alt Text"
                value={formData.media[index].alt}
                onChange={handleChange}
              />
            </div>
          ))}
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
    </motion.div>
  );
};

export default CreateVenue;