import { AUTH_LOGIN, PROFILES_SINGLE } from '../constants';
import { headers } from '../headers';

// Costumer
export async function loginCostumer({ email, password }) {
  const response = await fetch(AUTH_LOGIN, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.errors?.[0]?.message || 'Login failed');
  }

  const data = await response.json();
  return {
    name: data.data.name,
    token: data.data.accessToken,
  };
}

// Venue Manager
export const loginAdmin = async ({ email, password }) => {
  const response = await fetch(AUTH_LOGIN, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.errors?.[0]?.message || 'Admin login failed');
  }

  const data = await response.json();
  const token = data?.data?.accessToken;
  const name = data?.data?.name;

  console.log("Token received:", token);

  if (token) {
    console.log("Saving token to localStorage:", token);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('username', name);
  }

  let venueManager = false;
  if (name && token) {
    const profileRes = await fetch(PROFILES_SINGLE.replace("<name>", name), {
      method: 'GET',
      headers: headers(token),
    });

    const profileData = await profileRes.json();
    venueManager = profileData?.data?.venueManager ?? false;
  }

  return {
    name: name,
    token: token,
    venueManager: venueManager,
  };
};

  