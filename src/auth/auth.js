import { headers } from "../headers";
import { PROFILES_UPDATE, PROFILES_SINGLE } from "../constants";

export function getToken() {
  return localStorage.getItem('accessToken');
}

export function isLoggedIn() {
  return Boolean(localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"));
}

export async function login({ accessToken, remember }) {
  (remember ? localStorage : sessionStorage).setItem("accessToken", accessToken);
  const storage = remember ? localStorage : sessionStorage;

  try {
    const username = storage.getItem("username");
    if (username) {
      const role = await fetchUserRole(username);
      storage.setItem("venueManager", role === 'venueManager' ? 'true' : 'false');
    }
  } 
  
  catch (error) {
    console.error("Failed to determine user role during login:", error);
    storage.setItem("venueManager", 'false');
  }

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
  try {
    const response = await fetch(PROFILES_SINGLE, {
      headers: headers(),
    });

    const data = await response.json();
    const { venueManager } = data.data;

    const roleValue = venueManager === true ? 'venueManager' : 'customer';

    sessionStorage.setItem('venueManager', venueManager);
    localStorage.setItem('venueManager', venueManager);

    return roleValue;
  } 
  catch (error) {
    console.error('Error fetching user role:', error);
    return 'guest';
  }
};


export function getVenueManagerStatus() {
  return localStorage.getItem('venueManager') === 'true' || sessionStorage.getItem('venueManager') === 'true';
}

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

    const isVenueManager = data.data?.venueManager;
    const role = isVenueManager ? 'venueManager' : 'customer';
    sessionStorage.setItem(`role-${username}`, role);
    return role;
  } 
  catch (error) {
    console.error('Error fetching user role:', error);
    return 'guest';
  }
};

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
