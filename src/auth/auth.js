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
  sessionStorage.removeItem('username');
  sessionStorage.removeItem('venueManager');
  
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
  const cachedRole = sessionStorage.getItem(`role-${username}`);
  if (cachedRole) return cachedRole;

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

    const role = data.data?.role || 'guest';
    sessionStorage.setItem(`role-${username}`, role);
    return role;
  } 
  catch (error) {
    console.error('Error fetching user role:', error);
    return 'guest';
  }
};

/* Profile Update */
export const updateProfile = async ({ username, newName, newAvatar }) => {
  try {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Authentication token is missing.');
    }

    if (!username) {
      throw new Error('Username is required to update profile.');
    }

    const endpoint = PROFILES_UPDATE.replace('<name>', username);

    const updatedData = {
      name: newName.trim() || username,
      avatar: newAvatar.trim()
        ? { url: newAvatar.trim(), alt: `${newName || username}'s avatar` }
        : undefined,
    };

    if (!updatedData.name && !updatedData.avatar) {
      throw new Error('At least one field (name or avatar) must be provided.');
    }

    const response = await fetch(endpoint, {
      method: 'PUT',
      headers: headers(token),
      body: JSON.stringify(updatedData),
    });

    console.log('Profile update request sent with:', updatedData);
    console.log('Response status:', response.status);

    const result = await response.json();
    console.log('Response body:', result);

    if (!response.ok) {
      throw new Error(result.errors?.[0]?.message || 'Failed to update profile.');
    }

    if (updatedData.name && updatedData.name !== username) {
      localStorage.setItem('username', updatedData.name);
      sessionStorage.setItem('username', updatedData.name);
    }

    return result;
  } 
  
  catch (error) {
    console.error('Error in updateProfile:', error);
    throw error;
  }
};
