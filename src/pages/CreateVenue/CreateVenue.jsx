import React, { useState, useEffect } from 'react';
import styles from './CreateVenue.module.css';
import { headers } from '../../headers';
import { motion } from "framer-motion";
import { VENUE_CREATE } from "../../constants";
import Buttons from '../../components/Buttons/Buttons';
import CostumPopup from '../../components/CostumPopup/CostumPopup';

const CreateVenue = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    maxGuests: 0,
    rating: 0,
    media: [{ url: '', alt: '' }],
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
    },
    termsAccepted: false,
  });

  const [fieldStatus, setFieldStatus] = useState({
    name: null,
    description: null,
    price: null,
    maxGuests: null,
    meta: null,
    media: null,
    location: null,
  });  

  const validateFields = (updatedFormData) => {
    const isValidUrl = (url) => {
      try {
        return Boolean(new URL(url));
      } 
      catch {
        return false;
      }
    };
  
    setFieldStatus({
      name: updatedFormData.name.trim().length > 2,
      description: updatedFormData.description.trim().length > 10,
      price: updatedFormData.price > 0,
      maxGuests: updatedFormData.maxGuests > 0,
      meta: Object.values(updatedFormData.meta).some(Boolean),
      media: updatedFormData.media.every(item => isValidUrl(item.url)),
      location: [
        updatedFormData.location.address,
        updatedFormData.location.city,
        updatedFormData.location.zip,
        updatedFormData.location.country,
        updatedFormData.location.continent,
      ].every(val => val.trim() !== '')
    });
  };  

  const [popup, setPopup] = useState({ isVisible: false, message: '', type: '' });
  const [isTermsPopupVisible, setIsTermsPopupVisible] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let updatedFormData;
  
    if (name === 'meta') {
      const [metaKey, metaValue] = value.split('=');
      updatedFormData = {
        ...formData,
        meta: {
          ...formData.meta,
          [metaKey]: metaValue === 'true' ? checked : !checked
        }
      };
    } 
    else if (name.startsWith('media-')) {
      const parts = name.split('-');
      const index = parseInt(parts[1], 10);
      const field = parts[2];
      const newMedia = [...formData.media];
      newMedia[index][field] = value;
  
      updatedFormData = {
        ...formData,
        media: newMedia
      };
    } 
    else if (name.includes('location')) {
      const field = name.split('-')[1];
      updatedFormData = {
        ...formData,
        location: {
          ...formData.location,
          [field]: value
        }
      };
    } 
    else {
      updatedFormData = {
        ...formData,
        [name]: (name === 'price' || name === 'maxGuests') ? Number(value) : value
      };
    }
  
    setFormData(updatedFormData);
    validateFields(updatedFormData);
  };
  
  const totalFields = Object.keys(fieldStatus).length;
  const validFields = Object.values(fieldStatus).filter(val => val === true).length;
  const progressPercentage = Math.round((validFields / totalFields) * 100);

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

    if (!formData.termsAccepted) {
      setPopup({
        isVisible: true,
        message: 'You must agree to the terms of service before submitting.',
        type: 'error',
      });
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

  useEffect(() => {
    if (popup.isVisible || isTermsPopupVisible) {
      document.body.style.overflow = 'hidden';
    } 
    else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [popup.isVisible, isTermsPopupVisible]);

  const closePopup = () => {
    setPopup({ isVisible: false, message: '', type: '' });
  };

  const openTermsPopup = () => {
    setIsTermsPopupVisible(true);
  };

  const closeTermsPopup = () => {
    setIsTermsPopupVisible(false);
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
        <div className={styles.createPageContent}>
          <div className={styles.leftSection}>
            <div className={styles.leftBorder}>
            <h2>Progress:</h2>
            <div className={styles.progressDivs}>
            <div className={`${styles.step} ${fieldStatus.name === true ? styles.valid : fieldStatus.name === false ? styles.invalid : ''}`}>Venue Name</div>
<div className={`${styles.step} ${fieldStatus.description === true ? styles.valid : fieldStatus.description === false ? styles.invalid : ''}`}>Venue Description</div>
<div className={`${styles.step} ${fieldStatus.price === true ? styles.valid : fieldStatus.price === false ? styles.invalid : ''}`}>Price per Night</div>
<div className={`${styles.step} ${fieldStatus.maxGuests === true ? styles.valid : fieldStatus.maxGuests === false ? styles.invalid : ''}`}>Max Guests</div>
<div className={`${styles.step} ${fieldStatus.meta === true ? styles.valid : fieldStatus.meta === false ? styles.invalid : ''}`}>Meta Tags</div>
<div className={`${styles.step} ${fieldStatus.media === true ? styles.valid : fieldStatus.media === false ? styles.invalid : ''}`}>Venue Media</div>
<div className={`${styles.step} ${fieldStatus.location === true ? styles.valid : fieldStatus.location === false ? styles.invalid : ''}`}>Location</div>
            </div>

<div className={styles.progressBarContainer}>
  <div className={styles.progressBar} style={{ width: `${progressPercentage}%` }}></div>
</div>
            </div>
          </div>
          <div  className={styles.createFormContent}>
          <h1>Create a New Venue</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRow}>
        <div className={styles.fieldGroupName}>
          <label>Venue Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.fieldGroupDesc}>
          <label>Venue Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        </div>
        <div className={styles.formRow}>
        <div className={styles.fieldGroupPrice}>
          <label>Price Per Night</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.fieldGroupGuests}>
          <label>Guest Limit</label>
          <input
            type="number"
            name="maxGuests"
            value={formData.maxGuests}
            onChange={handleChange}
            required
          />
        </div>
        <div className={styles.fieldGroupMeta}>
          <label>Meta Tags</label>
          <div className={styles.metaTags}>
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
        </div>
        <div className={styles.fieldGroupMedia}>
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
                  <Buttons size='small' version='v2' onClick={() => handleDeleteMedia(index)}>
                    Remove
                  </Buttons>
                )}
              </div>
            ))}
            <div className={styles.mediaButtons}>
              <Buttons size='small' onClick={handleAddMedia}>
                +
              </Buttons>
            </div>
          </div>
        <div className={styles.fieldGroupLocation}>
          <label>Venue Location</label>
          <div className={styles.locationInputs}>
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

        <div className={styles.fieldGroupTerms}>
  <input
    type="checkbox"
    id="termsAccepted"
    name="termsAccepted"
    checked={formData.termsAccepted}
    onChange={(e) =>
      setFormData({ ...formData, termsAccepted: e.target.checked })
    }
  />
  <label htmlFor="termsAccepted">
    I agree to the <span className={styles.termsLink} onClick={openTermsPopup}>Terms of Service</span>.
  </label>
