import { AUTH_LOGIN } from '../constants';
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
export async function loginAdmin({ email, password }) {
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

  console.log('Login Admin Data:', data);

  const userData = data.data || data;

  return {
    name: userData.name,
    token: userData.accessToken,
    venueManager: true,
  };
}

  