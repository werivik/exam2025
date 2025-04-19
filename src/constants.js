import { headers } from "../src/headers.js";

const NOROFF_API_URL = "https://v2.api.noroff.dev";

export async function readPosts(accessToken) {
  const options = {
    method: 'GET',
    headers: headers(accessToken)
  };

  try {
    const response = await fetch(`${NOROFF_API_URL}`, options);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data;
  } 
  
  catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
  }
}

/* API */
export const API_KEY = "f7d9660d-4dba-4b16-82c6-1a4669e99612";
export const API_BASE = "https://v2.api.noroff.dev";

/* AUTH */
export const AUTH = `${API_BASE}/auth`;
export const AUTH_LOGIN = `${AUTH}/login`;
export const AUTH_REGISTER = `${AUTH}/register`;
export const AUTH_KEY = `${AUTH}/f7d9660d-4dba-4b16-82c6-1a4669e99612`;

/* Venues */
export const VENUES = `${API_BASE}/holidaze/venues`;
export const VENUE_SINGLE = `${API_BASE}/holidaze/venues/<id>`;
export const VENUE_CREATE = `${API_BASE}/holidaze/venues`;
export const VENUE_UPDATE = `${API_BASE}/holidaze/venues/<id>`;
export const VENUE_DELETE = `${API_BASE}/holidaze/venues/<id>`;

/* Bookings */
export const BOOKINGS_ALL = `${API_BASE}/holidaze/bookings`;
export const BOOKINGS_SINGLE = `${API_BASE}/holidaze/bookings/<id>`;
export const BOOKINGS_CREATE = `${API_BASE}/holidaze/bookings`;
export const BOOKINGS_UPDATE = `${API_BASE}/holidaze/bookings/<id>`;
export const BOOKINGS_DELETE = `${API_BASE}/holidaze/bookings/<id>`;

/* Profiles */
export const PROFILES_ALL = `${API_BASE}/holidaze/profiles`;
export const PROFILES_SINGLE = `${API_BASE}/holidaze/profiles/<name>`;
export const PROFILES_SINGLE_BY_BOOKINGS = `${API_BASE}/holidaze/profiles/<name>/bookings`;
export const PROFILES_SINGLE_BY_VENUES = `${API_BASE}/holidaze/profiles/<name>/venues`;
export const PROFILES_UPDATE = `${API_BASE}/holidaze/profiles/<name>`;

/* Search */
export const PROFILES_SEARCH = `${API_BASE}/holidaze/profiles/search?q=<query>`;
export const VENUES_SEARCH = `${API_BASE}/holidaze/venues/search?q=<query>`;