</div>

        <Buttons
        size='medium'
        version='v2'
        type="submit"
        >
          Create Venue
        </Buttons>

      </form>
          </div>
        </div>
      </section>

        {popup.isVisible && (
          <CostumPopup
            message={popup.message}
            onClose={closePopup}
            showButtons={false}
          />
        )}

{isTermsPopupVisible && (
  <div className={styles.termsPopupOverlay} onClick={closeTermsPopup}>
    <div className={styles.termsPopup} onClick={(e) => e.stopPropagation()}>
      <h2>Terms of Service</h2>
      <p>
        By using our platform to create and manage venues, you agree to comply with the following terms:
      </p>
      <ul>
        <li>You are responsible for the accuracy and legality of all venue listings you create.</li>
        <li>You must not post any content that is false, misleading, or violates any applicable laws.</li>
        <li>All personal data will be handled in accordance with our Privacy Policy.</li>
        <li>We reserve the right to remove any content or suspend accounts that violate these terms.</li>
        <li>Your continued use of the platform constitutes acceptance of any future updates to these terms.</li>
      </ul>
      <p>
        If you do not agree with any part of these terms, please do not use the platform.
      </p>
      <button onClick={closeTermsPopup}>Close</button>
    </div>
  </div>
)}

</motion.div>
  );
};

export default CreateVenue;