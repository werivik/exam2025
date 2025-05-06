import React, { useState, useEffect } from 'react';
import styles from './EditVenue.module.css';
import { VENUE_UPDATE } from '../../constants';
import { headers } from '../../headers';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const EditVenue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

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
        console.error('Token is required!');
        return;
      }

      const response = await fetch(VENUE_UPDATE.replace('<id>', venueId), {
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
        console.error('Failed to fetch venue:', data);
        navigate('/admin-profile');
      }
    } 
    catch (error) {
      console.error('Error fetching venue:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('media-')) {
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
    else if (name === 'meta') {
      const [metaKey, metaValue] = value.split('=');
      setFormData({
        ...formData,
        meta: { ...formData.meta, [metaKey]: metaValue === 'true' },
      });
    } 
    else {
      setFormData({
        ...formData,
        [name]: name === 'price' || name === 'maxGuests' ? Number(value) : value,
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
        .filter((item) => item.url.trim() !== '')
        .map((item) => ({ url: item.url, alt: item.alt })),
    };

    try {
        const response = await fetch(VENUE_UPDATE.replace('<id>', id), {
            method: 'PUT',
            headers: headers(token),
            body: JSON.stringify(transformedFormData),
        });

      const data = await response.json();
      if (response.ok) {
        console.log('Venue updated successfully:', data);
        navigate('/admin-profile');
      } 
      else {
        console.error('Error updating venue:', data);
      }
    } 
    catch (error) {
      console.error('Error updating venue:', error);
    }
  };

  return (
    <motion.div
      className={styles.editVenueContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <section className={styles.pageContent}>
        <h2>Edit Venue</h2>
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
            Save Changes
          </button>
        </form>
      </section>
    </motion.div>
  );
};

export default EditVenue;
