import { headers } from "../headers";
import { PROFILES_UPDATE, BOOKINGS_CREATE } from "../constants";

export function isLoggedIn() {
  return Boolean(localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"));
}

export function login({ accessToken, remember }) {
  (remember ? localStorage : sessionStorage).setItem("accessToken", accessToken);
  window.dispatchEvent(new Event("authchange"));
}

export function logout() {
  localStorage.removeItem("accessToken");
  sessionStorage.removeItem("accessToken");
  window.dispatchEvent(new Event("authchange"));
}

export function getToken() {
  return localStorage.getItem('accessToken');
}

export const updateUserProfile = async (userId, { bio, avatar, banner, venueManager }) => {
  try {
    const response = await fetch(`${PROFILES_UPDATE.replace("<name>", userId)}`, {
      method: 'PUT',
      headers: headers(localStorage.getItem('accessToken')),
      body: JSON.stringify({
        bio,
        avatar: avatar ? { url: avatar.url, alt: avatar.alt } : undefined,
        banner: banner ? { url: banner.url, alt: banner.alt } : undefined,
        venueManager,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update profile');
    }

    const data = await response.json();
    console.log('Profile updated:', data);
    return data;
  } 
  
  catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const handleBookingSubmit = async (checkInDate, checkOutDate, totalGuests, id, setBookingError) => {
  try {
    if (!checkInDate || !checkOutDate) {
      throw new Error("Invalid dates. Please check the date format.");
    }

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (isNaN(checkIn) || isNaN(checkOut)) {
      throw new Error("Invalid dates. Please check the date format.");
    }

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      throw new Error('Invalid dates. Please check the date format.');
    }

    const authToken = getToken();
    if (!authToken) {
      throw new Error('You must be logged in to make a booking.');
    }

    const bookingData = {
      dateFrom: checkIn.toISOString(),
      dateTo: checkOut.toISOString(),
      guests: totalGuests,
      venueId: id,
    };

    const response = await fetch(BOOKINGS_CREATE, {
      method: 'POST',
      headers: headers(authToken),
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      throw new Error('Booking failed. Please try again.');
    }

    const result = await response.json();
    console.log('Booking successful', result);
  } 
  
  catch (error) {
    console.error('Error creating booking:', error);
    setBookingError(error.message);
  }
};

