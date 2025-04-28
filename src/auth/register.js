import { AUTH_REGISTER } from '../constants';
import { headers } from '../headers';


// Costumer
export async function registerCostumer(formData) {
    const payload = {
      ...formData,
      credits: 1000,
      venueManager: false,
    };
  
    const response = await fetch(AUTH_REGISTER, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw errorData;
    }
  
    return true;
  }

  // Admin

  export async function registerAdmin(formData) {
    const payload = {
      ...formData,
      venueManager: true,
    };
  
    const response = await fetch(AUTH_REGISTER, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(payload),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.errors?.[0]?.message || 'Registration failed');
    }
  
    const data = await response.json();
    return data;
  }