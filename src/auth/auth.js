import { headers } from "../headers";
import { PROFILES_UPDATE, PROFILES_SINGLE } from "../constants";

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
  window.location.href = "/";
}

export const getUserRole = () => {
  const username = localStorage.getItem('username');
  
  if (!username) {
    console.warn('No username found in localStorage');
    return null;
  }

  return fetchUserRole(username);
};

const fetchUserRole = async (username) => {
  try {
    const userProfileUrl = PROFILES_SINGLE.replace("<name>", username);
    const response = await fetch(userProfileUrl, {
      method: 'GET',
      headers: headers(localStorage.getItem('accessToken')),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || 'Failed to fetch user role');
    }

    return data.data?.role || 'guest';
  } 
  
  catch (error) {
    console.error('Error fetching user role:', error);
    return 'guest';
  }
};

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
