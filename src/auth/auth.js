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
  localStorage.removeItem('username');
  localStorage.removeItem('venueManager');
  
  window.location.href = "/";
}

export const getUserRole = async () => {
  const venueManager = localStorage.getItem('venueManager');

  if (venueManager === 'true') {
    return 'venueManager';
  }

  return 'customer';
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

export const updateProfile = async ({ username, newName, newAvatar, newBio }) => {
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  
  if (!token) {
    throw new Error("Authentication token is missing.");
  }

  const updatedData = {
    name: newName.trim() || username,
    bio: newBio.trim() || undefined,
    avatar: newAvatar.trim() ? { url: newAvatar.trim(), alt: `${newName}'s avatar` } : undefined,
  };

  if (!updatedData.name && !updatedData.bio && !updatedData.avatar) {
    throw new Error("At least one property (username, bio, avatar) must be provided.");
  }

  const endpoint = PROFILES_UPDATE.replace("<name>", username);
  const response = await fetch(endpoint, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Failed to update profile: ${responseText}`);
  }

  return await response.json();
};

