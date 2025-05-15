import { VENUES } from '../../constants';
import { headers } from '../../headers';

export const RatingService = {
  submitRating: async (venueId, rating) => {
    if (!venueId || rating < 0 || rating > 5) {
      throw new Error('Invalid rating parameters');
    }
    
    const authToken = localStorage.getItem('token');
    if (!authToken) {
      throw new Error('User not authenticated');
    }
    
    try {
      const venueResponse = await fetch(`${VENUES}/${venueId}`, {
        method: 'GET',
        headers: headers(),
      });
      
      if (!venueResponse.ok) {
        throw new Error(`Failed to fetch venue data: ${venueResponse.status}`);
      }
      
      const venueData = await venueResponse.json();
      const currentVenue = venueData.data;
      
      const userRatings = JSON.parse(localStorage.getItem('userVenueRatings') || '{}');
      userRatings[venueId] = rating;
      localStorage.setItem('userVenueRatings', JSON.stringify(userRatings));
      
      const updateResponse = await fetch(`${VENUES}/${venueId}`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({
          rating: rating,
        }),
      });
      
      if (!updateResponse.ok) {
        console.warn(`Server rating update failed: ${updateResponse.status}. Using locally stored rating.`);
        
        return {
          success: false,
          data: {
            ...currentVenue,
            rating: rating,
          },
          message: 'Rating saved locally only',
        };
      }
      
      return updateResponse.json();
    } 
    catch (error) {
      console.error('Error in submitRating:', error);
      
      const userRatings = JSON.parse(localStorage.getItem('userVenueRatings') || '{}');
      userRatings[venueId] = rating;
      localStorage.setItem('userVenueRatings', JSON.stringify(userRatings));
      
      throw error;
    }
  },
  
  getUserRating: (venueId) => {
    try {
      const userRatings = JSON.parse(localStorage.getItem('userVenueRatings') || '{}');
      return userRatings[venueId] || null;
    } 
    catch (error) {
      console.error('Error retrieving user rating:', error);
      return null;
    }
  },
  
  hasUserRated: (venueId) => {
    try {
      const userRatings = JSON.parse(localStorage.getItem('userVenueRatings') || '{}');
      return userRatings.hasOwnProperty(venueId);
    } 
    catch (error) {
      console.error('Error checking if user rated venue:', error);
      return false;
    }
  },
  
  getAllUserRatings: () => {
    try {
      return JSON.parse(localStorage.getItem('userVenueRatings') || '{}');
    } 
    catch (error) {
      console.error('Error retrieving all user ratings:', error);
      return {};
    }
  }
};

export default RatingService;