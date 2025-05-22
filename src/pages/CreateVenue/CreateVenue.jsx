import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreateVenue.module.css';
import { motion } from "framer-motion";
import Buttons from '../../components/Buttons/Buttons';
import CostumPopup from '../../components/CostumPopup/CostumPopup';
import { headers } from '../../headers';
import { VENUE_CREATE } from '../../constants';
import { getToken, isLoggedIn } from '../../auth/auth';

const CreateVenue = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    maxGuests: 0,
    rating: 0,
    media: [{ url: '', alt: '' }],
    meta: { wifi: false, parking: false, breakfast: false, pets: false },
    location: { address: '', city: '', zip: '', country: '', continent: '', lat: 0, lng: 0 },
    isPublic: true,
    bookings: true,
    status: 'published',
    termsAccepted: false,
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const username = localStorage.getItem("username");
  const avatar = JSON.parse(localStorage.getItem("userProfile") || "{}").avatar;

  const [fieldStatus, setFieldStatus] = useState({
    name: null,
    description: null,
    price: null,
    maxGuests: null,
    media: null,
    location: null,
  });

  const [popup, setPopup] = useState({ isVisible: false, message: '', type: '' });
  const [isTermsPopupVisible, setIsTermsPopupVisible] = useState(false);

  const validateFields = (updatedFormData) => {
    const isValidUrl = (url) => {
      if (!url.trim()) return true;
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
      let newValue = value;
      if (name === 'price' || name === 'maxGuests') {
        if (!/^\d*$/.test(newValue)) return;
        newValue = newValue.replace(/^0+(?!$)/, '');

        updatedFormData = {
          ...formData,
          [name]: newValue === '' ? 0 : Number(newValue)
        };
      }
      else {
        updatedFormData = {
          ...formData,
          [name]: newValue
        };
      }
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

const buildVenuePayload = (formData, username, avatar) => {
  const filteredMedia = formData.media.filter(item => item.url.trim() !== '');

  const processedMedia = filteredMedia.map(item => ({
    url: item.url,
    alt: item.alt || 'Venue image'
  }));

  return {
    name: formData.name,
    description: formData.description,
    price: Number(formData.price),
    maxGuests: Number(formData.maxGuests),
    rating: Number(formData.rating || 0),
    media: processedMedia,
    meta: formData.meta,
    location: {
      address: formData.location.address,
      city: formData.location.city,
      zip: formData.location.zip,
      country: formData.location.country,
      continent: formData.location.continent,
      lat: Number(formData.location.lat || 0),
      lng: Number(formData.location.lng || 0)
    },
    owner: {
      name: username || "",
      avatar: avatar || ""
    },
    isPublic: formData.isPublic === false ? false : true,
    bookings: formData.bookings === false ? false : true,
    status: formData.status || "published"
  };
};

function normalizeTitle(title) {
  return title.trim().replace(/\s+/g, ' ');
}

function isValidVenueTitle(title) {
  const cleaned = title.trim();
  const valid = /^[a-zA-Z0-9\s\-_'",\.&!?()]+$/.test(cleaned);
  return valid && cleaned.length > 0;
}

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = getToken();
    if (!isLoggedIn() || !token) {
      setPopup({
        isVisible: true,
        message: 'Authentication token not found. Please log in again.',
        type: 'error',
      });
      setLoading(false);
      return;
    }

    const cleanedTitle = normalizeTitle(formData.name);

    if (!isValidVenueTitle(cleanedTitle)) {
      alert("Venue title can only contain letters and spaces.");
      return;
    }

    if (!formData.termsAccepted) {
      setPopup({
        isVisible: true,
        message: 'You must agree to the terms of service before submitting.',
        type: 'error',
      });
      setLoading(false);
      return;
    }

    const allFieldsValid = Object.values(fieldStatus).every(status => status === true);
    if (!allFieldsValid) {
      setPopup({
        isVisible: true,
        message: 'Please fill in all required fields correctly.',
        type: 'error',
      });
      setLoading(false);
      return;
    }

    const venuePayload = buildVenuePayload(formData, username, avatar);

    try {
      const response = await fetch(VENUE_CREATE, {
        method: 'POST',
        headers: headers(token),
        body: JSON.stringify(venuePayload),
      });

      const data = await response.json();

      if (response.ok && data.data && data.data.id) {
        setPopup({
          isVisible: true,
          message: 'Venue created successfully!',
          type: 'success'
        });
        setTimeout(() => {
          navigate(`/venues/${data.data.id}`);
        }, 2000);
      }
      else {
        const errorMsg = data.errors
          ? data.errors.map(err => err.message).join(', ')
          : data.message || 'Failed to create the venue';
        setPopup({
          isVisible: true,
          message: `Error: ${errorMsg}`,
          type: 'error'
        });
      }
    }
    catch (error) {
      setPopup({
        isVisible: true,
        message: 'An unexpected error occurred. Please try again.',
        type: 'error'
      });
    }
    finally {
      setLoading(false);
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

  useEffect(() => {
    if (popup.isVisible && popup.type === 'success') {
      const timer = setTimeout(() => {
        setPopup({ isVisible: false, message: '', type: '' });
        navigate('/admin-profile');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [popup, navigate]);

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
              <div className={`${styles.step} ${styles.valid}`}>Meta Tags (Optional)</div>
              <div className={`${styles.step} ${fieldStatus.media === true ? styles.valid : fieldStatus.media === false ? styles.invalid : ''}`}>Venue Media</div>
              <div className={`${styles.step} ${fieldStatus.location === true ? styles.valid : fieldStatus.location === false ? styles.invalid : ''}`}>Location</div>
            </div>

            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar} style={{ width: `${progressPercentage}%` }}></div>
            </div>
            </div>
          </div>
          <div className={styles.createFormContent}>
          <h1>Create a New Venue</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formRowFirst}>
        <div className={styles.fieldGroupName}>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
          <div className={styles.fieldGroupPrice}>
          <label>Price Per Night</label>
          <input
            type="text"
            name="price"
            value={formData.price.toString()}
            onChange={handleChange}
            required
            inputMode="numeric"
          />
        </div>
                <div className={styles.fieldGroupGuests}>
          <label>Guest Limit</label>
          <input
            type="text"
            name="maxGuests"
            value={formData.maxGuests.toString()}
            onChange={handleChange}
            required
            inputMode="numeric"
          />
        </div>
        </div>
        <div className={styles.formRowSecond}>
        <div className={styles.fieldGroupDesc}>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
<div className={styles.fieldGroupMeta}>
  <label>Meta Tags (Optional)</label>
  <div className={styles.metaTags}>
    <div>
      <input
        type="checkbox"
        id="wifi"
        name="meta"
        value="wifi=true"
        onChange={handleChange}
        checked={formData.meta.wifi}
      />
      <label htmlFor="wifi">Wifi</label>
    </div>    
    <div>
      <input
        type="checkbox"
        id="parking"
        name="meta"
        value="parking=true"
        onChange={handleChange}
        checked={formData.meta.parking}
      />
      <label htmlFor="parking">Parking</label>
    </div>
    <div>
      <input
        type="checkbox"
        id="breakfast"
        name="meta"
        value="breakfast=true"
        onChange={handleChange}
        checked={formData.meta.breakfast}
      />
      <label htmlFor="breakfast">Breakfast</label>
    </div>
    <div>
      <input
        type="checkbox"
        id="pets"
        name="meta"
        value="pets=true"
        onChange={handleChange}
        checked={formData.meta.pets}
      />
      <label htmlFor="pets">Pets</label>
    </div>
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
                  required={index === 0}
                />
                <input
                  type="text"
                  name={`media-${index}-alt`}
                  placeholder="Image Alt Text"
                  value={media.alt}
                  onChange={handleChange}
                />
                {index > 0 && (
                  <Buttons size='removeMedia' onClick={() => handleDeleteMedia(index)}>
                    Remove
                  </Buttons>
                )}
              </div>
            ))}
            <div className={styles.mediaButtons}>
              <Buttons size='addMedia' onClick={handleAddMedia}>
                + Add Media
              </Buttons>
            </div>
          </div>
        <div className={styles.fieldGroupLocation}>
          <label>Location</label>
          <div className={styles.locationInputs}>
            <input
              type="text"
              name="location-continent"
              placeholder="Continent"
              value={formData.location.continent}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="location-country"
              placeholder="Country"
              value={formData.location.country}
              onChange={handleChange}
              required
            />
              <input
              type="text"
              name="location-city"
              placeholder="City"
              value={formData.location.city}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="location-address"
              placeholder="Address"
              value={formData.location.address}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="location-zip"
              placeholder="ZIP"
              value={formData.location.zip}
              onChange={handleChange}
              required
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
            I agree to the <span className={styles.termsLink} onClick={openTermsPopup}>Terms of Service.</span>
          </label>
        </div>
        <Buttons
          size='medium'
          version='v1'
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Venue'}
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
            hideBars={false}
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
      <Buttons size='close' onClick={closeTermsPopup}><i class="fa-solid fa-x"></i></Buttons>
    </div>
  </div>
)}

</motion.div>
  );
};

export default CreateVenue;