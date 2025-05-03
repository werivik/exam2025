import { headers } from "../headers";
import { PROFILES_SINGLE } from "../constants";

export const handleFavoriteToggle = async (venueId, isAdding) => {
  try {
    const token = localStorage.getItem('accessToken');
    const username = localStorage.getItem('userName');
    console.log('Username stored:', username);

    console.log("Favorite action attempt. Token:", token, "Username:", username);

    if (!token || !username) {
      alert('You must be logged in to favorite a venue.');
      return;
    }

    const method = "PUT";
    const favoritesField = isAdding ? [venueId] : [];

    const endpoint = PROFILES_SINGLE.replace('<name>', username);
    console.log("API Endpoint:", endpoint);
    
    const response = await fetch(endpoint, {
      method,
      headers: headers(token),
      body: JSON.stringify({
        favorites: favoritesField,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Favorite action failed:", data);
      throw new Error(data.errors?.[0]?.message || "Favorite action failed");
    }

    return data;
  } 
  
  catch (error) {
    console.error("Favorite API error:", error);
    alert("Something went wrong. Please try again.");
  }
};
