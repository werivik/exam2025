import { headers } from "../headers";
import { PROFILES_UPDATE, BOOKINGS_CREATE } from "../constants";

export function getToken() {
  return localStorage.getItem('accessToken');
}

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

export const handleBookingSubmit = async (checkInDate, checkOutDate) => {
  try {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      console.warn('No access token found in localStorage');
      alert('You need to log in first.');
      return;
    }

    const response = await fetch(BOOKINGS_CREATE, {
      method: 'POST',
      headers: headers(token),
      body: JSON.stringify({
        dateFrom: checkInDate,
        dateTo: checkOutDate,
        guests,
        venueId,
      }),
    });

    if (!response.ok) {
      const errorResponse = await response.text();
      console.error("Booking submission failed with response:", errorResponse);
      throw new Error(`Booking submission failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Booking submitted successfully:", data);
    alert('Booking successful!');
  } 
  
  catch (error) {
    console.error("Booking API error:", error);
    alert('Booking submission failed. Please try again.');
  }
};