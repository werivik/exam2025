import { VENUES } from '../../constants';
import { headers } from '../../headers';
import { getToken } from '../../auth/auth';

export const RatingService = {
  getUserRating: (venueId) => {
    try {
      const storedRatings = sessionStorage.getItem('userVenueRatings');
      if (storedRatings) {
        const ratings = JSON.parse(storedRatings);
        return ratings[venueId] || 0;
      }
      return 0;
    } 
    catch (error) {
      console.error('Error retrieving user rating:', error);
      return 0;
    }
  },

  saveUserRating: (venueId, rating) => {
    try {
      const storedRatings = sessionStorage.getItem('userVenueRatings') || '{}';
      const ratings = JSON.parse(storedRatings);
      ratings[venueId] = rating;
      sessionStorage.setItem('userVenueRatings', JSON.stringify(ratings));
    } 
    catch (error) {
      console.error('Error saving user rating locally:', error);
    }
  },

  submitRating: async (venueId, rating) => {
    if (!venueId || rating < 0 || rating > 5) {
      throw new Error('Invalid rating parameters');
    }

    const authToken = getToken();
    if (!authToken) {
      throw new Error('User not authenticated. Please log in.');
    }

    try {
      const response = await fetch(`${VENUES}/${venueId}`, {
        method: 'PUT',
        headers: {
          ...headers(),
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          rating: rating,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update venue rating: ${response.status}`);
      }

      const venueData = await response.json();
      console.log(`Rating for venue ${venueId} updated to ${rating}`);
      
      RatingService.saveUserRating(venueId, rating);

      return {
        success: true,
        data: venueData.data,
        message: 'Rating successfully updated.',
      };
    } 
    catch (error) {
      console.error('Error in submitRating:', error);
      throw error;
    }
  },
};

export default RatingService;